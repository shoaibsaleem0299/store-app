import { BaseModel } from "@/models/base.model";

export class BaseController<T> {
  constructor(protected model: BaseModel<T>) {}

  async list(searchParams: URLSearchParams): Promise<any> {
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    
    const filters: Record<string, any> = {};
    for (const [key, value] of Array.from(searchParams.entries())) {
      if (key !== "page" && key !== "limit") {
        filters[key] = value;
      }
    }
    
    const { data, total } = await this.model.findAll(filters, page, limit);
    return this.success(data, { page, limit, total });
  }

  async getById(id: string): Promise<any> {
    const data = await this.model.findById(id);
    return this.success(data);
  }

  async create(payload: Partial<T>): Promise<any> {
    const data = await this.model.create(payload);
    return this.success(data, undefined, 201);
  }

  async update(id: string, payload: Partial<T>): Promise<any> {
    const data = await this.model.update(id, payload);
    return this.success(data);
  }

  async remove(id: string): Promise<any> {
    await this.model.delete(id);
    return this.success(null);
  }

  protected success(data: any, meta?: Record<string, any>, status = 200) {
    return { status, body: { success: true, data, meta } };
  }

  protected error(message: string, status = 400) {
    return { status, body: { success: false, message } };
  }
}
