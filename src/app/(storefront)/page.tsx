"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProducts } from "@/store/slices/product.slice";
import { ProductCard } from "@/components/features/storefront/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Featured Products</h1>
        <p className="text-muted-foreground">Browse our catalog of premium items</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (!products || products.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h2 className="text-xl font-semibold">No products found</h2>
          <p className="text-muted-foreground">Check back later for new inventory!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
