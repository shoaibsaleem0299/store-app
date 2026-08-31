import { BaseApiClientService } from "./baseApiService";
import type { Product } from "@/types/product.types";

class ProductService extends BaseApiClientService<Product> {
  constructor() {
    super("products");
  }

  async getVariant(productId: string | number, options: Record<string, string>) {
    return this.client.get(`/${productId}/variant`, { params: options }) as unknown as Promise<any>;
  }

  async listWithMeta(params?: Record<string, any>) {
    const res = await this.client.get("", { params }) as any;
    return { data: res.data as Product[], meta: res.meta };
  }

  async createAdmin(payload: any) {
    // Override baseURL to hit the admin endpoint
    const res = await this.client.post("/api/admin/products", payload, { baseURL: "/" }) as any;
    return res;
  }

  async updateAdmin(id: string | number, payload: any) {
    const res = await this.client.put(`/api/admin/products/${id}`, payload, { baseURL: "/" }) as any;
    return res;
  }
}

export const productService = new ProductService();
