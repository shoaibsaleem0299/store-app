import { BaseController } from "./base.controller";
import { VariantModel } from "@/models/variant.model";
import type { Variant } from "@/types/product.types";

export class VariantController extends BaseController<Variant> {
  constructor(private variantModel: VariantModel) {
    super(variantModel);
  }

  async findByOptions(productId: string, optionValueIds: number[]) {
    const variant = await this.variantModel.findByOptionValueIds(productId, optionValueIds);
    if (!variant) return this.error("No matching variant for the selected options", 404);
    return this.success(variant);
  }
}
