import express from "express";

import {
  createAirport,
  getAirports,
  getAirportById,
  updateAirport,
  deleteAirport,
} from "../controllers/airportController.js";

import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/airports
 * @desc    Get All Airports
 * @access  Public
 */
router.get("/", getAirports);

/**
 * @route   GET /api/airports/:id
 * @desc    Get Airport By Id
 * @access  Public
 */
router.get("/:id", getAirportById);

/**
 * @route   POST /api/airports
 * @desc    Create Airport
 * @access  Admin
 */
router.post(
  "/",
  protect,
  admin,
  createAirport
);

/**
 * @route   PUT /api/airports/:id
 * @desc    Update Airport
 * @access  Admin
 */
router.put(
  "/:id",
  protect,
  admin,
  updateAirport
);

/**
 * @route   DELETE /api/airports/:id
 * @desc    Delete Airport
 * @access  Admin
 */
router.delete(
  "/:id",
  protect,
  admin,
  deleteAirport
);

export default router;
