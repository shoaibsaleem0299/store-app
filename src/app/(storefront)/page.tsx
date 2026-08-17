"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProducts } from "@/store/slices/product.slice";
import { ProductCard } from "@/components/features/storefront/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight } from "lucide-react";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[85vh] bg-secondary overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Fashion Model" 
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-12 w-full">
            <div className="max-w-2xl text-foreground">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-4 opacity-80">
                GLQ Citanavidias
              </p>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-6">
                Daily Winds<br/>For Colors
              </h1>
              <p className="text-sm md:text-base opacity-80 max-w-md leading-relaxed font-medium mb-10">
                Out yo iller cinest e table. Andepaily as grifel, whore your pesiping llps.
              </p>
              <button className="bg-foreground text-background px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold hover:bg-foreground/80 transition-colors">
                Son Toe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Listing Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">Sox off to idenes</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Tlescho medelis fiore a nageristefulnating: slaseyi. dorod stope by moera.
            Rocesse oring thaiged hicape. to tines lvaly ile onaly learch forkills shop throundy.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="flex flex-col items-center space-y-2 pt-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (!products || products.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <div className="w-24 h-24 border border-border flex items-center justify-center text-muted-foreground/30 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold">No collections found</h2>
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Please check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Visit Site Button (for effect) */}
      <div className="fixed bottom-8 left-8 z-50">
        <div className="bg-background/40 backdrop-blur-md border border-border px-6 py-3 rounded-full shadow-sm flex items-center gap-3 cursor-pointer hover:bg-background/60 transition-colors">
           <ArrowUpRight className="w-5 h-5 text-foreground" />
           <span className="font-medium text-foreground text-lg">Visit site</span>
        </div>
      </div>
    </div>
  );
}
