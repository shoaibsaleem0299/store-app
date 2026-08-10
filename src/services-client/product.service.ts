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
}

export const productService = new ProductService();
