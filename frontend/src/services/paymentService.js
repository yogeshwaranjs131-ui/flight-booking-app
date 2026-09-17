import api from "./api";

const paymentService = {
  // ============================================================
  // CREATE STRIPE PAYMENT INTENT
  // ============================================================

  createPaymentIntent: async (amount) => {
    const response = await api.post(
      "/create-payment-intent",
      {
        amount: Number(amount),
      }
    );

    return response.data;
  },
};

export default paymentService;