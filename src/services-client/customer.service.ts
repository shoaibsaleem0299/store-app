import { BaseApiClientService } from "./baseApiService";
import type { Customer } from "@/models/customer.model";

class CustomerService extends BaseApiClientService<Customer> {
  constructor() {
    super("customers");
  }
}

export const customerService = new CustomerService();
