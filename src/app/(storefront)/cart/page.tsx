"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { updateCartQty, removeFromCart } from "@/store/slices/cart.slice";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/shared/PriceTag";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.cart);

  const subtotal = items.reduce((acc, item) => {
    const price = item.variants?.promo_price ?? item.variants?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);
  const shipping = subtotal > 5000 ? 0 : 250; // free shipping over 5000 PKR
  const total = subtotal + shipping;

  const handleUpdateQty = (id: number, currentQty: number, delta: number, stockQty: number) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      dispatch(removeFromCart(id));
    } else if (nextQty <= stockQty) {
      dispatch(updateCartQty({ id, quantity: nextQty }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/">
          <Button className="w-full">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-lg bg-card text-card-foreground gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-secondary rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
                  {item.variants?.image_url ? (
                    <img
                      src={item.variants.image_url}
                      alt={item.variants.sku_code}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-8 h-8 opacity-25" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{item.variants?.sku_code}</h3>
                  <PriceTag
                    price={item.variants?.price ?? 0}
                    promoPrice={item.variants?.promo_price}
                    className="mt-1"
                  />
                  {item.variants?.stock_qty <= 5 && (
                    <p className="text-xs text-amber-600 font-semibold mt-1">
                      Only {item.variants.stock_qty} left in stock!
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-none"
                    onClick={() => handleUpdateQty(item.id, item.quantity, -1, item.variants?.stock_qty ?? 999)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-none"
                    onClick={() => handleUpdateQty(item.id, item.quantity, 1, item.variants?.stock_qty ?? 999)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm min-w-[80px] text-right">
                    {((item.variants?.promo_price ?? item.variants?.price ?? 0) * item.quantity).toLocaleString(
                      "en-PK",
                      { style: "currency", currency: "PKR" }
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border h-fit space-y-6">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">
                {subtotal.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">
                {shipping === 0
                  ? "Free"
                  : shipping.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                Add{" "}
                <span className="font-semibold text-primary">
                  {((5000 - subtotal) > 0 ? (5000 - subtotal) : 0).toLocaleString("en-PK", {
                    style: "currency",
                    currency: "PKR",
                  })}
                </span>{" "}
                more to get Free Shipping!
              </p>
            )}
            <div className="border-t border-border pt-4 flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span>{total.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</span>
            </div>
          </div>
          <Link href="/checkout" className="block w-full">
            <Button className="w-full py-6 font-semibold flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
