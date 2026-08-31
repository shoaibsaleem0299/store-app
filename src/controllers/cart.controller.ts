import { BaseController } from "./base.controller";
import { CartModel } from "@/models/cart.model";
import type { CartItem } from "@/types/product.types";

export class CartController extends BaseController<CartItem> {
  constructor(private cartModel: CartModel) {
    super(cartModel);
  }

  async getForUser(userId: string) {
    const data = await this.cartModel.findByUser(userId);
    return this.success(data);
  }

  async create(payload: Partial<CartItem>): Promise<any> {
    const userId = payload.user_id as string;
    const variantId = payload.variant_id as unknown as bigint;
    const quantity = (payload.quantity as number) || 1;

    // Check if item already exists in the cart for this user
    const existingItems = (await this.cartModel.findAll({ userId, variantId }, 1, 1)).data;

    if (existingItems && existingItems.length > 0) {
      const existing = existingItems[0];
      const updated = await this.cartModel.update(existing.id, {
        quantity: (existing.quantity || 0) + quantity,
      });
      return this.success(updated);
    }

    const data = await this.cartModel.create(payload);
    return this.success(data, undefined, 201);
  }
}
