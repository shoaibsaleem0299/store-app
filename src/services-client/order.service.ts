import { BaseApiClientService } from "./baseApiService";
import type { Order } from "@/types/order.types";

export const orderService = new BaseApiClientService<Order>("orders");
