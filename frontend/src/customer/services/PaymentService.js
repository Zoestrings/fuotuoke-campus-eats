// ================================================================
// FUOTUOKE Campus Eats — Customer Payment Service (Paystack)
// ================================================================

import { post, get } from "../../shared/api/apiClient";

export class PaymentService {
  /**
   * Initialize a Paystack payment for an order.
   * @param {string} orderId - The order ID to pay for
   * @param {string} email - Customer email address
   * @param {number} amount - Amount in Naira (will be converted to kobo server-side)
   * @returns {{ success, authorization_url, reference }}
   */
  static async initializePayment(orderId, email, amount) {
    try {
      const data = await post("/payments/initialize", {
        orderId,
        email,
        amount,
        callbackUrl: `${window.location.origin}/payment/callback`
      });
      return { success: true, ...data };
    } catch (error) {
      return { success: false, error: error.message || "Payment initialization failed." };
    }
  }

  /**
   * Verify a Paystack payment by reference.
   * @param {string} reference - Paystack transaction reference
   * @returns {{ success, paymentStatus }}
   */
  static async verifyPayment(reference) {
    try {
      const data = await get(`/payments/verify/${reference}`);
      return data;
    } catch (error) {
      return { success: false, error: error.message || "Payment verification failed." };
    }
  }

  /**
   * Legacy card validation (kept for backward compatibility).
   * In production, all payments go through Paystack.
   */
  static processCard({ cardNumber, cardName, cardExpiry, cardCVV }) {
    if (!cardNumber || cardNumber.length !== 16) {
      return { success: false, error: "Card number must be 16 digits." };
    }
    if (!cardName.trim()) {
      return { success: false, error: "Please enter the cardholder name." };
    }
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      return { success: false, error: "Expiry format must be MM/YY." };
    }
    if (!cardCVV || cardCVV.length !== 3) {
      return { success: false, error: "CVV must be 3 digits." };
    }
    return { success: true };
  }
}
