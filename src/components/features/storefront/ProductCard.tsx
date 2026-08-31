import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    brand?: string;
    base_images: string[];
    price_range: {
      min: number;
      max: number;
    };
    colors: string[];
    total_stock?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const images = product.base_images || [];
  const imageUrl = images[0] || "";

  const minPrice = product.price_range?.min ?? 0;
  const stock = product.total_stock ?? 0;

  const isOutOfStock = stock <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block h-full"
    >
      <article
        className="
          relative flex h-full flex-col
    overflow-hidden rounded-[28px]
    border border-[#E8E4DE]
    bg-[#F3F0EB] p-2.5
    shadow-[0_8px_30px_rgba(60,50,40,0.07)]
    transition-all duration-500
    hover:-translate-y-2
    hover:shadow-[0_22px_50px_rgba(60,50,40,0.14)]
        "
      >
        {/* ================= IMAGE ================= */}
        <div
          className="
           relative aspect-[1/1.03]
    overflow-hidden rounded-[21px]
    bg-[#E9E5DF]
          "
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className={`
                h-full w-full
                object-cover
                transition-transform duration-700
                ease-out
                group-hover:scale-[1.04]
                ${isOutOfStock ? "grayscale opacity-60" : ""}
              `}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-slate-300" />
            </div>
          )}

          {/* Dark subtle gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />

          {/* ================= BEST SELLER ================= */}
          {!isOutOfStock && (
            <div
              className="
                absolute left-4 top-4
                rounded-full
                bg-white/90
                px-2 py-1
                text-[10px]
                font-semibold
                tracking-wide
                text-slate-800
                shadow-sm
                backdrop-blur-md
              "
            >
              Best Seller
            </div>
          )}

          {/* ================= BRAND ================= */}
          {product.brand && (
            <div
              className="
                absolute right-4 top-4
                flex h-6 w-6
                items-center justify-center
                rounded-full
                bg-white
                shadow-md
              "
            >
              <span
                className="
                  max-w-[32px]
                  truncate
                  text-[6px]
                  font-black
                  uppercase
                  tracking-tight
                  text-black
                "
              >
                {product.brand}
              </span>
            </div>
          )}

          {/* ================= IMAGE DOTS ================= */}
          {images.length > 1 && (
            <div
              className="
                absolute bottom-3.5 left-1/2
                flex -translate-x-1/2
                items-center gap-1
                rounded-full
                bg-black/10
                px-2 py-1
                backdrop-blur-sm
              "
            >
              {images.slice(0, 5).map((_, index) => (
                <span
                  key={index}
                  className={`
                    rounded-full
                    transition-all duration-300
                    ${index === 0
                      ? "h-1.5 w-4 bg-white"
                      : "h-1.5 w-1.5 bg-white/60"
                    }
                  `}
                />
              ))}
            </div>
          )}

          {/* Out of stock */}
          {isOutOfStock && (
            <div
              className="
                absolute inset-0
                flex items-center justify-center
                bg-white/20
                backdrop-blur-[2px]
              "
            >
              <span
                className="
                  rounded-full
                  bg-black px-4 py-2
                  text-[11px]
                  font-bold uppercase
                  tracking-wider text-white
                "
              >
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-4">
          {/* Product name */}
          <h3
            className="
              line-clamp-1
              text-[17px]
              font-extrabold
              tracking-[-0.02em]
              text-slate-950
            "
          >
            {product.name}
          </h3>

          {/* Subtitle */}
          <p
            className="
              mt-1
              text-[14px]
              font-medium
              text-slate-600
            "
          >
            Own the {product.brand || "Style"}
          </p>

          {/* Description */}
          <p
            className="
              mt-2
              line-clamp-2
              max-w-[95%]
              text-[12.5px]
              font-medium
              leading-[1.45]
              text-slate-600
            "
          >
            {product.description ||
              "Step into classic style with premium quality and timeless comfort."}
          </p>

          {/* ================= BOTTOM ================= */}
          <div
            className="
              mt-auto
              flex items-center
              justify-between
              gap-3
              pt-5
            "
          >
            {/* Price */}
            <div
              className="
                rounded-full
                bg-[#E7E3DD]
                px-4 py-2
                shadow-sm
              "
            >
              <span
                className="
                   text-[17px]
        font-extrabold
        tracking-tight
        text-[#171717]
                "
              >
                {formatCurrency(minPrice)}
              </span>
            </div>

            {/* Buy Button */}
            {!isOutOfStock ? (
              <div
                className="
                 flex items-center gap-2
        rounded-full
        bg-[#171717]
        px-4 py-2
        text-[13px]
        font-semibold
        text-[#F3F0EB]
        shadow-md
        transition-all duration-300
        group-hover:bg-[#2B2926]
        group-hover:shadow-lg
                "
              >
                Buy Now

                <span
                  className="
                     flex h-5 w-5
          items-center justify-center
          rounded-full
          bg-[#F3F0EB]
          text-[#171717]
          transition-transform duration-300
          group-hover:rotate-45
                  "
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            ) : (
              <div
                className="
                  rounded-full
                  bg-[#DDD9D3]
                  px-4 py-2
                  text-[12px]
                  font-semibold
                  text-[#77716A]
                "
              >
                Unavailable
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
