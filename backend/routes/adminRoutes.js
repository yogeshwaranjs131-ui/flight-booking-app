import express from "express";

import {
  getDashboardStats,
  getAllUsers,
  getAllBookings,
  getAllFlights,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Admin Dashboard Statistics
 * @access  Admin
 */
router.get(
  "/dashboard",
  protect,
  admin,
  getDashboardStats
);

/**
 * @route   GET /api/admin/users
 * @desc    Get All Users
 * @access  Admin
 */
router.get(
  "/users",
  protect,
  admin,
  getAllUsers
);

/**
 * @route   GET /api/admin/bookings
 * @desc    Get All Bookings
 * @access  Admin
 */
router.get(
  "/bookings",
  protect,
  admin,
  getAllBookings
);

/**
 * @route   GET /api/admin/flights
 * @desc    Get All Flights
 * @access  Admin
 */
router.get(
  "/flights",
  protect,
  admin,
  getAllFlights
);

export default router;