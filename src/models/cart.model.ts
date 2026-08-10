import { PrismaClient } from "@/generated/client";
import { BaseModel } from "./base.model";
import type { CartItem } from "@/types/product.types";

export class CartModel extends BaseModel<CartItem> {
  constructor() {
    super("cartItem");
  }

  async findByUser(userId: string) {
    const data = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: true,
      },
    });

    return (data ?? []).map((item: any) => {
      const snake = this.toSnakeCase(item);
      if (snake.variant) {
        snake.variants = snake.variant;
        delete snake.variant;
      }
      return snake;
    });
  }
}
