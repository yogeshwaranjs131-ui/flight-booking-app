import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import Stripe from 'stripe';

import authRoutes from './routes/authRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import airportRoutes from './routes/airportRoutes.js';

dotenv.config();
connectDB();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.use(cors());
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'A valid amount is required.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/airports', airportRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

export default app;