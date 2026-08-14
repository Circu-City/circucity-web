'use client';

import { deleteProduct } from "@/app/actions/product";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteProductButton({ productId }: { productId: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-600"
            title="Delete Product"
            disabled={isPending}
            onClick={() => {
                if (confirm("Are you sure you want to delete this product?")) {
                    startTransition(async () => {
                        await deleteProduct(productId);
                    });
                }
            }}
        >
            {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <Trash2 className="h-5 w-5" />
            )}
        </Button>
    );
}
