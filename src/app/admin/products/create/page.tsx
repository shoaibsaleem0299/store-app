"use client";

import { ProductForm } from "@/components/features/admin/ProductForm";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
      </div>
      <ProductForm onSuccess={() => router.push('/admin/products')} />
    </div>
  );
}
