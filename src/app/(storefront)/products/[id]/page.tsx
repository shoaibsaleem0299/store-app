"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productService } from "@/services-client/product.service";
import { VariantSelector } from "@/components/features/storefront/VariantSelector";
import { PriceTag } from "@/components/shared/PriceTag";
import { StockBadge } from "@/components/shared/StockBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addToCart } from "@/store/slices/cart.slice";
import { toast } from "sonner";
import { Plus, Minus, ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    productService
      .getById(id)
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        toast.error("Failed to load product details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a variant first.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart.");
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      await dispatch(
        addToCart({
          variant_id: selectedVariant.id,
          quantity,
        })
      ).unwrap();
      toast.success("Added to cart successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link href="/">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const baseImage = product.base_images?.[0] || "";
  const displayImage = selectedVariant?.image_url || baseImage;

  // Determine base price range
  const prices = product.variants?.map((v: any) => Number(v.promo_price || v.price)) || [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const hasMultiplePrices = minPrice !== maxPrice;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Product Image */}
        <div className="bg-secondary rounded-xl overflow-hidden aspect-square flex items-center justify-center border border-border">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <ShoppingBag className="w-16 h-16 opacity-30 mb-2" />
              <span>No Image Available</span>
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.brand && (
              <p className="text-sm text-primary uppercase font-bold tracking-widest">{product.brand}</p>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{product.name}</h1>
          </div>

          <div className="pb-4 border-b border-border">
            {selectedVariant ? (
              <div className="flex items-center gap-4">
                <PriceTag
                  price={selectedVariant.price}
                  promoPrice={selectedVariant.promo_price}
                  className="text-2xl"
                />
                <StockBadge stockQty={selectedVariant.stock_qty} />
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {hasMultiplePrices ? (
                    <>
                      {minPrice.toLocaleString("en-PK", { style: "currency", currency: "PKR" })} -{" "}
                      {maxPrice.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
                    </>
                  ) : (
                    minPrice.toLocaleString("en-PK", { style: "currency", currency: "PKR" })
                  )}
                </p>
                <p className="text-xs text-muted-foreground font-semibold">Select options to see variant price and stock</p>
              </div>
            )}
          </div>

          {product.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</h3>
              <p className="text-foreground text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Variant Selector */}
          {product.option_types && product.option_types.length > 0 && (
            <VariantSelector
              optionTypes={product.option_types}
              variants={product.variants || []}
              onVariantSelected={setSelectedVariant}
            />
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold tracking-wide text-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-none"
                  disabled={quantity <= 1 || (selectedVariant && selectedVariant.stock_qty <= 0)}
                  onClick={() => setQuantity(quantity - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-none"
                  disabled={selectedVariant && quantity >= selectedVariant.stock_qty}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full py-6 font-semibold flex items-center justify-center gap-2"
              disabled={
                (product.option_types?.length > 0 && !selectedVariant) ||
                (selectedVariant && selectedVariant.stock_qty <= 0) ||
                adding
              }
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5" />
              {adding ? "Adding to Cart..." : selectedVariant && selectedVariant.stock_qty <= 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
