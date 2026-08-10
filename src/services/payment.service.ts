import { prisma } from "@/lib/prisma";

export const paymentService = {
  async processPayment(orderId: string, status = "paid") {
    const result = await prisma.$queryRaw`SELECT process_order_payment(${orderId}, ${status})`;
    return result;
  },
};
