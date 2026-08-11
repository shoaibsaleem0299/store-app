"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { categoryService, Category } from "@/services-client/category.service";
import { storageService } from "@/services/storage.service";
import { generateSku } from "@/utils/generateSku";

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [baseImages, setBaseImages] = useState<string[]>([]);
  const [baseImageLoading, setBaseImageLoading] = useState(false);

  // Options: { id: number, name: string, values: string[] }
  const [optionTypes, setOptionTypes] = useState<any[]>([]);
  const [newOptionName, setNewOptionName] = useState("");

  // Variants rows generated automatically: { sku_code: string, price: number, promo_price: number, stock_qty: number, image_url: string, options: Record<string, string> }
  const [variants, setVariants] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    categoryService.list().then((data: any) => {
      setCategories(data || []);
    });
  }, []);

  // Initialize from initialData if editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setBrand(initialData.brand || "");
      setCategoryId(initialData.category_id ? initialData.category_id.toString() : "");
      
      let images = [];
      try {
        images = typeof initialData.base_images === "string" ? JSON.parse(initialData.base_images) : initialData.base_images;
      } catch(e) {}
      setBaseImages(images || []);

      if (initialData.option_types && Array.isArray(initialData.option_types)) {
        setOptionTypes(initialData.option_types.map((ot: any) => ({
          id: ot.id,
          name: ot.name,
          values: ot.option_values?.map((ov: any) => ov.value) || [],
          tempValue: ""
        })));
      }

      if (initialData.variants && Array.isArray(initialData.variants)) {
        const valueMap = new Map();
        if (initialData.option_types) {
          initialData.option_types.forEach((ot: any) => {
            if (ot.option_values) {
              ot.option_values.forEach((ov: any) => {
                valueMap.set(ov.id, { typeName: ot.name, value: ov.value });
              });
            }
          });
        }

        const activeVariants = initialData.variants.filter((v: any) => v.is_active);
        setVariants(activeVariants.map((v: any) => {
          const options: Record<string, string> = {};
          if (v.variant_option_values) {
             v.variant_option_values.forEach((vov: any) => {
                const mapping = valueMap.get(vov.option_value_id);
                if (mapping) {
                   options[mapping.typeName] = mapping.value;
                }
             });
          }
          return {
            sku_code: v.sku_code,
            price: v.price,
            promo_price: v.promo_price,
            stock_qty: v.stock_qty,
            image_url: v.image_url,
            options
          };
        }));
      }
    }
  }, [initialData]);

  // Recalculate variants SKUs when optionTypes or name changes
  useEffect(() => {
    if (optionTypes.length === 0) {
      const existing = variants.find((v) => Object.keys(v.options).length === 0);
      setVariants([{
        sku_code: existing?.sku_code || generateSku(name || "PROD", {}),
        price: existing?.price || 1000,
        promo_price: existing?.promo_price || "",
        stock_qty: existing?.stock_qty || 50,
        image_url: existing?.image_url || "",
        options: {},
      }]);
      return;
    }

    const optionLists = optionTypes.map((ot) => ot.values.map((v: string) => ({ type: ot.name, value: v })));
    if (optionLists.some((list) => list.length === 0)) {
      setVariants([]);
      return;
    }

    // Cartesian product helper
    const cartesian = optionLists.reduce(
      (a, b) => a.flatMap((d: any) => b.map((e: any) => [...d, e])),
      [[]]
    );

    const generated = cartesian.map((combination: any[]) => {
      const optionsMap: Record<string, string> = {};
      combination.forEach((item) => {
        optionsMap[item.type] = item.value;
      });

      const generatedSku = generateSku(name || "PROD", optionsMap);

      // Preserve existing prices/stock if combination hasn't changed
      const key = combination.map((item) => `${item.type}:${item.value}`).join("|");
      const existing = variants.find((v) => {
        const vKey = Object.entries(v.options)
          .map(([tk, tv]) => `${tk}:${tv}`)
          .join("|");
        return vKey === key;
      });

      return {
        sku_code: existing?.sku_code || generatedSku,
        price: existing?.price || 1000,
        promo_price: existing?.promo_price || "",
        stock_qty: existing?.stock_qty || 50,
        image_url: existing?.image_url || "",
        options: optionsMap,
      };
    });

    setVariants(generated);
  }, [optionTypes, name]);

  const handleAddOptionType = () => {
    if (!newOptionName.trim()) return;
    if (optionTypes.some((ot) => ot.name.toLowerCase() === newOptionName.trim().toLowerCase())) {
      toast.error("Option name already exists.");
      return;
    }
    setOptionTypes([...optionTypes, { id: Date.now(), name: newOptionName.trim(), values: [], tempValue: "" }]);
    setNewOptionName("");
  };

  const handleRemoveOptionType = (id: number) => {
    setOptionTypes(optionTypes.filter((ot) => ot.id !== id));
  };

  const handleAddOptionValue = (typeId: number, valText: string) => {
    if (!valText.trim()) return;
    setOptionTypes(
      optionTypes.map((ot) => {
        if (ot.id === typeId) {
          if (ot.values.includes(valText.trim())) return ot;
          return { ...ot, values: [...ot.values, valText.trim()] };
        }
        return ot;
      })
    );
  };

  const handleRemoveOptionValue = (typeId: number, valIndex: number) => {
    setOptionTypes(
      optionTypes.map((ot) => {
        if (ot.id === typeId) {
          return { ...ot, values: ot.values.filter((_: any, i: any) => i !== valIndex) };
        }
        return ot;
      })
    );
  };

  const handleUploadBaseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBaseImageLoading(true);
    try {
      const url = await storageService.uploadImage(file);
      setBaseImages([...baseImages, url]);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error("Failed to upload image.");
    } finally {
      setBaseImageLoading(false);
    }
  };

  const handleUploadVariantImage = async (index: number, file: File) => {
    try {
      const url = await storageService.uploadImage(file);
      setVariants(
        variants.map((v, i) => {
          if (i === index) return { ...v, image_url: url };
          return v;
        })
      );
      toast.success("Variant image uploaded!");
    } catch (err) {
      toast.error("Failed to upload variant image.");
    }
  };

  const handleVariantChange = (index: number, field: string, val: any) => {
    setVariants(
      variants.map((v, i) => {
        if (i === index) return { ...v, [field]: val };
        return v;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) {
      toast.error("Product name and category are required.");
      return;
    }

    setSubmitting(true);
    try {
      // Map option types format for the RPC schema
      const mappedOptionTypes = optionTypes.map((ot) => ({
        name: ot.name,
        values: ot.values,
      }));

      // Map variants fields format for the RPC schema
      const mappedVariants = variants.map((v) => ({
        sku_code: v.sku_code,
        price: Number(v.price),
        promo_price: v.promo_price ? Number(v.promo_price) : null,
        stock_qty: Number(v.stock_qty),
        image_url: v.image_url || null,
        options: v.options,
      }));

      const method = initialData?.id ? "PUT" : "POST";
      const url = initialData?.id ? `/api/admin/products/${initialData.id}` : "/api/admin/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name,
            description,
            brand: brand || null,
            category_id: Number(categoryId),
            base_images: baseImages,
          },
          optionTypes: mappedOptionTypes,
          variants: mappedVariants,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(initialData?.id ? "Product updated successfully!" : "Product and variants created successfully!");
        if (onSuccess) onSuccess();
      } else {
        toast.error(json.message || "Failed to save product.");
      }
    } catch (err: any) {
      toast.error("Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card text-card-foreground p-6 rounded-lg border border-border">
      {/* 1. Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prodName">Product Name</Label>
            <Input id="prodName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prodBrand">Brand (Optional)</Label>
            <Input id="prodBrand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prodCategory">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="prodCategory">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Base Images (Gallery)</Label>
            <div className="flex items-center gap-4 flex-wrap">
              {baseImages.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border bg-secondary">
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setBaseImages(baseImages.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground w-4 h-4 rounded-full flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <Label className="w-16 h-16 rounded-md border border-dashed border-border hover:bg-secondary flex flex-col items-center justify-center cursor-pointer text-muted-foreground">
                <Upload className="w-4 h-4" />
                <span className="text-[9px] mt-1">Upload</span>
                <input type="file" onChange={handleUploadBaseImage} disabled={baseImageLoading} className="hidden" accept="image/*" />
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prodDesc">Description</Label>
          <textarea
            id="prodDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-input rounded-md ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* 2. Options Builder */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2">Options & Attributes</h3>
        <div className="flex gap-2 items-end max-w-md">
          <div className="space-y-2 flex-1">
            <Label htmlFor="optName">Option Name (e.g. Color, Size)</Label>
            <Input
              id="optName"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              placeholder="Color"
            />
          </div>
          <Button type="button" onClick={handleAddOptionType}>
            Add Option
          </Button>
        </div>

        <div className="space-y-4">
          {optionTypes.map((ot) => (
            <div key={ot.id} className="p-4 border border-border rounded-lg bg-secondary/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm tracking-wide text-foreground uppercase">{ot.name}</span>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveOptionType(ot.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Tag value creation */}
              <div className="flex gap-2 items-center max-w-sm">
                <Input
                  placeholder="Enter option value (e.g. Red)"
                  value={ot.tempValue || ""}
                  onChange={(e) =>
                    setOptionTypes(
                      optionTypes.map((item) => {
                        if (item.id === ot.id) return { ...item, tempValue: e.target.value };
                        return item;
                      })
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOptionValue(ot.id, ot.tempValue);
                      setOptionTypes(
                        optionTypes.map((item) => {
                          if (item.id === ot.id) return { ...item, tempValue: "" };
                          return item;
                        })
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleAddOptionValue(ot.id, ot.tempValue);
                    setOptionTypes(
                      optionTypes.map((item) => {
                        if (item.id === ot.id) return { ...item, tempValue: "" };
                        return item;
                      })
                    );
                  }}
                >
                  Add
                </Button>
              </div>

              {/* List of tag values */}
              <div className="flex flex-wrap gap-2">
                {ot.values.map((v: string, i: number) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1 py-1 px-2.5">
                    {v}
                    <button type="button" onClick={() => handleRemoveOptionValue(ot.id, i)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SKU Generator / Variants */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Generated SKUs</h3>
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Combination</TableHead>
                  <TableHead>SKU Code</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[100px]">Promo Price</TableHead>
                  <TableHead className="w-[80px]">Stock</TableHead>
                  <TableHead>Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v, index) => {
                  const combinationText = Object.keys(v.options).length > 0
                    ? Object.entries(v.options)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(", ")
                    : "Default";
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-xs font-semibold">{combinationText}</TableCell>
                      <TableCell>
                        <Input
                          value={v.sku_code}
                          onChange={(e) => handleVariantChange(index, "sku_code", e.target.value)}
                          className="h-8 font-mono text-[11px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={v.price}
                          onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={v.promo_price}
                          onChange={(e) => handleVariantChange(index, "promo_price", e.target.value)}
                          placeholder="None"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={v.stock_qty}
                          onChange={(e) => handleVariantChange(index, "stock_qty", e.target.value)}
                          className="h-8 text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {v.image_url ? (
                            <img src={v.image_url} className="w-8 h-8 rounded border object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-muted text-[9px]">
                              None
                            </div>
                          )}
                          <Label className="cursor-pointer text-[10px] text-primary hover:underline">
                            Upload
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadVariantImage(index, file);
                              }}
                              accept="image/*"
                            />
                          </Label>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* 4. Submit */}
      <div className="pt-4 flex justify-end">
        <Button type="submit" size="lg" className="w-full sm:w-auto font-bold px-8" disabled={submitting}>
          {submitting ? "Saving Product..." : "Save Product & Variants"}
        </Button>
      </div>
    </form>
  );
}
