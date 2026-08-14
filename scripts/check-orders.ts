
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const orderCount = await prisma.order.count();
        console.log(`Total orders in DB: ${orderCount}`);

        const orders = await prisma.order.findMany({
            include: { items: { include: { product: true } } }
        });

        console.log(`Found ${orders.length} orders.`);
        orders.forEach(order => {
            console.log(`Order ${order.id}: Status=${order.status}`);
            order.items.forEach(item => {
                console.log(` - Item: ${item.product.name} (Shop ID: ${item.product.shopId})`);
            });
        });

        const products = await prisma.product.findMany();
        console.log(`Found ${products.length} products.`);
        products.forEach(p => console.log(` - Product ${p.name} (Shop ID: ${p.shopId})`));
    } catch (error) {
        console.error("Error in script:", error);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
