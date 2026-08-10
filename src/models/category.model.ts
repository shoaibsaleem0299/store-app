import { PrismaClient } from "@/generated/client";
import { BaseModel } from "./base.model";

export interface Category {
  id: number;
  name: string;
  parentId?: number | null;
}

export class CategoryModel extends BaseModel<Category> {
  constructor() {
    super("category");
  }
}
