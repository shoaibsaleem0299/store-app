"use client";

import { useEffect, useState, use } from "react";
import { BaseApiClientService } from "@/services-client/baseApiService";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const adminOrderService = new BaseApiClientService<any>("admin/orders");
        const res: any = await adminOrderService.getById(id);
        setOrder(res);
      } catch (error) {
        toast.error("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button onClick={() => router.back()} className="mt-4" variant="outline">
          Back
        </Button>
      </div>
    );
  }

  const addr = order.shipping_address || {};
  const items = order.order_items || [];

  const subtotal = items.reduce((acc: number, item: any) => acc + Number(item.unit_price) * item.quantity, 0);
  const deliveryFee = Number(order.total_amount) - subtotal;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Order Details
            <Badge variant="outline" className="text-sm font-mono uppercase bg-secondary/50">
              {order.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            {order.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground font-medium">Name:</span>
              <span className="col-span-2 font-semibold">{addr.full_name || "Guest"}</span>

              <span className="text-muted-foreground font-medium">Email:</span>
              <span className="col-span-2">{addr.email || "-"}</span>

              <span className="text-muted-foreground font-medium">Phone:</span>
              <span className="col-span-2">{addr.phone || "-"}</span>

              <span className="text-muted-foreground font-medium">Buyer ID:</span>
              <span className="col-span-2 font-mono text-xs">{order.buyer_id}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground font-medium">Address:</span>
              <span className="col-span-2">{addr.address_line || "-"}</span>

              <span className="text-muted-foreground font-medium">City:</span>
              <span className="col-span-2">{addr.city || "-"}</span>

              <span className="text-muted-foreground font-medium">State:</span>
              <span className="col-span-2">{addr.state || "-"}</span>

              <span className="text-muted-foreground font-medium">ZIP Code:</span>
              <span className="col-span-2">{addr.zip_code || "-"}</span>

              <span className="text-muted-foreground font-medium">Country:</span>
              <span className="col-span-2">{addr.country || "Pakistan"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.variants?.image_url && (
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                          <Image src={item.variants.image_url} alt="Variant" fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {item.variants?.product?.name || `Variant ID: ${item.variant_id}`}
                        </span>
                        {item.variants?.variant_option_values?.length > 0 && (
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {item.variants.variant_option_values
                              .map((vov: any) => `${vov.option_value?.option_type?.name}: ${vov.option_value?.value}`)
                              .join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">{item.variants?.sku_code}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(item.unit_price).toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
                  </TableCell>
                  <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                  <TableCell className="text-right font-bold">
                    {(Number(item.unit_price) * item.quantity).toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-1/3 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="uppercase font-semibold">{order.payment_type || "COD"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="uppercase font-semibold">{order.payment_status}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {subtotal.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Price</span>
                <span className="font-medium">
                  {deliveryFee > 0 ? deliveryFee.toLocaleString("en-PK", { style: "currency", currency: "PKR" }) : "Free"}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="font-bold text-xl text-primary">
                  {Number(order.total_amount).toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
