import { BaseApiService } from "./baseApiService";
import type { Product } from "@/types/product.types";

class ProductService extends BaseApiService<Product> {
  constructor() {
    super("products");
  }

  async getVariant(productId: string | number, options: Record<string, string>) {
    const query = new URLSearchParams(options).toString();
    const res = await fetch(`/api/products/${productId}/variant?${query}`);
    return this.handle(res);
  }

  async listWithMeta(params?: Record<string, any>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`/api/products${query}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message ?? "Request failed");
    return { data: json.data as Product[], meta: json.meta };
  }
}

export const productService = new ProductService();
