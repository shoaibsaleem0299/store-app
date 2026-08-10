import { NextRequest, NextResponse } from "next/server";
import { CategoryModel } from "@/models/category.model";
import { CategoryController } from "@/controllers/category.controller";
import { withRole } from "@/middlewares/withRole";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const controller = new CategoryController(new CategoryModel());
  const { status, body } = await controller.getById(id);
  return NextResponse.json(body, { status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const controller = new CategoryController(new CategoryModel());
  const payload = await req.json();
  const { status, body } = await controller.update(id, payload);
  return NextResponse.json(body, { status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const controller = new CategoryController(new CategoryModel());
  const { status, body } = await controller.remove(id);
  return NextResponse.json(body, { status });
}
