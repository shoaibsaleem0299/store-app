import { NextRequest, NextResponse } from "next/server";
import { OrderModel } from "@/models/order.model";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const orderModel = new OrderModel();
    // Using findWithItems ensures we get all the variant option values and product names we configured earlier
    const orderData = await orderModel.findWithItems(id);

    if (!orderData) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Since this is a public tracking endpoint, we ONLY return what the customer needs to see.
    // We strip out the internal buyer_id and just pass down the necessary data.
    const trackingData = {
      id: orderData.id,
      order_number: orderData.order_number,
      status: orderData.status,
      payment_type: orderData.payment_type,
      payment_status: orderData.payment_status,
      total_amount: orderData.total_amount,
      created_at: orderData.created_at,
      shipping_address: orderData.shipping_address,
      order_items: orderData.order_items,
    };

    return NextResponse.json(trackingData);
  } catch (error: any) {
    console.error("Failed to fetch tracking data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load order details" },
      { status: 500 }
    );
  }
}
