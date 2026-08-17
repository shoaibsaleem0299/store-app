"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/features/admin/ProductForm";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
export default function EditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Assuming your API returns the product details matching the form's required format
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          // You may need to adjust this depending on the exact shape of your API response:
          const productData = data.product || data.data || data;
          setInitialData(productData);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load product");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id]);

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      ) : (
        <ProductForm
          initialData={initialData}
          onSuccess={() => router.push('/admin/products')}
        />
      )}
    </div>
  );
}
