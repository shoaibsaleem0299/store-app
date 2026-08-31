import { BaseApiClientService } from "./baseApiService";

export interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
}

export const categoryService = new BaseApiClientService<Category>("categories");
