import { NextRequest, NextResponse } from "next/server";
import { OrderModel } from "@/models/order.model";
import { OrderController } from "@/controllers/order.controller";
import { withRole } from "@/middlewares/withRole";

export async function GET(req: NextRequest) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;

  const controller = new OrderController(new OrderModel());
  const { status, body } = await controller.list(req.nextUrl.searchParams);
  return NextResponse.json(body, { status });
}
