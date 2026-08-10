import { BaseApiService } from "./baseApiService";
import type { Customer } from "@/models/customer.model";

class CustomerService extends BaseApiService<Customer> {
  constructor() {
    super("admin/customers");
  }
}

export const customerService = new CustomerService();
