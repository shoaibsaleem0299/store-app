import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@/generated/client";

export class BaseModel<T> {
  protected prisma: PrismaClient = prisma;

  constructor(
    protected modelName: string
  ) { }

  protected parseId(id: string | number) {
    if (this.modelName === "order" || this.modelName === "profile") {
      return String(id);
    }
    return BigInt(id);
  }

  protected parseFilters(filters: Record<string, any>) {
    const parsed: Record<string, any> = {};
    for (const [key, value] of Object.entries(filters)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (
        (camelKey.endsWith("Id") || camelKey === "id") &&
        (typeof value === "string" || typeof value === "number") &&
        /^\d+$/.test(String(value))
      ) {
        parsed[camelKey] = BigInt(value);
      } else {
        parsed[camelKey] = value;
      }
    }
    return parsed;
  }

  protected parsePayload(payload: Record<string, any>) {
    const parsed: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (camelKey === "baseImages" || camelKey === "shippingAddress") {
        parsed[camelKey] = value;
      } else if (
        (camelKey.endsWith("Id") || camelKey === "id") &&
        (typeof value === "string" || typeof value === "number") &&
        /^\d+$/.test(String(value))
      ) {
        parsed[camelKey] = BigInt(value);
      } else {
        parsed[camelKey] = value;
      }
    }
    return parsed;
  }

  protected toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "bigint") {
      const num = Number(obj);
      return Number.isSafeInteger(num) ? num : obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.toSnakeCase(item));
    }
    if (typeof obj === "object") {
      if (obj instanceof Date) return obj.toISOString();
      if (obj.constructor && (obj.constructor.name === "Decimal" || obj.constructor.name === "d" || typeof obj.toNumber === "function")) {
        return Number(obj);
      }
      const newObj: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        newObj[snakeKey] = this.toSnakeCase(value);
      }
      return newObj;
    }
    return obj;
  }

  async findAll(filters: Record<string, any> = {}, page = 1, limit = 20) {
    const delegate = (this.prisma as any)[this.modelName];
    const take = limit;
    const skip = (page - 1) * limit;
    const where = this.parseFilters(filters);

    const [data, total] = await Promise.all([
      delegate.findMany({
        where,
        skip,
        take,
      }),
      delegate.count({
        where,
      }),
    ]);

    return { data: this.toSnakeCase(data) as T[], total };
  }

  async findById(id: string | number) {
    const delegate = (this.prisma as any)[this.modelName];
    const data = await delegate.findUnique({
      where: { id: this.parseId(id) },
    });
    if (!data) throw new Error("Record not found");
    return this.toSnakeCase(data) as T;
  }

  async create(payload: Partial<T>) {
    const delegate = (this.prisma as any)[this.modelName];
    const data = await delegate.create({
      data: this.parsePayload(payload as Record<string, any>),
    });
    return this.toSnakeCase(data) as T;
  }

  async update(id: string | number, payload: Partial<T>) {
    const delegate = (this.prisma as any)[this.modelName];
    const data = await delegate.update({
      where: { id: this.parseId(id) },
      data: this.parsePayload(payload as Record<string, any>),
    });
    return this.toSnakeCase(data) as T;
  }

  async delete(id: string | number) {
    const delegate = (this.prisma as any)[this.modelName];
    await delegate.delete({
      where: { id: this.parseId(id) },
    });
    return true;
  }
}
