import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    brand?: string;
    base_images: string[];
    price_range: { min: number; max: number };
    colors: string[];
    total_stock?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.base_images?.[0] || "";
  const minPrice = product.price_range?.min ?? 0;
  const maxPrice = product.price_range?.max ?? 0;
  const hasMultiplePrices = minPrice !== maxPrice;
  const isOutOfStock = product.total_stock !== undefined && product.total_stock <= 0;

  return (
    <Link href={`/products/${product.id}`} className="group block w-full">
      <div className="flex flex-col items-center">
        {/* Image Container - Aspect 3/4 (Portrait) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary mb-5">
          {isOutOfStock && (
            <div className="absolute top-2 right-2 z-10 bg-foreground text-background text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              Out of Stock
            </div>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${isOutOfStock ? "opacity-60 grayscale" : ""}`}
            />
          ) : (
            <div className={`flex flex-col items-center justify-center h-full text-muted-foreground ${isOutOfStock ? "opacity-60" : ""}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>

        {/* Text Content - Centered */}
        <div className="text-center space-y-1.5 px-2">
          <h3 className="font-serif text-xl font-bold text-foreground line-clamp-1 transition-colors">
            {product.name}
          </h3>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold line-clamp-1">
              {product.brand || product.description.slice(0, 30)}
            </p>
            <p className="text-xs font-bold text-foreground">
              {hasMultiplePrices ? (
                <>
                  {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
                </>
              ) : (
                formatCurrency(minPrice)
              )}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
