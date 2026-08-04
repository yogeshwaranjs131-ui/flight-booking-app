import api from './api';

const paymentService = {
  // Get Razorpay Key from backend
  getKey: () => api.get('/payments/get-key'),

  // Create a new order on Razorpay via our backend
  createOrder: (amount) => api.post('/payments/create-order', { amount }),
};

export default paymentService;