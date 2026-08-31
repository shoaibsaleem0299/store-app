"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { productService } from "@/services-client/product.service";
import { VariantSelector } from "@/components/features/storefront/VariantSelector";
import { ProductCard } from "@/components/features/storefront/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

import { AppDispatch, RootState } from "@/store/store";
import { addToCart } from "@/store/slices/cart.slice";
import { fetchProducts } from "@/store/slices/product.slice";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const { items: allProducts } = useSelector(
    (state: RootState) => state.product
  );

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState<any>(undefined);
  const [previewVariant, setPreviewVariant] = useState<any>(undefined);

  const [activeImage, setActiveImage] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    productService
      .getById(id)
      .then((data) => {
        setProduct(data);

        if (data.base_images?.length > 0) {
          setActiveImage(data.base_images[0]);
        }

        if (
          data.variants?.length === 1 &&
          (!data.option_types || data.option_types.length === 0)
        ) {
          setSelectedVariant(data.variants[0]);
        }
      })
      .catch(() => {
        toast.error("Failed to load product details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  /* =========================================================
     LOAD RELATED PRODUCTS
  ========================================================= */

  useEffect(() => {
    if (allProducts.length === 0) {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, allProducts.length]);

  /* =========================================================
     ADD TO CART
  ========================================================= */

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

    if (selectedVariant.stock_qty <= 0) {
      toast.error("This product is out of stock.");
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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F1]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <Skeleton className="mb-6 h-4 w-28 bg-[#E8E4DE]" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[460px_minmax(0,1fr)]">
            <Skeleton className="h-[520px] w-full rounded-[22px] bg-[#E8E4DE]" />

            <div className="space-y-5 pt-4">
              <Skeleton className="h-5 w-24 bg-[#E8E4DE]" />
              <Skeleton className="h-9 w-4/5 bg-[#E8E4DE]" />
              <Skeleton className="h-5 w-32 bg-[#E8E4DE]" />
              <Skeleton className="h-8 w-36 bg-[#E8E4DE]" />
              <Skeleton className="h-20 w-full bg-[#E8E4DE]" />
              <Skeleton className="h-12 w-full bg-[#E8E4DE]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F5F1] px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E9E5DF]">
            <ShoppingBag className="h-7 w-7 text-slate-400" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">
            Product Not Found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            The product you are looking for does not exist or has been
            removed.
          </p>

          <Link href="/">
            <button className="mt-6 rounded-full bg-[#171717] px-6 py-3 text-sm font-bold text-white hover:bg-[#2B2926]">
              Back to Shop
            </button>
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     IMAGES
  ========================================================= */

  const allImages = [...(product.base_images || [])];

  product.variants?.forEach((v: any) => {
    if (v.image_url && !allImages.includes(v.image_url)) {
      allImages.push(v.image_url);
    }
  });

  const displayImage = activeImage || allImages[0] || "";

  /* =========================================================
     PRICE
  ========================================================= */

  const prices =
    product.variants?.map((v: any) =>
      Number(v.promo_price || v.price)
    ) || [];

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const currentPrice = selectedVariant
    ? Number(selectedVariant.promo_price || selectedVariant.price)
    : minPrice;

  const originalPrice = selectedVariant?.promo_price
    ? Number(selectedVariant.price)
    : currentPrice;

  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100
      )
      : 0;

  /* =========================================================
     STOCK
  ========================================================= */

  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock_qty || 0), 0) || 0;
  const stock =
    selectedVariant?.stock_qty ??
    product.total_stock ??
    totalStock;

  const isOutOfStock = stock <= 0;

  /* =========================================================
     RELATED
  ========================================================= */

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  /* =========================================================
     TABS
  ========================================================= */

  const tabs = [
    { id: "details", label: "Details" },
    { id: "materials", label: "Materials" },
    { id: "size", label: "Size & Fit" },
    { id: "shipping", label: "Shipping & Returns" },
  ];

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F7F5F1] pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div className="flex items-center gap-2 py-5 text-[11px]">
          <Link
            href="/"
            className="font-medium text-slate-400 transition-colors hover:text-slate-900"
          >
            Shop
          </Link>

          <ChevronRight className="h-3 w-3 text-slate-300" />

          <span className="max-w-[220px] truncate font-semibold text-slate-600">
            {product.name}
          </span>
        </div>

        {/* ===================================================
            MAIN PRODUCT AREA
        =================================================== */}

        <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">

          {/* =================================================
              GALLERY
          ================================================= */}

          <div className="flex w-full gap-3 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)]">

            {/* Thumbnails */}

            <div className="flex w-[52px] shrink-0 flex-col gap-2">
              {allImages.slice(0, 6).map((img, index) => {
                const isActive = displayImage === img;

                return (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`
                      h-[52px]
                      w-[52px]
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      bg-[#E9E5DF]
                      transition-all
                      ${isActive
                        ? "ring-1 ring-[#171717] ring-offset-1"
                        : "opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>

            {/* Main Image */}

            <div
              className="
                group
                relative
                h-[500px]
                w-full
                flex-1
                shrink-0
                overflow-hidden
                rounded-[22px]
                bg-[#E9E5DF]
                lg:h-full
              "
            >
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="
                    h-full
                    w-full
                    object-contain
                    transition-transform
                    duration-500
                    group-hover:scale-[1.02]
                  "
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-14 w-14 text-slate-300" />
                </div>
              )}

              {/* New Arrival */}

              <div className="absolute left-4 top-4 rounded-full bg-white px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-700 shadow-sm">
                New Arrival
              </div>

              {/* Wishlist */}

              {/* <button
                type="button"
                onClick={() => setLiked(!liked)}
                aria-label="Wishlist"
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-slate-700
                  shadow-sm
                  transition-transform
                  hover:scale-105
                "
              >
                <Heart
                  className={`h-4 w-4 ${liked
                    ? "fill-red-500 text-red-500"
                    : ""
                    }`}
                />
              </button> */}

              {/* Image Dots */}

              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/20 px-2.5 py-1.5 backdrop-blur">
                  {allImages.slice(0, 5).map((img, index) => (
                    <span
                      key={index}
                      className={`
                        h-1.5 rounded-full transition-all
                        ${img === displayImage
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/60"
                        }
                      `}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              PRODUCT INFO
          ================================================= */}

          <div className="min-w-0 pt-1 lg:pt-2">

            {/* Brand / Stock */}

            <div className="mb-3 flex items-center gap-2.5">
              <span className="rounded-full bg-[#E6E1DB] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
                {product.brand || "Premium"}
              </span>

              {isOutOfStock ? (
                <span className="text-[10px] font-bold text-red-500">
                  Out of Stock
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  In Stock
                </span>
              )}
            </div>

            {/* Title */}

            <h1 className="max-w-xl text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#171717] md:text-[32px]">
              {product.name}
            </h1>

            {/* Rating */}

            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-3.5 w-3.5 fill-[#171717] text-[#171717]"
                  />
                ))}
              </div>

              <span className="text-xs font-bold text-slate-700">
                4.8
              </span>

              <span className="text-xs text-slate-400">
                (128 reviews)
              </span>
            </div>

            {/* Price */}

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className="text-[24px] font-extrabold tracking-tight text-[#171717]">
                {currentPrice.toLocaleString("en-US", {
                  style: "currency",
                  currency: "PKR",
                })}
              </span>

              {originalPrice > currentPrice && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {originalPrice.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </span>

                  <span className="rounded-full bg-[#171717] px-2.5 py-1 text-[9px] font-bold text-white">
                    {discountPercent}% OFF
                  </span>
                </>
              )}

              {!selectedVariant &&
                prices.length > 1 &&
                minPrice !== maxPrice && (
                  <span className="text-[10px] text-slate-400">
                    starting price
                  </span>
                )}
            </div>

            {/* Description */}

            <p className="mt-4 max-w-[520px] text-[13px] leading-5.5 text-slate-500">
              {product.description ||
                "Designed for everyday comfort and timeless style. Crafted from premium materials with attention to detail."}
            </p>

            <div className="my-5 h-px bg-[#E1DDD7]" />

            {/* =================================================
                VARIANTS
            ================================================= */}

            {product.option_types?.length > 0 && (
              <div className="mb-6">
                <VariantSelector
                  optionTypes={product.option_types}
                  variants={product.variants || []}
                  onVariantSelected={(variant, preview) => {
                    setSelectedVariant(variant);
                    setPreviewVariant(preview);

                    if (preview?.image_url) {
                      setActiveImage(preview.image_url);
                    } else if (variant?.image_url) {
                      setActiveImage(variant.image_url);
                    }
                  }}
                />
              </div>
            )}

            {/* =================================================
                QUANTITY
            ================================================= */}

            {selectedVariant && stock > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Quantity
                </span>

                <div className="flex items-center rounded-full border border-[#DCD7D1] bg-[#F0ECE6] p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <span className="w-7 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(stock, q + 1)
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                ADD TO CART
            ================================================= */}

            {user?.role !== "admin" ? (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  disabled={
                    (product.option_types?.length > 0 &&
                      !selectedVariant) ||
                    (selectedVariant &&
                      selectedVariant.stock_qty <= 0) ||
                    adding
                  }
                  onClick={handleAddToCart}
                  className="
                    flex
                    h-12
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#171717]
                    text-[13px]
                    font-bold
                    text-white
                    transition-all
                    hover:bg-[#2B2926]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <ShoppingBag className="h-4 w-4" />

                  {adding
                    ? "Adding..."
                    : selectedVariant &&
                      selectedVariant.stock_qty <= 0
                      ? "Out of Stock"
                      : "Add to Cart"}

                  {!adding && !isOutOfStock && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F1EDE7] text-[#171717]">
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  )}
                </button>

                {/* <button
                  type="button"
                  onClick={() => setLiked(!liked)}
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#DCD7D1]
                    bg-[#F1EDE7]
                    transition-colors
                    hover:bg-white
                  "
                >
                  <Heart
                    className={`h-4 w-4 ${liked
                      ? "fill-red-500 text-red-500"
                      : ""
                      }`}
                  />
                </button> */}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                Admin accounts cannot add items to the cart or place
                orders.
              </div>
            )}

            {/* =================================================
                SHIPPING FEATURES
            ================================================= */}

            <div className="mt-6 grid grid-cols-3 border-t border-[#E1DDD7] pt-5">
              <Feature
                icon={<Truck />}
                title="Free Shipping"
                text="Orders $99+"
              />

              <Feature
                icon={<RotateCcw />}
                title="Easy Returns"
                text="30 days"
              />

              <Feature
                icon={<ShieldCheck />}
                title="Secure Pay"
                text="Protected"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            PRODUCT DETAILS
        ===================================================== */}

        <section className="mt-14 border-t border-[#E1DDD7] pt-8">

          {/* Tabs */}

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max gap-7 border-b border-[#E1DDD7]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative
                    pb-3
                    text-[11px]
                    font-bold
                    transition-colors
                    ${activeTab === tab.id
                      ? "text-[#171717]"
                      : "text-slate-400 hover:text-slate-700"
                    }
                  `}
                >
                  {tab.label}

                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#171717]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}

          <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_420px]">

            {/* Info */}

            <div className="rounded-[20px] bg-[#EFEBE5] p-6">

              {activeTab === "details" && (
                <>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Product Details
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#171717]">
                    Made for everyday life.
                  </h2>

                  <p className="mt-3 max-w-xl text-[12px] leading-5.5 text-slate-500">
                    {product.description ||
                      "Crafted from high-quality materials, this piece combines everyday comfort with a clean modern aesthetic."}
                  </p>

                  <div className="mt-5 grid max-w-xl grid-cols-2 gap-2.5">
                    <InfoItem
                      title="Fit"
                      value="Modern fit"
                    />

                    <InfoItem
                      title="Style"
                      value="Everyday essential"
                    />

                    <InfoItem
                      title="Quality"
                      value="Premium finish"
                    />

                    <InfoItem
                      title="Design"
                      value="Minimal & timeless"
                    />
                  </div>
                </>
              )}

              {activeTab === "materials" && (
                <>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Materials
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#171717]">
                    Premium materials.
                  </h2>

                  <p className="mt-3 max-w-xl text-[12px] leading-5.5 text-slate-500">
                    Carefully selected materials provide a comfortable
                    feel while maintaining durability through everyday
                    use.
                  </p>

                  <div className="mt-5 space-y-2.5">
                    <InfoLine text="Premium quality construction" />
                    <InfoLine text="Soft and comfortable finish" />
                    <InfoLine text="Built for everyday wear" />
                    <InfoLine text="Durable stitching and details" />
                  </div>
                </>
              )}

              {activeTab === "size" && (
                <>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Size Guide
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#171717]">
                    Find your perfect fit.
                  </h2>

                  <p className="mt-3 max-w-xl text-[12px] leading-5.5 text-slate-500">
                    Designed with a comfortable modern silhouette.
                    Choose your usual size for the intended fit.
                  </p>

                  <div className="mt-5 max-w-xl overflow-hidden rounded-xl bg-white">
                    <div className="grid grid-cols-3 border-b border-slate-100 px-4 py-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      <span>Size</span>
                      <span>Chest</span>
                      <span>Length</span>
                    </div>

                    {["S", "M", "L", "XL"].map((size) => (
                      <div
                        key={size}
                        className="grid grid-cols-3 border-b border-slate-100 px-4 py-2.5 text-[11px] font-semibold text-slate-700 last:border-0"
                      >
                        <span>{size}</span>
                        <span>Standard</span>
                        <span>Regular</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "shipping" && (
                <>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Delivery
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#171717]">
                    Shipping & returns.
                  </h2>

                  <div className="mt-5 space-y-3">
                    <InfoLine text="Free shipping on orders over $99" />
                    <InfoLine text="Fast and secure delivery" />
                    <InfoLine text="30-day easy return policy" />
                    <InfoLine text="Secure checkout & payment" />
                  </div>
                </>
              )}
            </div>

            {/* Small Visual */}

            <div className="relative h-[260px] overflow-hidden rounded-[20px] bg-[#D8D3CC] lg:h-full">
              {displayImage && (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-multiply"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

              <div className="absolute bottom-5 left-5">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Designed with purpose
                </p>

                <h3 className="mt-1 max-w-[260px] text-xl font-extrabold tracking-tight text-white">
                  Simple things. Done better.
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RELATED PRODUCTS
        ===================================================== */}

        {relatedProducts.length > 0 && (
          <section className="mt-16">

            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Curated for you
                </p>

                <h2 className="text-xl font-extrabold tracking-tight text-[#171717]">
                  You May Also Like
                </h2>
              </div>

              <Link
                href="/"
                className="hidden items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-black sm:flex"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* =============================================================
   FEATURE
============================================================= */

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#E7E2DC]">
        <div className="h-3.5 w-3.5 text-slate-600 [&>svg]:h-full [&>svg]:w-full">
          {icon}
        </div>
      </div>

      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-700">
        {title}
      </p>

      <p className="mt-0.5 text-[9px] text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* =============================================================
   INFO ITEM
============================================================= */

function InfoItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white px-3.5 py-3">
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-[11px] font-bold text-[#171717]">
        {value}
      </p>
    </div>
  );
}

/* =============================================================
   INFO LINE
============================================================= */

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-700">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5E0D9] text-[9px]">
        ✓
      </span>

      {text}
    </div>
  );
}
