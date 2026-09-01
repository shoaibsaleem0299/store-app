import axios from "axios";

export class WhatsAppService {
  async sendOrderConfirmation(phone: string, orderId: string, totalAmount: number, baseUrl: string): Promise<boolean> {
    try {
      const trackingUrl = `${baseUrl}/track-order/${orderId}`;
      const formattedTotal = Number(totalAmount).toLocaleString("en-PK", { style: "currency", currency: "PKR" });

      const message = `*Order Confirmed!*\n\nThank you for your purchase. Your order (${orderId.split("-")[0]}) for ${formattedTotal} has been successfully placed.\n\nYou can track your order status here:\n${trackingUrl}`;

      // Whapi expects the phone number in international format without '+' (e.g., 923001234567)
      let cleanPhone = phone.replace(/\D/g, ""); // Strip all non-numeric characters

      // Auto-format Pakistani local numbers (03xx...) to international format (923xx...)
      if (cleanPhone.startsWith("03") && cleanPhone.length === 11) {
        cleanPhone = "92" + cleanPhone.substring(1);
      }
      const token = process.env.WHAPI_TOKEN;

      if (!token) {
        console.warn("WHAPI_TOKEN is not set in environment variables.");
        return false;
      }

      const response = await axios.post(
        'https://gate.whapi.cloud/messages/text',
        {
          to: `${cleanPhone}@s.whatsapp.net`,
          body: message
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp Message Sent via Whapi:', response.data);
      return true;
    } catch (error: any) {
      console.error('WhatsApp Error:', error.response ? error.response.data : error.message);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
