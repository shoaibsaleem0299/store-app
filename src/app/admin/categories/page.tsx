"use client";

import { useEffect, useState } from "react";
import { categoryService, Category } from "@/services-client/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("none");
  const [creating, setCreating] = useState(false);

  const fetchCategories = async () => {
    try {
      const res: any = await categoryService.list();
      setCategories(res || []);
    } catch (err) {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await categoryService.create({
        name,
        parent_id: parentId === "none" ? null : Number(parentId),
      });
      toast.success("Category created successfully!");
      setName("");
      setParentId("none");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to create category.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await categoryService.remove(id);
      toast.success("Category deleted successfully!");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm">Manage product catalog hierarchy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="md:col-span-1">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Add New Category</CardTitle>
              <CardDescription>Create a new category for grouping your products</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shirts, Electronics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
                  <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger id="parentCategory">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="none">None (Root Category)</SelectItem>
                      {categories
                        .filter((c) => !c.parent_id) // show only root categories as choices
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full font-bold flex items-center justify-center gap-2" disabled={creating}>
                  <Plus className="w-4 h-4" /> {creating ? "Creating..." : "Create Category"}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>

        {/* Categories Table */}
        <div className="md:col-span-2">
          <Card className="border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center font-semibold text-muted-foreground h-24">
                      No categories yet. Create one!
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((c) => {
                    const parent = categories.find((cat) => cat.id === c.parent_id);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold">{c.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {parent ? parent.name : <span className="text-xs font-semibold px-2 py-0.5 bg-secondary rounded-full text-foreground">Root</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
