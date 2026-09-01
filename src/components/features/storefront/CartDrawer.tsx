"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  updateCartQty,
  removeFromCart,
} from "@/store/slices/cart.slice";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/shared/PriceTag";
import { formatCurrency } from "@/utils/formatCurrency";

import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";

export function CartDrawer() {
  const dispatch = useDispatch<AppDispatch>();

  const { items, loading } = useSelector(
    (state: RootState) => state.cart
  );

  const [open, setOpen] = useState(false);

  const totalItemCount = items.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  const subtotal = items.reduce((acc: number, item: any) => {
    const price =
      item.variants?.promo_price ??
      item.variants?.price ??
      0;

    return acc + price * item.quantity;
  }, 0);

  const handleUpdateQty = (
    id: number,
    currentQty: number,
    delta: number,
    stockQty: number
  ) => {
    const nextQty = currentQty + delta;

    if (nextQty <= 0) {
      dispatch(removeFromCart(id));
      return;
    }

    if (nextQty <= stockQty) {
      dispatch(
        updateCartQty({
          id,
          quantity: nextQty,
        })
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* CART BUTTON */}
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-all hover:bg-slate-100 active:scale-95"
        >
          <ShoppingBag
            className="h-5 w-5"
            strokeWidth={1.8}
          />

          {totalItemCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[9px] font-bold text-white">
              {totalItemCount > 99
                ? "99+"
                : totalItemCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className=" flex h-full w-full flex-col border-l border-slate-200 !bg-white  p-0 sm:max-w-md">

        {/* HEADER */}
        <SheetHeader className="border-b border-slate-300 px-6 py-5 ">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <ShoppingBag className="h-5 w-5 text-slate-700" />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-base font-bold text-slate-900">
                  Shopping Cart
                </span>

                <span className="text-xs font-normal text-slate-500">
                  {totalItemCount === 0
                    ? "Your cart is empty"
                    : `${totalItemCount} ${totalItemCount === 1
                      ? "item"
                      : "items"
                    } in your cart`}
                </span>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* CART CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-5 ">

          {/* EMPTY STATE */}
          {items.length === 0 && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">

              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <ShoppingBag
                  className="h-9 w-9 text-slate-400"
                  strokeWidth={1.5}
                />
              </div>

              <h3 className="text-base font-semibold text-slate-900">
                Your cart is empty
              </h3>

              <p className="mt-2 max-w-[240px] text-sm leading-6 text-slate-500">
                Looks like you haven't added anything to your
                cart yet.
              </p>

              <Button
                variant="outline"
                className="mt-6 rounded-xl px-6"
                onClick={() => setOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          )}

          {/* CART ITEMS */}
          {items.length > 0 && (
            <div className="space-y-4">
              {items.map((item: any) => {
                const price =
                  item.variants?.promo_price ??
                  item.variants?.price ??
                  0;

                const stockQty =
                  item.variants?.stock_qty ?? 999;

                const itemTotal =
                  price * item.quantity;

                const isMaxStock =
                  item.quantity >= stockQty;

                return (
                  <div
                    key={item.id}
                    className="group flex gap-4 rounded-2xl border border-slate-300 bg-slate-50 p-3 transition-all hover:border-slate-200 hover:shadow-sm"
                  >

                    {/* PRODUCT IMAGE */}
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">

                      {item.variants?.image_url ? (
                        <img
                          src={item.variants.image_url}
                          alt={item.variants.sku_code}
                          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-slate-300" />
                      )}

                    </div>

                    {/* PRODUCT INFO */}
                    <div className="flex min-w-0 flex-1 flex-col">

                      {/* TOP */}
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
                            {item.variants?.sku_code ||
                              "Product"}
                          </h4>

                          <PriceTag
                            price={
                              item.variants?.price ?? 0
                            }
                            promoPrice={
                              item.variants?.promo_price
                            }
                            className="mt-1"
                          />

                        </div>

                        {/* REMOVE */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          onClick={() =>
                            dispatch(
                              removeFromCart(item.id)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                      </div>

                      {/* BOTTOM */}
                      <div className="mt-auto flex items-end justify-between pt-3">

                        {/* QUANTITY */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">

                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition hover:bg-white hover:shadow-sm"
                            onClick={() =>
                              handleUpdateQty(
                                item.id,
                                item.quantity,
                                -1,
                                stockQty
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="flex w-8 items-center justify-center text-sm font-semibold text-slate-800">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={isMaxStock}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() =>
                              handleUpdateQty(
                                item.id,
                                item.quantity,
                                1,
                                stockQty
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>

                        </div>

                        {/* ITEM TOTAL */}
                        <div className="text-right">

                          <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Total
                          </span>

                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(itemTotal)}
                          </span>

                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t border-slate-300 bg-white px-6 py-5">

            {/* SUBTOTAL */}
            <div className="mb-4 flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Subtotal
                </p>

                <p className="mt-1 text-xs text-slate-700">
                  Shipping and taxes calculated at checkout
                </p>
              </div>

              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(subtotal)}
              </span>

            </div>

            {/* CHECKOUT */}
            <Link
              href="/checkout"
              className="block w-full"
              onClick={() => setOpen(false)}
            >
              <Button className="group h-12 w-full rounded-xl text-sm font-semibold">
                Proceed to Checkout

                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            {/* CONTINUE SHOPPING */}
            <button
              type="button"
              className="mt-3 w-full text-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              onClick={() => setOpen(false)}
            >
              Continue Shopping
            </button>

          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}