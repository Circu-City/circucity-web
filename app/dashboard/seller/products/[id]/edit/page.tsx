import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from "@/components/seller/ProductForm";
import { updateProduct } from "@/app/actions/product";
import { getProductImages } from "@/lib/utils";

interface EditProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditProductPage(props: EditProductPageProps) {
    const params = await props.params;
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: {
            shop: true,
            category: true,
        },
    });

    if (!product) {
        notFound();
    }

    // Verify ownership
    if (product.shop.ownerId !== userId) {
        redirect("/dashboard/seller/products");
    }

    const updateAction = updateProduct.bind(null, product.id);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/dashboard/seller/products" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Products
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Edit Product
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Update your product information and carbon footprint details.
                        </p>
                    </div>
                </div>

                <ProductForm
                    action={updateAction}
                    initialData={{
                        name: product.name,
                        description: product.description,
                        price: Number(product.price),
                        inventory: product.inventory,
                        weight: product.weight,
                        category: product.category,
                        images: getProductImages(product.images),
                        status: product.status as 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'SOLD',
                        co2Saved: product.co2Saved
                    }}
                    submitLabel="Update Product"
                    redirectTo="/dashboard/seller/products"
                // On success, the action revalidates, we might not need explicit redirect if the form stays, 
                // but usually we want to go back or show success. 
                // Since it's a server component rendering a client form, we can't pass a router.push callback easily 
                // unless we wrap it or handle it in the form. 
                // The form has an onSuccess prop, but we can't pass a server-side redirect function.
                // We'll rely on the form handling state or the user clicking "Back".
                // Actually, let's let the user verify the changes.
                />
            </div>
        </div>
    );
}
