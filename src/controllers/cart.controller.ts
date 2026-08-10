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
}
