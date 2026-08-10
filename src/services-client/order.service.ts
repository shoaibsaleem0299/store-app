import { BaseApiService } from "./baseApiService";
import type { Order } from "@/types/order.types";

export const orderService = new BaseApiService<Order>("orders");
