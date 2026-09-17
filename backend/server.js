
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import Stripe from "stripe";

import authRoutes from "./routes/authRoutes.js";
import flightRoutes from "./routes/flightRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import airportRoutes from "./routes/airportRoutes.js";

dotenv.config();

connectDB();

const app = express();

// ============================================================
// STRIPE
// ============================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================================
// CORS CONFIGURATION
// ============================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://flight-booking-app-pied.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS blocked:", origin);

    return callback(new Error("CORS blocked"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

// Apply CORS
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options("*", cors(corsOptions));

// ============================================================
// BODY PARSER
// ============================================================

app.use(express.json());

// ============================================================
// STRIPE PAYMENT INTENT
// ============================================================

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body || {};

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "A valid amount is required.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "inr",

      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Payment Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Payment creation failed",
    });
  }
});

// ============================================================
// ROUTES
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/flights", flightRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/airports", airportRoutes);

// ============================================================
// HOME / HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Flight Booking API is running...",
  });
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.message === "CORS blocked") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked for this origin",
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

export default app;
