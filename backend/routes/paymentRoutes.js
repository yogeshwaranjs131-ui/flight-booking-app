import express from "express";

import {
  createPayment,
  getPaymentById,
  getMyPayments,
  getAllPayments,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/payments
 * @desc    Create Payment
 * @access  Private
 */
router.post(
  "/",
  protect,
  createPayment
);

/**
 * @route   GET /api/payments
 * @desc    Get My Payments
 * @access  Private
 */
router.get(
  "/",
  protect,
  getMyPayments
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get Payment By Id
 * @access  Private
 */
router.get(
  "/:id",
  protect,
  getPaymentById
);

/**
 * @route   GET /api/payments/admin/all
 * @desc    Get All Payments
 * @access  Admin
 */
router.get(
  "/admin/all",
  protect,
  admin,
  getAllPayments
);

export default router;
