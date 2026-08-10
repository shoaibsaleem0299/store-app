"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, CreditCard, Landmark, CheckCircle, Package } from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
      } else {
        toast.error(json.message || "Failed to load order details.");
      }
    } catch (err) {
      toast.error("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/orders/${id}/pay`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Payment simulated successfully! Stock decremented.");
        await fetchOrderDetails();
      } else {
        toast.error(json.message || "Payment simulation failed.");
      }
    } catch (err: any) {
      toast.error("Failed to process payment.");
    } finally {
      setPaying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The order you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/orders" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to History
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
              <div>
                <CardTitle className="text-xl">Order Details</CardTitle>
                <CardDescription className="text-xs font-mono mt-1">ID: {order.id}</CardDescription>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item SKU</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-sm">{item.variants?.sku_code}</TableCell>
                      <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-right text-sm">
                        {Number(item.unit_price).toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm">
                        {(Number(item.unit_price) * item.quantity).toLocaleString("en-PK", {
                          style: "currency",
                          currency: "PKR",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Section for Pending Orders */}
          {order.status.toLowerCase() === "pending" && (
            <Card className="border-amber-250 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" /> Simulated Payment Portal
                </CardTitle>
                <CardDescription>
                  This order is currently pending payment. Click below to simulate a successful checkout.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Payment Amount</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Number(order.total_amount).toLocaleString("en-PK", {
                        style: "currency",
                        currency: "PKR",
                      })}
                    </p>
                  </div>
                  <Button
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    disabled={paying}
                    onClick={handleSimulatePayment}
                  >
                    {paying ? "Processing..." : "Simulate Stripe Checkout Success"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {order.status.toLowerCase() === "paid" && (
            <Card className="border-emerald-250 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm border">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg text-emerald-800 dark:text-emerald-400">Payment Confirmed</CardTitle>
                  <CardDescription className="text-emerald-700/80 dark:text-emerald-500/80">
                    Your payment was successfully processed. Your order is preparing for shipment.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Shipping details / Summary sidebar */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" /> Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Customer</p>
                <p className="font-semibold">{order.shipping_address?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Phone</p>
                <p className="font-semibold">{order.shipping_address?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Address</p>
                <p className="font-semibold">
                  {order.shipping_address?.addressLine},<br />
                  {order.shipping_address?.city}, {order.shipping_address?.state}, {order.shipping_address?.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
                <span>Total Amount</span>
                <span>
                  {Number(order.total_amount).toLocaleString("en-PK", {
                    style: "currency",
                    currency: "PKR",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
