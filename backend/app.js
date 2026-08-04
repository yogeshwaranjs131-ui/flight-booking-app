import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import flightRoutes from "./routes/flightRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import airportRoutes from "./routes/airportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

const app = express();

/* ==========================
   MIDDLEWARES
========================== */

// Set security HTTP headers
app.use(helmet());

// CORS ஐ உள்ளமைக்கவும். உங்கள் Netlify frontend URL மற்றும் உள்ளூர் முகவரியை அனுமதிக்கவும்.
const allowedOrigins = [
  'http://localhost:5173', // உங்கள் உள்ளூர் frontend முகவரி
  'https://your-netlify-app-name.netlify.app' // உங்கள் Netlify தளத்தின் உண்மையான முகவரியை இங்கே மாற்றவும்
];

app.use(cors({
  origin: allowedOrigins
}));

// Rate Limiter for security against brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use('/api', limiter); // Apply the rate limiting to all API routes

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* ==========================
   HEALTH CHECK ROUTE
========================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Flight Booking API Running...",
  });
});

/* ==========================
   API ROUTES
========================== */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/flights",
  flightRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/airports",
  airportRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

/* ==========================
   ERROR HANDLING
========================== */

app.use(notFound);

app.use(errorHandler);

/* ==========================
   EXPORT APP
========================== */

export default app;
