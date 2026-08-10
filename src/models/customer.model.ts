import { PrismaClient } from "@/generated/client";
import { BaseModel } from "./base.model";

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export class CustomerModel extends BaseModel<Customer> {
  constructor() {
    super("profile");
  }
}
