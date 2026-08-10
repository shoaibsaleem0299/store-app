"use client";

import { useEffect, useState } from "react";
import { customerService } from "@/services-client/customer.service";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
    customerService
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
