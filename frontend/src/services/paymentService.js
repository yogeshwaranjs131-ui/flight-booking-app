import api from './api';

const paymentService = {
  createPaymentIntent: (amount) => api.post('/create-payment-intent', { amount }),
};

export default paymentService;