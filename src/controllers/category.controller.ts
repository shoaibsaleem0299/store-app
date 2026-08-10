import { BaseController } from "./base.controller";
import { CategoryModel, Category } from "@/models/category.model";

export class CategoryController extends BaseController<Category> {
  constructor(private categoryModel: CategoryModel) {
    super(categoryModel);
  }
}
