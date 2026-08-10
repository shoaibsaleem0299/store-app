import { NextRequest, NextResponse } from "next/server";
import { ProductModel } from "@/models/product.model";
import { ProductController } from "@/controllers/product.controller";
import { withRole } from "@/middlewares/withRole";

export async function POST(req: NextRequest) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;

  const controller = new ProductController(new ProductModel());
  const payload = await req.json();
  const { status, body } = await controller.createWithVariants(payload);
  return NextResponse.json(body, { status });
}
