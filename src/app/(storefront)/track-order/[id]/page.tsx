"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle2, Truck, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const response = await axios.get(`/api/track-order/${id}`);
        setOrder(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load order tracking information.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrackingData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">
          {error || "We couldn't find an order with that tracking number. Please check your link and try again."}
        </p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const items = order.order_items || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + Number(item.unit_price) * item.quantity, 0);
  const deliveryFee = Number(order.total_amount) - subtotal;
  const addr = order.shipping_address || {};

  // Status timeline logic
  const statuses = ["pending", "processing", "shipped", "delivered"];
  const currentStatusIndex = statuses.indexOf(order.status?.toLowerCase()) !== -1 ? statuses.indexOf(order.status.toLowerCase()) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Track Your Order</h1>
        <p className="text-muted-foreground font-mono">Order #{order.id.split("-")[0].toUpperCase()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tracking Timeline & Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/20 pb-4">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Status Update</span>
                <Badge variant="outline" className="uppercase bg-background px-3 py-1 text-sm font-semibold text-primary">
                  {order.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              {/* Responsive Progress Stepper */}
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 rounded-full hidden sm:block"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full hidden sm:block transition-all duration-500" style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}></div>
                
                <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                  {statuses.map((s, idx) => {
                    const isCompleted = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    return (
                      <div key={s} className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10 group">
                        {/* Mobile track line connecting vertical items */}
                        {idx !== statuses.length - 1 && (
                           <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-secondary sm:hidden"></div>
                        )}
                        {idx < currentStatusIndex && (
                           <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-primary sm:hidden"></div>
                        )}

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-background transition-colors ${isCompleted ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30"></div>}
                        </div>
                        <div className="flex flex-col sm:items-center">
                          <span className={`text-sm font-bold uppercase tracking-wider ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {s}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border/50">
                    {item.variants?.image_url ? (
                      <Image src={item.variants.image_url} alt="Product" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Package /></div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">
                      {item.variants?.product?.name || `Variant ${item.variants?.sku_code}`}
                    </h3>
                    
                    {item.variants?.variant_option_values?.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.variants.variant_option_values
                          .map((vov: any) => `${vov.option_value?.option_type?.name}: ${vov.option_value?.value}`)
                          .join(" | ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-medium">Qty: {item.quantity}</p>
                      <p className="font-semibold">
                        {Number(item.unit_price).toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
          <Card className="border-border/50 shadow-sm bg-secondary/10">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{subtotal.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{deliveryFee > 0 ? deliveryFee.toLocaleString("en-PK", { style: "currency", currency: "PKR" }) : "Free"}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl text-primary">{Number(order.total_amount).toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</span>
              </div>
              
              <div className="rounded-md bg-secondary/40 p-4 mt-6">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Payment Method</p>
                <p className="text-sm font-medium">{order.payment_type?.toUpperCase() || "COD"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p className="font-semibold text-foreground">{addr.full_name}</p>
                <p>{addr.address_line}</p>
                <p>{addr.city}, {addr.state} {addr.zip_code}</p>
                <p>{addr.country || "Pakistan"}</p>
                <p className="pt-2">Phone: {addr.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
