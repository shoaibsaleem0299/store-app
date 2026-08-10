import { BaseApiService } from "./baseApiService";
import type { CartItem } from "@/types/product.types";

export const cartService = new BaseApiService<CartItem>("cart");
