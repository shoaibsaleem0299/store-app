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

  async createFromLocalCart(buyerId: string, items: any[], shippingAddress: any) {
    // 1. Calculate total securely
    let subtotal = 0;
    const orderItemsData: any[] = [];

    // 2. Fetch variants and check stock
    for (const item of items) {
      const variant = await this.prisma.variant.findUnique({
        where: { id: BigInt(item.variant_id) },
      });
      
      if (!variant) {
        throw new Error(`Variant ${item.variant_id} not found`);
      }
      
      if (variant.stockQty < item.quantity) {
        throw new Error(`Insufficient stock for variant ${variant.skuCode}`);
      }

      const price = variant.promoPrice ? Number(variant.promoPrice) : Number(variant.price);
      subtotal += price * item.quantity;

      orderItemsData.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: price,
      });
    }

    if (subtotal === 0) {
      throw new Error("Cart is empty or invalid");
    }

    const shipping = subtotal < 5000 ? 250 : 0;
    const total = subtotal + shipping;

    // 3. Create order and items in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId,
          totalAmount: total,
          shippingAddress: shippingAddress,
          status: "pending",
          paymentType: "cod",
          paymentStatus: "pending",
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        },
      });

      for (const orderItem of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            variantId: orderItem.variantId,
            quantity: orderItem.quantity,
            unitPrice: orderItem.unitPrice,
          },
        });
      }

      return newOrder;
    });

    return order.id;
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
                product: {
                  select: {
                    name: true,
                  },
                },
                variantOptionValues: {
                  include: {
                    optionValue: {
                      include: {
                        optionType: true,
                      },
                    },
                  },
                },
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
