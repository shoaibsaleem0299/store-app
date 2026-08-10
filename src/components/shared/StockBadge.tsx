import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  stockQty: number;
}

export function StockBadge({ stockQty }: StockBadgeProps) {
  if (stockQty <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stockQty <= 5) {
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50 dark:bg-amber-950/20">
        Low Stock ({stockQty} left)
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-emerald-600 border-emerald-650 bg-emerald-50 dark:bg-emerald-950/20">
      In Stock
    </Badge>
  );
}
