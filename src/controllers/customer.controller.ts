import { BaseController } from "./base.controller";
import { CustomerModel, Customer } from "@/models/customer.model";

export class CustomerController extends BaseController<Customer> {
  constructor(private customerModel: CustomerModel) {
    super(customerModel);
  }
}
