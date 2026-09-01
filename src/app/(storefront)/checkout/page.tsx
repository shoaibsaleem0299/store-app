"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchCart, clearCart } from "@/store/slices/cart.slice";
import { orderService } from "@/services-client/order.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceTag } from "@/components/shared/PriceTag";
import { toast } from "sonner";
import Link from "next/link";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  addressLine: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters").default("Pakistan"),
  zipCode: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading: cartLoading } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [submitting, setSubmitting] = useState(false);

  // useEffect(() => {
  //   if (!cartLoading && items.length === 0) {
  //     // toast.error("Your cart is empty. Add items before checking out.");
  //     router.push("/");
  //   }
  // }, [items, cartLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      addressLine: "",
      city: "",
      state: "",
      country: "Pakistan",
      zipCode: "",
      phone: "",
    },
  });

  const subtotal = items.reduce((acc: number, item: any) => {
    const price = item.variants?.promo_price ?? item.variants?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  const onSubmit = async (values: CheckoutFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_address: values,
          cartItems: items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order.");

      toast.success("Order placed successfully!");
      dispatch(clearCart());

      // Redirect to the newly created tracking page
      router.push(`/track-order/${data.orderId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>Enter the address where you want your order delivered</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      {...register("fullName")}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive font-medium">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="03001234567"
                      {...register("phone")}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine">Street Address</Label>
                  <Input
                    id="addressLine"
                    placeholder="House No, Street Name, Sector"
                    {...register("addressLine")}
                    className={errors.addressLine ? "border-destructive" : ""}
                  />
                  {errors.addressLine && (
                    <p className="text-xs text-destructive font-medium">{errors.addressLine.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Lahore"
                      {...register("city")}
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive font-medium">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Province / State</Label>
                    <Input
                      id="state"
                      placeholder="Punjab"
                      {...register("state")}
                      className={errors.state ? "border-destructive" : ""}
                    />
                    {errors.state && (
                      <p className="text-xs text-destructive font-medium">{errors.state.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="54000"
                      {...register("zipCode")}
                      className={errors.zipCode ? "border-destructive" : ""}
                    />
                    {errors.zipCode && (
                      <p className="text-xs text-destructive font-medium">{errors.zipCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="Pakistan"
                      {...register("country")}
                      className={errors.country ? "border-destructive" : ""}
                    />
                    {errors.country && (
                      <p className="text-xs text-destructive font-medium">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border pt-4">
                <Button type="submit" className="w-full py-6 font-semibold" disabled={submitting}>
                  {submitting ? "Placing Order..." : "Confirm & Place Order"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center gap-4 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.variants?.sku_code}</p>
                      <p className="text-xs text-muted-foreground font-semibold">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-foreground">
                      {((item.variants?.promo_price ?? item.variants?.price ?? 0) * item.quantity).toLocaleString(
                        "en-PK",
                        { style: "currency", currency: "PKR" }
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
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
                <div className="border-t border-border pt-3 flex justify-between text-base font-bold text-foreground">
                  <span>Grand Total</span>
                  <span>{total.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
