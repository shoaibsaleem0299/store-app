import { NextRequest, NextResponse } from "next/server";
import { OrderModel } from "@/models/order.model";
import { OrderController } from "@/controllers/order.controller";
import { withRole } from "@/middlewares/withRole";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const controller = new OrderController(new OrderModel());
  
  const payload = await req.json(); // { status: "shipped" / "delivered" / "paid" / "cancelled" }
  const { status, body } = await controller.update(id, payload);
  return NextResponse.json(body, { status });
}
