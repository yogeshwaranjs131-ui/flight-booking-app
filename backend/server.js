import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';

// Route files
import authRoutes from './routes/authRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js'; // bookingRoutes ஐ import செய்யவும்
import airportRoutes from './routes/airportRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Mount routers
// இந்த வரிசை மிகவும் முக்கியம். bookingRoutes சரியாக வேலை செய்ய, அது மற்ற பொதுவான வழிகளுக்கு முன்பாக வர வேண்டும்.
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes); // bookingRoutes ஐப் பயன்படுத்தவும்
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