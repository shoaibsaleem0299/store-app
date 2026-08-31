import { NextRequest, NextResponse } from "next/server";
import { CustomerController } from "@/controllers/customer.controller";
import { CustomerModel } from "@/models/customer.model";
import { withRole } from "@/middlewares/withRole";

const controller = new CustomerController(new CustomerModel());

export async function GET(req: NextRequest) {
  try {
    const authResult = await withRole(["admin"])(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const result = await controller.list(req.nextUrl.searchParams);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
