"use client";

import { useEffect, useState } from "react";
import { productService } from "@/services-client/product.service";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "@/components/features/admin/ProductForm";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  name: string;
  brand?: string;
  category_id: number;
  status: string;
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchProductsList = async () => {
    try {
      const res: any = await productService.list();
      setProducts(res || []);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? All its options and variants will be deleted automatically.")) {
      return;
    }

    try {
      await productService.remove(id);
      toast.success("Product deleted successfully!");
      fetchProductsList();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product.");
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => <span className="font-bold">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => <span>{row.getValue("brand") || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wide">
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
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
      cell: ({ row }) => {
        const prod = row.original;
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(prod.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm">Manage your inventory catalog, option configurations and SKUs</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
            <DialogHeader>
              <DialogTitle>Add New Product Catalog</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSuccess={() => {
                setDialogOpen(false);
                fetchProductsList();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products by name..."
      />
    </div>
  );
}
