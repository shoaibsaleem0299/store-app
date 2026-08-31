import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

export class BaseApiClientService<T> {
  protected client: AxiosInstance;

  constructor(protected resource: string) {
    this.client = axios.create({
      baseURL: `/api/${resource}`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Request interceptor to attach token
    this.client.interceptors.request.use((config) => {
      // Try to get token from cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
        
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for generic error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const data = response.data;
        if (data && data.success === false) {
           return Promise.reject(new Error(data.message || "Request failed"));
        }
        return response.data;
      },
      (error: AxiosError<{ message?: string, success?: boolean }>) => {
        const message = error.response?.data?.message || error.message || "Request failed";
        return Promise.reject(new Error(message));
      }
    );
  }

  async list(params?: Record<string, any>): Promise<T[]> {
    const res = await this.client.get("", { params });
    return ((res as any).data !== undefined ? (res as any).data : res) as T[];
  }

  async getById(id: string | number): Promise<T> {
    const res = await this.client.get(`/${id}`);
    return ((res as any).data !== undefined ? (res as any).data : res) as T;
  }

  async create(payload: Partial<T>): Promise<T> {
    const res = await this.client.post("", payload);
    return ((res as any).data !== undefined ? (res as any).data : res) as T;
  }

  async update(id: string | number, payload: Partial<T>): Promise<T> {
    const res = await this.client.put(`/${id}`, payload);
    return ((res as any).data !== undefined ? (res as any).data : res) as T;
  }

  async remove(id: string | number): Promise<null> {
    const res = await this.client.delete(`/${id}`);
    return ((res as any).data !== undefined ? (res as any).data : null) as null;
  }
}
