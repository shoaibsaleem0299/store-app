import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/middlewares/withRole";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard;


  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Today's orders count
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: { gte: startOfDay }
      }
    });

    // 2. Today's revenue
    const revenueData = await prisma.order.findMany({
      select: { totalAmount: true },
      where: {
        createdAt: { gte: startOfDay },
        status: { in: ["paid", "shipped", "delivered"] }
      }
    });

    const todayRevenue = revenueData.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // 3. Low stock variants (stock_qty < 5)
    const lowStockData = await prisma.variant.findMany({
      select: {
        id: true,
        skuCode: true,
        stockQty: true,
        price: true,
        productId: true,
        product: { select: { name: true } }
      },
      where: {
        stockQty: { lt: 5 }
      }
    });

    // Map the Prisma nested object back to the snake_case format the frontend likely expects
    const lowStock = lowStockData.map(v => ({
      id: Number(v.id),
      sku_code: v.skuCode,
      stock_qty: v.stockQty,
      price: Number(v.price),
      product_id: v.productId ? Number(v.productId) : null,
      products: v.product ? { name: v.product.name } : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        todayOrders: todayOrders ?? 0,
        todayRevenue,
        lowStock: lowStock ?? [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load dashboard metrics" },
      { status: 550 }
    );
  }
}
