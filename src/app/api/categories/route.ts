import { NextRequest, NextResponse } from "next/server";
import { CategoryModel } from "@/models/category.model";
import { CategoryController } from "@/controllers/category.controller";
import { withRole } from "@/middlewares/withRole";

export async function GET(req: NextRequest) {
  const controller = new CategoryController(new CategoryModel());
  const { status, body } = await controller.list(req.nextUrl.searchParams);
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;

  const controller = new CategoryController(new CategoryModel());
  const payload = await req.json();
  const { status, body } = await controller.create(payload);
  return NextResponse.json(body, { status });
}
