import { NextRequest, NextResponse } from "next/server";
import { ProductModel } from "@/models/product.model";
import { ProductController } from "@/controllers/product.controller";

export async function GET(req: NextRequest) {
  const controller = new ProductController(new ProductModel());
  const { status, body } = await controller.list(req.nextUrl.searchParams);
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  const controller = new ProductController(new ProductModel());
  const payload = await req.json();
  const { status, body } = await controller.create(payload);
  return NextResponse.json(body, { status });
}
