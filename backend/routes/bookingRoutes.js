import express from "express";
import { 
  createBooking, 
  getMyBookings, 
  getBookingById,
  getBookingByPnr,
  cancelBooking,
  downloadTicket
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Specific static routes (Must be at the top)
router.get("/mybookings", protect, getMyBookings);
router.get("/my-bookings", protect, getMyBookings);
router.get("/pnr/:pnr", protect, getBookingByPnr);
router.post("/", protect, createBooking);

// 2. Action & Dynamic routes (Must be at the bottom)
router.put("/:id/cancel", protect, cancelBooking);
router.get("/:id/download", protect, downloadTicket);
router.get("/:id", protect, getBookingById);

export default router;