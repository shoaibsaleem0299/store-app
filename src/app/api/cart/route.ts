import { NextRequest, NextResponse } from "next/server";
import { CartModel } from "@/models/cart.model";
import { CartController } from "@/controllers/cart.controller";
import { withAuth } from "@/middlewares/withAuth";

export async function GET(req: NextRequest) {
  const user = await withAuth(req);
  if (user instanceof NextResponse) return user;

  const controller = new CartController(new CartModel());
  const { status, body } = await controller.getForUser(user.id);
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  const user = await withAuth(req);
  if (user instanceof NextResponse) return user;

  const controller = new CartController(new CartModel());
  const payload = await req.json();
  const { status, body } = await controller.create({ ...payload, user_id: user.id });
  return NextResponse.json(body, { status });
}
