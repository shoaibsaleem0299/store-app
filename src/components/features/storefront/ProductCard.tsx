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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.base_images?.[0] || "";
  const minPrice = product.price_range?.min ?? 0;
  const maxPrice = product.price_range?.max ?? 0;
  const hasMultiplePrices = minPrice !== maxPrice;

  // Simple mapping of standard color names to CSS background color classes
  const colorMap: Record<string, string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    black: "bg-black",
    white: "bg-white border border-gray-300",
    gray: "bg-gray-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg border border-border bg-background">
        <div className="relative aspect-square w-full overflow-hidden bg-secondary flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-xs uppercase tracking-wider font-semibold">No Image</span>
            </div>
          )}
        </div>
        <CardHeader className="p-4 space-y-1">
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {product.brand}
            </p>
          )}
          <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-2 pt-0">
          <p className="text-sm font-semibold text-foreground">
            {hasMultiplePrices ? (
              <>
                {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
              </>
            ) : (
              formatCurrency(minPrice)
            )}
          </p>
        </CardContent>
        {product.colors && product.colors.length > 0 && (
          <CardFooter className="px-4 pb-4 pt-0 flex gap-1">
            {product.colors.slice(0, 5).map((color, i) => {
              const bgClass = colorMap[color.toLowerCase()] || "bg-muted";
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${bgClass}`}
                  title={color}
                />
              );
            })}
            {product.colors.length > 5 && (
              <span className="text-xs text-muted-foreground font-semibold pl-1">
                +{product.colors.length - 5}
              </span>
            )}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
