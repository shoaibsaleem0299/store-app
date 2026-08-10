import { PrismaClient } from "@/generated/client";
import { BaseModel } from "./base.model";
import type { Variant } from "@/types/product.types";

export class VariantModel extends BaseModel<Variant> {
  constructor() {
    super("variant");
  }

  // Resolve the exact SKU for a product + set of selected option value IDs
  async findByOptionValueIds(productId: string | number, optionValueIds: number[]) {
    const data = await this.prisma.variant.findMany({
      where: { productId: this.parseId(productId) as bigint },
      include: {
        variantOptionValues: {
          select: {
            optionValueId: true,
          },
        },
      },
    });

    const match = (data ?? []).find((variant: any) => {
      const ids = variant.variantOptionValues.map((v: any) => Number(v.optionValueId));
      return (
        ids.length === optionValueIds.length &&
        optionValueIds.every((id) => ids.includes(id))
      );
    });

    return this.toSnakeCase(match);
  }
}
