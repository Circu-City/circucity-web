'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { classifyTypeFromText } from "@/lib/complementary-pairings";
import { searchEmissionFactors, estimateEmissions } from "@/lib/climatiq";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const RAG_URL = process.env.RAG_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';
const RAG_KEY = process.env.RAG_API_KEY || 'CircuCity-RAG-2024-1a2b3c4d5e6f7g8h9i10j';

async function notifyRagSync() {
  try {
    await Promise.all([
      fetch(`${RAG_URL}/sync/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': RAG_KEY },
        body: JSON.stringify({ trigger: 'product_change', timestamp: new Date().toISOString() }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {}),
      fetch('http://localhost:3000/api/admin/sync-rag', {
        signal: AbortSignal.timeout(10000),
      }).catch(() => {}),
    ]);
  } catch {}
}

export type ProductState = {
    message?: string;
    errors?: {
        name?: string[];
        description?: string[];
        price?: string[];
        inventory?: string[];
        category?: string[];
        imageUrl?: string[];
    };
    success?: boolean;
};

async function saveImageFromBase64(dataUrl: string): Promise<string> {
    if (!dataUrl.startsWith('data:image/')) return dataUrl;
    try {
        const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) return dataUrl;
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64 = matches[2];
        const buffer = Buffer.from(base64, 'base64');
        if (buffer.length > 8 * 1024 * 1024) return dataUrl;

        const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const saveDirs = [
            join(process.cwd(), 'public', 'uploads'),
            join(process.cwd(), '.next', 'standalone', 'public', 'uploads'),
        ];
        if (existsSync('/var/www/circucity_web')) {
            saveDirs.unshift(join('/var/www/circucity_web', 'uploads'));
        }

        for (const dir of saveDirs) {
            try {
                await mkdir(dir, { recursive: true });
                await writeFile(join(dir, filename), buffer);
            } catch {}
        }

        return `/api/uploads?file=${filename}`;
    } catch { return dataUrl; }
}

export async function createProduct(prevState: ProductState, formData: FormData): Promise<ProductState> {
    const { userId } = await auth();

    if (!userId) {
        return { message: "Unauthorized" };
    }

    // specific validation logic or Zod could go here
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    // Handle price: remove '$', ensure it's a valid number string for Decimal
    const priceRaw = formData.get("price") as string;
    const basePrice = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
    const inventory = parseInt(formData.get("inventory") as string);
    const categoryName = formData.get("category") as string;
    const imageUrl = await saveImageFromBase64(formData.get("imageUrl") as string);
    const co2Saved = parseFloat(formData.get("co2Saved") as string) || 0.0;
    const weight = parseFloat(formData.get("weight") as string);

    console.log("Create Product Action Recieved:", {
        name,
        category: categoryName,
        weight,
        co2SavedFromForm: co2Saved
    });

    // Basic server-side validation
    if (!name || !description || isNaN(basePrice) || isNaN(inventory) || !categoryName) {
        return { message: "Please fill in all required fields." };
    }

    // Store exact price entered by seller
    const finalPrice = basePrice;

    // 1. Get or create Shop + ensure User exists
    let shop = await prisma.shop.findUnique({
        where: { ownerId: userId },
    });

    if (!shop) {
        try {
            const clerkUser = await currentUser().catch(() => null);
            const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `user-${userId}@circucity.com`;
            const name = `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || 'Seller';

            await prisma.user.upsert({
                where: { id: userId },
                create: { id: userId, email, name, role: 'SELLER' },
                update: { email, name },
            });

            shop = await prisma.shop.create({
                data: { ownerId: userId, name: `${name}'s Shop`, status: 'ACTIVE' },
            });
        } catch (e: any) {
            return { message: "Could not create shop: " + (e.message || 'Unknown error') };
        }
    }

    let finalCo2Saved = co2Saved;

    // Automatic Fallback: Calculate CO2 if not provided
    if (finalCo2Saved === 0) {
        try {
            // 1. Find best emission factor
            let factors = await searchEmissionFactors(`${categoryName} ${name}`);
            if (factors.length === 0) factors = await searchEmissionFactors(categoryName);

            // 2. Estimate
            if (factors.length > 0) {
                // Prefer weight-based
                let factor = factors.find(f => f.unit_type === 'Weight') || factors[0];

                const weightVal = parseFloat(formData.get("weight") as string);

                if (weightVal && !isNaN(weightVal)) {
                    // Check if factor is weight based, otherwise we can't really estimate using weight unless we have price context which we do
                    // But for simplicity in this fallback, we might struggle if it's Money based.
                    // Let's rely on factor unit type.
                    let unit = 'kg';
                    let amount = weightVal;

                    if (factor.unit_type === 'Money') {
                        // If we only found a money factor, use price
                        // We use basePrice here as that reflects the goods value better than the marked up price? 
                        if (!isNaN(basePrice)) {
                            amount = basePrice;
                            unit = 'SEK'; // Changed to SEK
                        }
                    }

                    const estimate = await estimateEmissions(factor.id, amount, unit, factor.unit_type);
                    if (estimate) {
                        // 90% savings assumption for used goods
                        finalCo2Saved = estimate.co2e * 0.9;
                    }
                }
            }
        } catch (error) {
            console.error("Auto-calculation failed:", error);
            // Continue without crashing, just saving 0
        }
    }

    try {
        // 2. Find or Create Category
        // Using connectOrCreate relative to the product creation or separately
        // Since we need the ID, let's do upsert or findFirst
        // Actually, let's let Prisma handle it within the create if possible, or just upsert the category first.
        // Prisma's `connectOrCreate` is great here.

        await prisma.product.create({
            data: {
                name,
                description,
                price: finalPrice, // Store the final price including fee
                inventory,
                status: (formData.get("status") as "ACTIVE" | "DRAFT") || "ACTIVE",
                co2Saved: finalCo2Saved,
                weight: weight && !isNaN(weight) ? weight : null,
                images: imageUrl ? [imageUrl] : [],
                shop: {
                    connect: { id: shop.id }
                },
                category: {
                    connectOrCreate: {
                        where: { name: categoryName },
                        create: { name: categoryName }
                    }
                },
                attributes: { type: classifyTypeFromText(name, description, categoryName) }
            },
        });

        revalidatePath("/dashboard/seller/products");
        notifyRagSync().catch(() => {});
    } catch (error) {
        return { message: "Failed to create product. Please try again.", success: false };
    }

    return { message: "Product created successfully!", success: true };
}

export async function updateProduct(
    id: string,
    prevState: ProductState,
    formData: FormData
): Promise<ProductState> {
    const { userId } = await auth();

    if (!userId) {
        return { message: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceRaw = formData.get("price") as string;
    const basePrice = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
    const inventory = parseInt(formData.get("inventory") as string);
    const categoryName = formData.get("category") as string;
    const imageUrl = await saveImageFromBase64(formData.get("imageUrl") as string);
    const co2Saved = parseFloat(formData.get("co2Saved") as string) || 0.0;
    const weight = parseFloat(formData.get("weight") as string);
    const status = (formData.get("status") as "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "SOLD") || "ACTIVE";

    if (!name || !description || isNaN(basePrice) || isNaN(inventory) || !categoryName) {
        return { message: "Please fill in all required fields." };
    }

    // Store exact price entered by seller
    const finalPrice = basePrice;

    // Verify ownership
    const product = await prisma.product.findUnique({
        where: { id },
        include: { shop: true }
    });

    if (!product || product.shop.ownerId !== userId) {
        return { message: "Product not found or unauthorized." };
    }

    let finalCo2Saved = co2Saved;

    // Recalculate CO2 if weight/category changed and no manual override provided (logic similar to create)
    // For now, rely on what's passed or keep existing if 0?
    // If co2Saved is 0 (meaning frontend didn't calc), and we have weight, maybe try to calc?
    // Or just trust the form data. If 0, it updates to 0.

    // If user didn't trigger calc in frontend, let's try to preserve existing if seemingly unchanged?
    // But detecting "unchanged" is hard. Let's try to calc if 0, like in create.
    if (finalCo2Saved === 0) {
        try {
            let factors = await searchEmissionFactors(`${categoryName} ${name}`);
            if (factors.length === 0) factors = await searchEmissionFactors(categoryName);

            if (factors.length > 0) {
                let factor = factors.find(f => f.unit_type === 'Weight') || factors[0];
                const weightVal = parseFloat(formData.get("weight") as string);

                // Logic sync with createProduct
                if (weightVal && !isNaN(weightVal)) {
                    let unit = 'kg';
                    let amount = weightVal;

                    if (factor.unit_type === 'Money') {
                        if (!isNaN(basePrice)) {
                            amount = basePrice;
                            unit = 'SEK'; // Changed to SEK
                        }
                    }

                    const estimate = await estimateEmissions(factor.id, amount, unit, factor.unit_type);
                    if (estimate) {
                        finalCo2Saved = estimate.co2e * 0.9;
                    }
                }
            }
        } catch (error) {
            console.error("Auto-calculation failed during update:", error);
        }
    }

    try {
        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: finalPrice, // Store final price
                inventory,
                status,
                co2Saved: finalCo2Saved,
                weight: weight && !isNaN(weight) ? weight : null,
                images: imageUrl ? [imageUrl] : [], // Overwrites images list with single image for now
                category: {
                    connectOrCreate: {
                        where: { name: categoryName },
                        create: { name: categoryName }
                    }
                }
            },
        });

        revalidatePath("/dashboard/seller/products");
        revalidatePath(`/dashboard/seller/products/${id}/edit`);
        notifyRagSync().catch(() => {});
    } catch (error) {
        console.error("Update product error:", error);
        return { message: "Failed to update product.", success: false };
    }

    return { message: "Product updated successfully!", success: true };
}

export async function deleteProduct(id: string): Promise<ProductState> {
    const { userId } = await auth();

    if (!userId) {
        return { message: "Unauthorized", success: false };
    }

    const product = await prisma.product.findUnique({
        where: { id },
        include: { shop: true }
    });

    if (!product || product.shop.ownerId !== userId) {
        return { message: "Product not found or unauthorized.", success: false };
    }

    try {
        await prisma.product.delete({
            where: { id },
        });

        revalidatePath("/dashboard/seller/products");
        return { message: "Product deleted successfully!", success: true };
    } catch (error) {
        return { message: "Failed to delete product.", success: false };
    }
}
