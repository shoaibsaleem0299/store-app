"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { updateCartQty, removeFromCart } from "@/store/slices/cart.slice";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/shared/PriceTag";
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CartDrawer() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.cart);
  const [open, setOpen] = useState(false);

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => {
    const price = item.variants?.promo_price ?? item.variants?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  const handleUpdateQty = (id: number, currentQty: number, delta: number, stockQty: number) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      dispatch(removeFromCart(id));
    } else if (nextQty <= stockQty) {
      dispatch(updateCartQty({ id, quantity: nextQty }));
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative p-2 hover:bg-secondary">
          <ShoppingBag className="w-6 h-6 text-foreground" />
          {totalItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {totalItemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background border-l border-border">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Shopping Cart
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-30" />
              <p className="text-sm font-medium">Your cart is empty</p>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 border border-border rounded-lg bg-card text-card-foreground">
                <div className="w-20 h-20 bg-secondary rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold line-clamp-1">{item.variants?.sku_code}</h4>
                    <PriceTag
                      price={item.variants?.price ?? 0}
                      promoPrice={item.variants?.promo_price}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
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
            ))
          )}
        </div>
        {items.length > 0 && (
          <SheetFooter className="border-t border-border pt-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between text-base font-bold text-foreground">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</span>
            </div>
            <Link href="/checkout" className="w-full" onClick={() => setOpen(false)}>
              <Button className="w-full py-6 font-semibold">Proceed to Checkout</Button>
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
