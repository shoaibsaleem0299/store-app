import { PrismaClient } from "@/generated/client";
import { BaseModel } from "./base.model";

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
}

export class CustomerModel extends BaseModel<Customer> {
  constructor() {
    super("profile");
  }

  async findByPhone(phone: string) {
    const data = await this.prisma.profile.findFirst({
      where: { phone },
    });
    return data ? this.toSnakeCase(data) : null;
  }

  async createCheckoutUser(payload: {
    phone: string;
    email?: string;
    full_name: string;
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }) {
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash("12345678", 10);
    const userId = crypto.randomUUID();

    const email = payload.email || payload.phone;

    const user = await this.prisma.profile.create({
      data: {
        id: userId,
        email,
        phone: payload.phone,
        password: hashedPassword,
        fullName: payload.full_name,
        addressLine: payload.address_line,
        city: payload.city,
        state: payload.state,
        postalCode: payload.postal_code,
        country: payload.country,
        role: "customer",
      },
    });

    return this.toSnakeCase(user);
  }
}
