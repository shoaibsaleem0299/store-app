import { NextRequest, NextResponse } from "next/server";
import { CustomerModel } from "@/models/customer.model";
import { CustomerController } from "@/controllers/customer.controller";
import { withRole } from "@/middlewares/withRole";

export async function GET(req: NextRequest) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;

  const controller = new CustomerController(new CustomerModel());
  const { status, body } = await controller.list(req.nextUrl.searchParams);
  return NextResponse.json(body, { status });
}
