"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ShoppingBag, DollarSign, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setMetrics(json.data);
        } else {
          toast.error(json.message || "Failed to load metrics.");
        }
      })
      .catch(() => {
        toast.error("Failed to fetch dashboard metrics.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Storefront performance metrics and warnings</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          title="Today's Orders"
          value={metrics?.todayOrders ?? 0}
          description="Orders placed today"
          icon={<ShoppingBag className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(metrics?.todayRevenue ?? 0)}
          description="Revenue from paid store checkouts"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Low Stock Alerts */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Variants with stock count below 5 units</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU Code</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Stock Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!metrics?.lowStock || metrics.lowStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground font-semibold h-24">
                    All inventory levels are healthy!
                  </TableCell>
                </TableRow>
              ) : (
                metrics.lowStock.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-semibold">{v.products?.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{v.sku_code}</TableCell>
                    <TableCell className="text-sm font-semibold">{formatCurrency(v.price)}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {v.stock_qty} left
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
