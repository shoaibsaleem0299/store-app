import { BaseController } from "./base.controller";
import { OrderModel } from "@/models/order.model";
import type { Order } from "@/types/order.types";

export class OrderController extends BaseController<Order> {
  constructor(private orderModel: OrderModel) {
    super(orderModel);
  }

  async getForBuyer(buyerId: string, searchParams: URLSearchParams) {
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const { data, total } = await this.orderModel.findByBuyer(buyerId, page, limit);
    return this.success(data, { page, limit, total });
  }

  override async create(payload: { buyer_id: string; shipping_address: any }) {
    try {
      const orderId = await this.orderModel.createFromCart(
        payload.buyer_id,
        payload.shipping_address
      );
      return this.success({ id: orderId }, undefined, 201);
    } catch (err: any) {
      return this.error(err.message || "Failed to create order from cart");
    }
  }

  async getWithItems(id: string) {
    try {
      const data = await this.orderModel.findWithItems(id);
      return this.success(data);
    } catch (err: any) {
      return this.error(err.message || "Failed to get order details");
    }
  }

  override async update(id: string, payload: Partial<Order>) {
    try {
      if (payload.status === "paid") {
        const { paymentService } = await import("@/services/payment.service");
        await paymentService.processPayment(id, "paid");
        return this.success({ id, status: "paid" });
      }
      const data = await this.orderModel.update(id, payload);
      return this.success(data);
    } catch (err: any) {
      return this.error(err.message || "Failed to update order");
    }
  }
}
