import { NextRequest, NextResponse } from "next/server";
import { CartModel } from "@/models/cart.model";
import { CartController } from "@/controllers/cart.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const controller = new CartController(new CartModel());
  const { status, body } = await controller.getById(id);
  return NextResponse.json(body, { status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const controller = new CartController(new CartModel());
  const payload = await req.json();
  const { status, body } = await controller.update(id, payload);
  return NextResponse.json(body, { status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const controller = new CartController(new CartModel());
  const { status, body } = await controller.remove(id);
  return NextResponse.json(body, { status });
}
