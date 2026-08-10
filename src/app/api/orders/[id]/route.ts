import { NextRequest, NextResponse } from "next/server";
import { OrderModel } from "@/models/order.model";
import { OrderController } from "@/controllers/order.controller";
import { withAuth } from "@/middlewares/withAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await withAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const controller = new OrderController(new OrderModel());
  
  const { status, body } = await controller.getWithItems(id);
  const resBody = body as any;
  
  if (resBody.success && resBody.data) {
    const isOwner = resBody.data.buyer_id === user.id;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(body, { status });
}
