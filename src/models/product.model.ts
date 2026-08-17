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

      const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stockQty || 0), 0) || 0;

      return {
        ...p,
        price_range: { min: minPrice, max: maxPrice },
        colors,
        total_stock: totalStock,
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
    const description = payload.product.description || null;
    const categoryId = payload.product.category_id ? BigInt(payload.product.category_id) : null;
    const brand = payload.product.brand || null;
    const baseImages = payload.product.base_images || [];
    const incomingOptions = payload.optionTypes || [];
    const incomingVariants = payload.variants || [];

    let newProductId: bigint = 0;

    await this.prisma.$transaction(async (tx) => {
      // 1. Create Product
      const product = await tx.product.create({
        data: {
          name, description, categoryId, brand, baseImages
        }
      });
      newProductId = product.id;

      // 2. Create Options
      const optionValueMap = new Map<string, bigint>();
      for (let i = 0; i < incomingOptions.length; i++) {
        const opt = incomingOptions[i];
        const optionType = await tx.optionType.create({
          data: {
            productId: newProductId,
            name: opt.name,
            displayOrder: i,
          }
        });

        for (let j = 0; j < opt.values.length; j++) {
          const valName = opt.values[j];
          const optionValue = await tx.optionValue.create({
            data: {
              optionTypeId: optionType.id,
              value: valName,
              displayOrder: j,
            }
          });
          optionValueMap.set(`${opt.name}:${valName}`, optionValue.id);
        }
      }

      // 3. Create Variants
      for (const variantPayload of incomingVariants) {
        const variant = await tx.variant.create({
          data: {
            productId: newProductId,
            skuCode: variantPayload.sku_code,
            price: variantPayload.price,
            promoPrice: variantPayload.promo_price || null,
            stockQty: variantPayload.stock_qty || 0,
            imageUrl: variantPayload.image_url || null,
            isActive: true
          }
        });

        if (variantPayload.options) {
          for (const [optName, optVal] of Object.entries(variantPayload.options)) {
            const mappedValId = optionValueMap.get(`${optName}:${optVal as string}`);
            if (mappedValId) {
              await tx.variantOptionValue.create({
                data: {
                  variantId: variant.id,
                  optionValueId: mappedValId
                }
              });
            }
          }
        }
      }
    });

    return Number(newProductId);
  }

  async updateWithVariants(id: string | number, payload: any) {
    const productId = this.parseId(id) as bigint;
    const name = payload.product.name;
    const description = payload.product.description || null;
    const categoryId = payload.product.category_id ? BigInt(payload.product.category_id) : null;
    const brand = payload.product.brand || null;
    const baseImages = payload.product.base_images || [];
    const incomingOptions = payload.optionTypes || [];
    const incomingVariants = payload.variants || [];

    await this.prisma.$transaction(async (tx) => {
      // 1. Update basic product info
      await tx.product.update({
        where: { id: productId },
        data: {
          name, description, categoryId, brand, baseImages
        }
      });

      // 2. Clear old option types (this cascades to option_values and variant_option_values)
      await tx.optionType.deleteMany({
        where: { productId }
      });

      // 3. Insert new OptionTypes and OptionValues
      const optionValueMap = new Map<string, bigint>();
      for (let i = 0; i < incomingOptions.length; i++) {
        const opt = incomingOptions[i];
        const optionType = await tx.optionType.create({
          data: {
            productId,
            name: opt.name,
            displayOrder: i,
          }
        });

        for (let j = 0; j < opt.values.length; j++) {
          const valName = opt.values[j];
          const optionValue = await tx.optionValue.create({
            data: {
              optionTypeId: optionType.id,
              value: valName,
              displayOrder: j,
            }
          });
          optionValueMap.set(`${opt.name}:${valName}`, optionValue.id);
        }
      }

      // 4. Upsert Variants
      const incomingVariantIds = incomingVariants.map((v: any) => v.id).filter(Boolean).map(BigInt);

      if (incomingVariantIds.length > 0) {
        await tx.variant.updateMany({
          where: {
            productId,
            id: { notIn: incomingVariantIds }
          },
          data: { isActive: false }
        });
      } else {
        await tx.variant.updateMany({
          where: { productId },
          data: { isActive: false }
        });
      }

      for (const variantPayload of incomingVariants) {
        const varId = variantPayload.id ? BigInt(variantPayload.id) : undefined;
        const skuCode = variantPayload.sku_code;
        const price = variantPayload.price;
        const promoPrice = variantPayload.promo_price || null;
        const stockQty = variantPayload.stock_qty || 0;
        const imageUrl = variantPayload.image_url || null;

        let variant;
        if (varId) {
          variant = await tx.variant.update({
            where: { id: varId },
            data: { skuCode, price, promoPrice, stockQty, imageUrl, isActive: true }
          });
        } else {
          variant = await tx.variant.upsert({
            where: { skuCode },
            update: { price, promoPrice, stockQty, imageUrl, isActive: true },
            create: { productId, skuCode, price, promoPrice, stockQty, imageUrl, isActive: true }
          });
        }

        if (variantPayload.options) {
          for (const [optName, optVal] of Object.entries(variantPayload.options)) {
            const mappedValId = optionValueMap.get(`${optName}:${optVal as string}`);
            if (mappedValId) {
              await tx.variantOptionValue.create({
                data: {
                  variantId: variant.id,
                  optionValueId: mappedValId
                }
              });
            }
          }
        }
      }
    });

    return Number(productId);
  }
}

