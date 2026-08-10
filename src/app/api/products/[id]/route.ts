import { NextRequest, NextResponse } from "next/server";
import { ProductModel } from "@/models/product.model";
import { ProductController } from "@/controllers/product.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const controller = new ProductController(new ProductModel());
  const { status, body } = await controller.getWithVariants(id);
  return NextResponse.json(body, { status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const controller = new ProductController(new ProductModel());
  const payload = await req.json();
  const { status, body } = await controller.update(id, payload);
  return NextResponse.json(body, { status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const controller = new ProductController(new ProductModel());
  const { status, body } = await controller.remove(id);
  return NextResponse.json(body, { status });
}
