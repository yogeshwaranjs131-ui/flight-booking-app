

/**
 * Process Payment
 */
export const processPayment = async (
  amount,
  paymentMethod
) => {
  try {
    return {
      success: true,
      amount,
      paymentMethod,
      transactionId:
        "TXN" + Date.now(),
      paymentStatus: "Success",
      paidAt: new Date(),
    };
  } catch (error) {
    throw new Error(
      "Payment processing failed"
    );
  }
};

/**
 * Verify Payment
 */
export const verifyPayment = async (
  transactionId
) => {
  return {
    success: true,
    transactionId,
    verified: true,
  };
};

/**
 * Refund Payment
 */
export const refundPayment = async (
  transactionId
) => {
  return {
    success: true,
    transactionId,
    refundStatus: "Completed",
  };
};
