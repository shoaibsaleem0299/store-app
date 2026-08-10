import { BaseController } from "./base.controller";
import { ProductModel } from "@/models/product.model";
import type { Product } from "@/types/product.types";

export class ProductController extends BaseController<Product> {
  constructor(private productModel: ProductModel) {
    super(productModel);
  }

  async getWithVariants(id: string) {
    const data = await this.productModel.findWithVariants(id);
    return this.success(data);
  }

  async createWithVariants(payload: {
    product: Partial<Product>;
    optionTypes: { name: string; values: string[] }[];
    variants: {
      sku_code: string;
      price: number;
      promo_price?: number;
      stock_qty: number;
      image_url?: string;
      options: Record<string, string>;
    }[];
  }) {
    try {
      const data = await this.productModel.createWithVariants(payload);
      return this.success({ id: data });
    } catch (err: any) {
      return this.error(err.message || "Failed to create product with variants");
    }
  }
}
