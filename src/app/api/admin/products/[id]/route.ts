import { NextRequest, NextResponse } from "next/server";
import { ProductModel } from "@/models/product.model";
import { ProductController } from "@/controllers/product.controller";
import { withRole } from "@/middlewares/withRole";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;

  const controller = new ProductController(new ProductModel());
  const payload = await req.json();
  const id = (await params).id;
  const { status, body } = await controller.updateWithVariants(id, payload);
  return NextResponse.json(body, { status });
}
