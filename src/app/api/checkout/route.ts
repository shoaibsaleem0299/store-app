import { NextRequest, NextResponse } from "next/server";
import { OrderModel } from "@/models/order.model";
import { CustomerModel } from "@/models/customer.model";
import { whatsappService } from "@/services/whatsapp.service";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { cartItems, shipping_address } = payload;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty." }, { status: 400 });
    }

    if (!shipping_address || !shipping_address.phone) {
      return NextResponse.json({ success: false, message: "Shipping address and phone are required." }, { status: 400 });
    }

    const customerModel = new CustomerModel();
    let buyerId: string;

    // Look up user by phone
    const existingUser = await customerModel.findByPhone(shipping_address.phone);

    if (existingUser) {
      buyerId = existingUser.id;
    } else {
      // Create new user
      const newUser = await customerModel.createCheckoutUser({
        phone: shipping_address.phone,
        email: shipping_address.email,
        full_name: shipping_address.fullName,
        address_line: shipping_address.addressLine,
        city: shipping_address.city,
        state: shipping_address.state,
        postal_code: shipping_address.zipCode,
        country: shipping_address.country,
      });
      buyerId = newUser.id;
    }

    // Create order from local cart
    const orderModel = new OrderModel();
    const orderId = await orderModel.createFromLocalCart(buyerId, cartItems, shipping_address);

    // Fetch the total amount to send in the WhatsApp message
    const orderDetails = await orderModel.findById(orderId);
    if (orderDetails && shipping_address.phone) {
      const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
      await whatsappService.sendOrderConfirmation(
        shipping_address.phone,
        orderId,
        Number(orderDetails.total_amount) || 0,
        origin
      );
    }

    return NextResponse.json({ success: true, orderId }, { status: 201 });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Checkout failed" }, { status: 500 });
  }
}
