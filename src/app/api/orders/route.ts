import { NextRequest, NextResponse } from "next/server";
import { OrderModel } from "@/models/order.model";
import { OrderController } from "@/controllers/order.controller";
import { withAuth } from "@/middlewares/withAuth";

export async function GET(req: NextRequest) {
  const user = await withAuth(req);
  if (user instanceof NextResponse) return user;

  const controller = new OrderController(new OrderModel());
  const { status, body } = await controller.getForBuyer(user.id, req.nextUrl.searchParams);
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  const user = await withAuth(req);
  if (user instanceof NextResponse) return user;

  const controller = new OrderController(new OrderModel());
  const payload = await req.json();
  const { status, body } = await controller.create({ ...payload, buyer_id: user.id });
  return NextResponse.json(body, { status });
}
