import { PrismaClient } from "@/generated/client";
import { BaseModel } from "./base.model";
import type { Order } from "@/types/order.types";

export class OrderModel extends BaseModel<Order> {
  constructor() {
    super("order");
  }

  async findByBuyer(buyerId: string, page = 1, limit = 20) {
    return this.findAll({ buyer_id: buyerId }, page, limit);
  }

  async createFromCart(buyerId: string, shippingAddress: any) {
    const result = await this.prisma.$queryRawUnsafe<Array<{ create_order_from_cart: string }>>(
      `SELECT public.create_order_from_cart($1::uuid, $2::jsonb)`,
      buyerId,
      JSON.stringify(shippingAddress)
    );
    return result[0]?.create_order_from_cart;
  }

  async findWithItems(id: string | number) {
    const data = await this.prisma.order.findUnique({
      where: { id: this.parseId(id) as string },
      include: {
        orderItems: {
          include: {
            variant: {
              select: {
                skuCode: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    const snake = this.toSnakeCase(data);
    if (snake && snake.order_items) {
      snake.order_items = snake.order_items.map((item: any) => {
        if (item.variant) {
          item.variants = item.variant;
          delete item.variant;
        }
        return item;
      });
    }

    return snake;
  }
}
