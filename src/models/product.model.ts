import { PrismaClient } from "@/generated/client";
import { BaseModel } from "./base.model";
import type { Product } from "@/types/product.types";

export class ProductModel extends BaseModel<Product> {
  constructor() {
    super("product");
  }

  override async findAll(filters: Record<string, any> = {}, page = 1, limit = 20) {
    const take = limit;
    const skip = (page - 1) * limit;
    const where = this.parseFilters(filters);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          variants: {
            select: {
              price: true,
              promoPrice: true,
              stockQty: true,
            },
          },
          optionTypes: {
            include: {
              optionValues: {
                select: {
                  value: true,
                  swatchImage: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const mapped = (data ?? []).map((p: any) => {
      const prices = p.variants?.map((v: any) => Number(v.promoPrice || v.price)) || [];
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;

      const colorType = p.optionTypes?.find((ot: any) => ot.name.toLowerCase() === "color");
      const colors = colorType ? colorType.optionValues.map((v: any) => v.value) : [];

      return {
        ...p,
        price_range: { min: minPrice, max: maxPrice },
        colors,
      };
    });

    return { data: this.toSnakeCase(mapped) as any[], total };
  }

  async findWithVariants(id: string | number) {
    const data = await this.prisma.product.findUnique({
      where: { id: this.parseId(id) as bigint },
      include: {
        optionTypes: {
          include: {
            optionValues: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
        variants: {
          include: {
            variantOptionValues: {
              select: {
                optionValueId: true,
              },
            },
          },
        },
      },
    });
    return this.toSnakeCase(data);
  }

  async createWithVariants(payload: any) {
    const name = payload.product.name;
    const description = payload.product.description || "";
    const categoryId = payload.product.category_id ? BigInt(payload.product.category_id) : null;
    const brand = payload.product.brand || "";
    const baseImages = JSON.stringify(payload.product.base_images || []);
    const optionTypes = JSON.stringify(payload.optionTypes || []);
    const variants = JSON.stringify(payload.variants || []);

    const result = await this.prisma.$queryRawUnsafe<Array<{ create_product_with_variants: bigint }>>(
      `SELECT public.create_product_with_variants($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb)`,
      name,
      description,
      categoryId,
      brand,
      baseImages,
      optionTypes,
      variants
    );

    const productId = result[0]?.create_product_with_variants;
    return Number(productId);
  }
}

