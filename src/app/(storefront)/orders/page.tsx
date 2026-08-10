"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services-client/order.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .list()
      .then((data: any) => {
        // baseApiService list returns { data: T[], meta: any }
        setOrders(data || []);
      })
      .catch((err) => {
        toast.error("Failed to load order history.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
        <p className="text-muted-foreground">Manage and track your recent store orders</p>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center p-8 border-dashed border-2">
          <CardHeader>
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
            <CardTitle>No orders yet</CardTitle>
            <CardDescription>You haven't placed any orders on our store yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold text-xs font-mono max-w-[120px] truncate">
                    {order.id}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.created_at).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm">
                    {Number(order.total_amount).toLocaleString("en-PK", {
                      style: "currency",
                      currency: "PKR",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="icon" className="hover:bg-secondary">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
