import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";
import { withAuth } from "@/middlewares/withAuth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await withAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  try {
    const success = await paymentService.processPayment(id, "paid");
    return NextResponse.json({ success, data: success, message: "Payment processed successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process payment" },
      { status: 400 }
    );
  }
}
