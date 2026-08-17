"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Uploads } from "@/components/shared/Uploads";
import { toast } from "sonner";
import { categoryService, Category } from "@/services-client/category.service";

interface Option {
  id: number;
  name: string;
  values: string[];
}

interface Variant {
  id: number;
  skuCode: string;
  price: string;
  promoPrice: string;
  stockQty: string;
  imageUrl: string;
  options: Record<string, string>;
}

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");

  const [baseImages, setBaseImages] = useState<string[]>([]);

  const [options, setOptions] = useState<Option[]>([]);
  const [optionIdCounter, setOptionIdCounter] = useState(1);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantIdCounter, setVariantIdCounter] = useState(1);

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
      } catch (e) { }
      setBaseImages(images || []);

      let parsedOptionTypes = initialData.option_types;
      if (typeof parsedOptionTypes === "string") {
        try { parsedOptionTypes = JSON.parse(parsedOptionTypes); } catch (e) { }
      }

      let maxOptId = 0;
      if (parsedOptionTypes && Array.isArray(parsedOptionTypes)) {
        const loadedOptions = parsedOptionTypes.map((ot: any) => {
          const optId = ot.id || Date.now() + Math.random();
          maxOptId = Math.max(maxOptId, optId);
          return {
            id: optId,
            name: ot.name || "",
            values: ot.option_values?.map((ov: any) => ov.value) || [],
          };
        });
        setOptions(loadedOptions);
        setOptionIdCounter(maxOptId + 1);
      }

      let parsedVariants = initialData.variants;
      if (typeof parsedVariants === "string") {
        try { parsedVariants = JSON.parse(parsedVariants); } catch (e) { }
      }

      if (parsedVariants && Array.isArray(parsedVariants)) {
        const valueMap = new Map();
        if (parsedOptionTypes) {
          parsedOptionTypes.forEach((ot: any) => {
            if (ot.option_values) {
              ot.option_values.forEach((ov: any) => {
                valueMap.set(ov.id, { typeName: ot.name, value: ov.value });
              });
            }
          });
        }

        const activeVariants = parsedVariants.filter((v: any) => v.is_active !== false);
        let maxVarId = 0;
        const loadedVariants = activeVariants.map((v: any) => {
          const optRecord: Record<string, string> = {};
          if (v.variant_option_values) {
            v.variant_option_values.forEach((vov: any) => {
              const mapping = valueMap.get(vov.option_value_id);
              if (mapping) {
                optRecord[mapping.typeName] = mapping.value;
              }
            });
          }
          const varId = v.id || Date.now() + Math.random();
          maxVarId = Math.max(maxVarId, varId);
          return {
            id: varId,
            skuCode: v.sku_code || "",
            price: v.price?.toString() || "",
            promoPrice: v.promo_price?.toString() || "",
            stockQty: v.stock_qty?.toString() || "0",
            imageUrl: v.image_url || "",
            options: optRecord
          };
        });
        setVariants(loadedVariants);
        setVariantIdCounter(maxVarId + 1);
      }
    }
  }, [initialData]);

  // Base Images
  const addBaseImage = (url: string) => {
    setBaseImages([...baseImages, url]);
  };

  const removeBaseImage = (index: number) => {
    setBaseImages(baseImages.filter((_, i) => i !== index));
  };

  // Options
  const addOptionType = () => {
    setOptions([
      ...options,
      { id: optionIdCounter, name: "", values: [] },
    ]);
    setOptionIdCounter(optionIdCounter + 1);
  };

  const removeOptionType = (id: number) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const updateOptionName = (id: number, newName: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, name: newName } : opt))
    );
  };

  const addOptionValue = (optionId: number) => {
    setOptions(
      options.map((opt) =>
        opt.id === optionId ? { ...opt, values: [...opt.values, ""] } : opt
      )
    );
  };

  const updateOptionValue = (optionId: number, index: number, value: string) => {
    setOptions(
      options.map((opt) => {
        if (opt.id === optionId) {
          const newValues = [...opt.values];
          newValues[index] = value;
          return { ...opt, values: newValues };
        }
        return opt;
      })
    );
  };

  const removeOptionValue = (optionId: number, index: number) => {
    setOptions(
      options.map((opt) => {
        if (opt.id === optionId) {
          return {
            ...opt,
            values: opt.values.filter((_, i) => i !== index),
          };
        }
        return opt;
      })
    );
  };

  // Variants
  const addVariant = () => {
    const validOptions = options.filter(
      (opt) => opt.name.trim() !== "" && opt.values.some((v) => v.trim() !== "")
    );

    if (validOptions.length === 0) {
      toast.error("Please create product options with at least one value first. Example: Color or Size.");
      return;
    }

    const defaultOptions: Record<string, string> = {};
    validOptions.forEach((opt) => {
      const firstValidValue = opt.values.find((v) => v.trim() !== "");
      if (firstValidValue) {
        defaultOptions[opt.name] = firstValidValue;
      }
    });

    setVariants([
      ...variants,
      {
        id: variantIdCounter,
        skuCode: "",
        price: "",
        promoPrice: "",
        stockQty: "0",
        imageUrl: "",
        options: defaultOptions,
      },
    ]);
    setVariantIdCounter(variantIdCounter + 1);
  };

  const removeVariant = (id: number) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariantField = (
    id: number,
    field: keyof Variant,
    value: string
  ) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const updateVariantOption = (
    variantId: number,
    optionName: string,
    value: string
  ) => {
    setVariants(
      variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            options: {
              ...v.options,
              [optionName]: value,
            },
          };
        }
        return v;
      })
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId) {
      toast.error("Product name and category are required");
      return;
    }

    const cleanedOptions = options
      .map((opt) => ({
        name: opt.name.trim(),
        values: opt.values.map((v) => v.trim()).filter((v) => v !== ""),
      }))
      .filter((opt) => opt.name !== "" && opt.values.length > 0);

    const cleanedVariants = variants.map((v) => ({
      id: v.id,
      sku_code: v.skuCode.trim(),
      price: Number(v.price),
      promo_price: v.promoPrice ? Number(v.promoPrice) : null,
      stock_qty: Number(v.stockQty),
      image_url: v.imageUrl.trim() || null,
      options: v.options,
    }));

    setSubmitting(true);
    try {
      const method = initialData?.id ? "PUT" : "POST";
      const url = initialData?.id ? `/api/admin/products/${initialData.id}` : "/api/admin/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: name.trim(),
            description: description.trim() || null,
            brand: brand.trim() || null,
            category_id: Number(categoryId),
            base_images: baseImages,
          },
          optionTypes: cleanedOptions,
          variants: cleanedVariants,
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
    <div className="space-y-8">
      {/* BASIC INFORMATION */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="Example: Nike T-Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select key={`cat-${categoryId}-${categories.length}`} value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="Example: Nike"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BASE IMAGES */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {baseImages.map((url, index) => (
              <div key={index} className="relative group rounded-md overflow-hidden border">
                <img
                  src={url}
                  alt={`Base image ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => removeBaseImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Uploads
              onUploadSuccess={addBaseImage}
              className="w-full h-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* OPTIONS */}
      <Card>
        <CardHeader>
          <CardTitle>Product Options</CardTitle>
          <CardDescription>
            Example: Color → Black, White | Size → S, M, L
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {options.map((option) => (
              <div
                key={option.id}
                className="border p-4 rounded-md space-y-4 bg-muted/20"
              >
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Option name: Color"
                    value={option.name}
                    onChange={(e) => updateOptionName(option.id, e.target.value)}
                    className="flex-1 font-semibold"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeOptionType(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 pl-4 border-l-2">
                  {option.values.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Input
                        placeholder="Example: Black"
                        value={val}
                        onChange={(e) =>
                          updateOptionValue(option.id, idx, e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeOptionValue(option.id, idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => addOptionValue(option.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" onClick={addOptionType}>
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </CardContent>
      </Card>

      {/* VARIANTS */}
      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
          <CardDescription>
            Create variants after adding your options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button variant="secondary" onClick={addVariant}>
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>

          <div className="space-y-6">
            {variants.map((variant) => (
              <div key={variant.id} className="border p-4 rounded-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>SKU Code</Label>
                    <Input
                      placeholder="Example: TS-BLACK-M"
                      value={variant.skuCode}
                      onChange={(e) =>
                        updateVariantField(variant.id, "skuCode", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      placeholder="2500"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariantField(variant.id, "price", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Promo Price</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={variant.promoPrice}
                      onChange={(e) =>
                        updateVariantField(
                          variant.id,
                          "promoPrice",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={variant.stockQty}
                      onChange={(e) =>
                        updateVariantField(variant.id, "stockQty", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Variant Image</Label>
                  <div className="flex items-center gap-4">
                    {variant.imageUrl ? (
                      <div className="relative group w-20 h-20 rounded-md overflow-hidden border shrink-0">
                        <img
                          src={variant.imageUrl}
                          alt="Variant image"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={() => updateVariantField(variant.id, "imageUrl", "")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Uploads
                        onUploadSuccess={(url) =>
                          updateVariantField(variant.id, "imageUrl", url)
                        }
                        className="w-20 h-20 shrink-0"
                      />
                    )}
                    <Input
                      placeholder="Or paste Image URL here"
                      value={variant.imageUrl}
                      onChange={(e) =>
                        updateVariantField(variant.id, "imageUrl", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                {Object.keys(variant.options).length > 0 && (
                  <div className="bg-muted/30 p-4 rounded-md">
                    <Label className="mb-3 block">Selected Options</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {options
                        .filter(
                          (opt) =>
                            opt.name.trim() !== "" &&
                            opt.values.some((v) => v.trim() !== "")
                        )
                        .map((opt) => (
                          <div key={opt.id} className="space-y-2">
                            <Label className="text-muted-foreground">{opt.name}</Label>
                            <Select
                              value={variant.options[opt.name] || ""}
                              onValueChange={(val) =>
                                updateVariantOption(variant.id, opt.name, val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${opt.name}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {opt.values
                                  .filter((v) => v.trim() !== "")
                                  .map((v, i) => (
                                    <SelectItem key={i} value={v}>
                                      {v}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t mt-4">
                  <Button
                    variant="destructive"
                    onClick={() => removeVariant(variant.id)}
                  >
                    Remove Variant
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving Product..." : initialData?.id ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
