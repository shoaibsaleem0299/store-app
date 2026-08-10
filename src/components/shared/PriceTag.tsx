import { formatCurrency } from "@/utils/formatCurrency";

interface PriceTagProps {
  price: number;
  promoPrice?: number | null;
  className?: string;
}

export function PriceTag({ price, promoPrice, className = "" }: PriceTagProps) {
  const hasPromo = promoPrice !== undefined && promoPrice !== null && promoPrice < price;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hasPromo ? (
        <>
          <span className="font-bold text-primary">{formatCurrency(promoPrice!)}</span>
          <span className="text-sm text-muted-foreground line-through">{formatCurrency(price)}</span>
        </>
      ) : (
        <span className="font-bold text-foreground">{formatCurrency(price)}</span>
      )}
    </div>
  );
}
