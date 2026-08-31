import { BaseApiClientService } from "./baseApiService";
import type { CartItem } from "@/types/product.types";

class CartService extends BaseApiClientService<CartItem> {
  constructor() {
    super("cart");
  }
}

export const cartService = new CartService();
