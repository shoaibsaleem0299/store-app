"use client";

import { useEffect, useState } from "react";
import { BaseApiClientService } from "@/services-client/baseApiService";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Eye } from "lucide-react";

interface Customer {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminCustomerService = new BaseApiClientService<Customer>("admin/customers");
    adminCustomerService
      .list()
      .then((data: any) => {
        setCustomers(data || []);
      })
      .catch(() => {
        toast.error("Failed to load customer list.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: ({ row }) => <span className="font-semibold">{row.getValue("full_name") || "No Name"}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-foreground uppercase tracking-wide">
          {row.getValue("role")}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Registered At",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.getValue("created_at")).toLocaleDateString("en-PK", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/orders?buyer_id=${row.original.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View Orders
          </Link>
        </Button>
      ),
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
        <h1 className="text-3xl font-extrabold tracking-tight">Customers</h1>
        <p className="text-muted-foreground text-sm">View all registered shopper profiles</p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="email"
        searchPlaceholder="Search customers by email..."
      />
    </div>
  );
}
