import { NextRequest, NextResponse } from "next/server";
import { VariantModel } from "@/models/variant.model";
import { VariantController } from "@/controllers/variant.controller";
import { prisma } from "@/lib/prisma";

// GET /api/products/123/variant?Color=Red&Size=M
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const controller = new VariantController(new VariantModel());

  const { id: productId } = await params;
  const searchParams = req.nextUrl.searchParams;

  // Resolve option value names to IDs
  const optionTypes = await prisma.optionType.findMany({
    where: { productId: BigInt(productId) },
    select: {
      name: true,
      optionValues: {
        select: { id: true, value: true }
      }
    }
  });

  const optionValueIds: number[] = [];
  if (optionTypes) {
    for (const optType of optionTypes) {
      const paramVal = searchParams.get(optType.name);
      if (paramVal) {
        const matchingVal = optType.optionValues.find(
          (v: any) => v.value.toLowerCase() === paramVal.toLowerCase()
        );
        if (matchingVal) {
          optionValueIds.push(Number(matchingVal.id));
        }
      }
    }
  }

  const { status, body } = await controller.findByOptions(productId, optionValueIds);
  return NextResponse.json(body, { status });
}
