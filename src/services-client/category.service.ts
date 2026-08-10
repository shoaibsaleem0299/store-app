import { BaseApiService } from "./baseApiService";

export interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
}

export const categoryService = new BaseApiService<Category>("categories");
