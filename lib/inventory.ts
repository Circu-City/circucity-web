import prisma from '@/lib/prisma';

// Inventory is only decremented in the Stripe webhook, which runs after the card is
// charged. Validation alone therefore cannot stop two buyers from both passing the
// check on the last unit and both paying. A reservation is taken here, under a row
// lock on the product, before the Stripe session exists.
//
// Reservations expire on a timer rather than relying on a webhook to clean them up.
// If `checkout.session.expired` never arrives, the hold lapses and the stock comes
// back on its own. The alternative -- decrementing inventory at session creation --
// loses stock permanently whenever a webhook is missed.

/** Stripe's minimum session lifetime is 30 minutes; the hold outlives it slightly. */
export const RESERVATION_TTL_MS = 35 * 60 * 1000;
export const STRIPE_SESSION_TTL_MS = 30 * 60 * 1000;

export class InventoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InventoryError';
    }
}

type ReservationItem = { productId: string; quantity: number };

/**
 * Hold stock for every line, or nothing at all. Throws InventoryError with a
 * buyer-readable message when a line cannot be satisfied; the transaction rolls back,
 * so a partially reserved cart is impossible.
 */
export async function reserveInventory(
    items: ReservationItem[],
    reservationId: string
): Promise<void> {
    if (!items.length) return;

    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);

    // Lock products in a stable order. Two carts holding the same two products in
    // opposite orders would otherwise be able to deadlock against each other.
    const ordered = [...items].sort((a, b) => a.productId.localeCompare(b.productId));

    await prisma.$transaction(
        async (tx) => {
            for (const item of ordered) {
                // FOR UPDATE serialises every concurrent reservation of this product,
                // which is what closes the last-unit race.
                const rows = await tx.$queryRaw<
                    { id: string; name: string; status: string; inventory: number }[]
                >`SELECT id, name, status, inventory FROM Product WHERE id = ${item.productId} FOR UPDATE`;

                const product = rows[0];
                if (!product) {
                    throw new InventoryError(`Product ${item.productId} not found`);
                }
                if (product.status !== 'ACTIVE') {
                    throw new InventoryError(`"${product.name}" is no longer available.`);
                }

                const heldRows = await tx.$queryRaw<{ held: bigint | number | null }[]>`
                    SELECT COALESCE(SUM(quantity), 0) AS held
                    FROM CheckoutReservation
                    WHERE productId = ${item.productId}
                      AND status = 'ACTIVE'
                      AND expiresAt > NOW(3)`;

                // MySQL returns SUM() as DECIMAL, which Prisma surfaces as BigInt.
                const held = Number(heldRows[0]?.held ?? 0);
                const available = product.inventory - held;

                if (available < item.quantity) {
                    throw new InventoryError(
                        available > 0
                            ? `Only ${available} left of "${product.name}". Please reduce the quantity.`
                            : `"${product.name}" is out of stock.`
                    );
                }

                await tx.checkoutReservation.create({
                    data: {
                        reservationId,
                        productId: item.productId,
                        quantity: item.quantity,
                        expiresAt,
                    },
                });
            }
        },
        { timeout: 15000 }
    );
}

/** Payment completed: the webhook decrements real inventory, so the hold must stop counting. */
export async function consumeReservations(reservationId: string): Promise<number> {
    const { count } = await prisma.checkoutReservation.updateMany({
        where: { reservationId, status: 'ACTIVE' },
        data: { status: 'CONSUMED' },
    });
    return count;
}

/** Session expired, or was never created: return the stock immediately. */
export async function releaseReservations(reservationId: string): Promise<number> {
    const { count } = await prisma.checkoutReservation.updateMany({
        where: { reservationId, status: 'ACTIVE' },
        data: { status: 'RELEASED' },
    });
    return count;
}

/** Stock a buyer can actually take right now, for display and pre-checks. */
export async function getAvailableInventory(productIds: string[]): Promise<Map<string, number>> {
    const available = new Map<string, number>();
    if (!productIds.length) return available;

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, inventory: true, status: true },
    });

    const holds = await prisma.checkoutReservation.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds }, status: 'ACTIVE', expiresAt: { gt: new Date() } },
        _sum: { quantity: true },
    });
    const heldBy = new Map(holds.map((h) => [h.productId, h._sum.quantity ?? 0]));

    for (const p of products) {
        const free = p.status !== 'ACTIVE' ? 0 : p.inventory - (heldBy.get(p.id) ?? 0);
        available.set(p.id, Math.max(0, free));
    }
    return available;
}
