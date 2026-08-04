import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  downloadTicket,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Static Routes (குறிப்பிட்ட வழிகள் எப்போதும் முதலில் வர வேண்டும்)
router.route('/my-bookings').get(protect, getMyBookings);

// 2. Base Route for Creating Bookings
router.route('/').post(protect, createBooking);

// 3. Dynamic / ID Routes (ஐடி அடிப்படையிலான வழிகள் கீழே வர வேண்டும்)
router.route('/:id').get(protect, getBookingById);
router.route('/:id/cancel').put(protect, cancelBooking);
router.route('/:id/download').get(protect, downloadTicket);

export default router;