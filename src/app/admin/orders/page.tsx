"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services-client/order.service";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: string;
  buyer_id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res: any = await orderService.list();
      setOrders(res || []);
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(json.message || "Failed to update status.");
      }
    } catch (err) {
      toast.error("Failed to update status.");
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

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "buyer_id",
      header: "Buyer ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("buyer_id")}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <span>
          {new Date(row.getValue("created_at")).toLocaleDateString("en-PK", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ row }) => (
        <span className="font-bold">
          {Number(row.getValue("total_amount")).toLocaleString("en-PK", {
            style: "currency",
            currency: "PKR",
          })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <Select value={order.status} onValueChange={(val) => handleUpdateStatus(order.id, val)}>
              <SelectTrigger className="w-[120px] h-8 text-xs bg-background border-border">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">Manage store orders and update fulfillment statuses</p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchKey="id"
        searchPlaceholder="Search orders by ID..."
      />
    </div>
  );
}
