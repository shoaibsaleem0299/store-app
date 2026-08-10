export class BaseApiService<T> {
  constructor(protected resource: string) {}

  private baseUrl = "/api";

  async list(params?: Record<string, any>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await fetch(`${this.baseUrl}/${this.resource}${query}`);
    return this.handle<{ data: T[]; meta: any }>(res);
  }

  async getById(id: string | number) {
    const res = await fetch(`${this.baseUrl}/${this.resource}/${id}`);
    return this.handle<T>(res);
  }

  async create(payload: Partial<T>) {
    const res = await fetch(`${this.baseUrl}/${this.resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return this.handle<T>(res);
  }

  async update(id: string | number, payload: Partial<T>) {
    const res = await fetch(`${this.baseUrl}/${this.resource}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return this.handle<T>(res);
  }

  async remove(id: string | number) {
    const res = await fetch(`${this.baseUrl}/${this.resource}/${id}`, { method: "DELETE" });
    return this.handle<null>(res);
  }

  protected async handle<R>(res: Response): Promise<R> {
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message ?? "Request failed");
    return json.data;
  }
}
