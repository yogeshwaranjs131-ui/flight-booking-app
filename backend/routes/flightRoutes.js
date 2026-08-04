import express from "express";

import {
  searchFlights,
  createFlight,
  getAllFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";

import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/search", searchFlights); // Moved search route to the top
router.get("/", getAllFlights); // getFlights-க்கு பதிலாக getAllFlights என மாற்றப்பட்டுள்ளது
router.get("/:id", getFlightById);

// Admin Routes
router.post(
  "/",
  protect,
  admin,
  createFlight
);

router.put(
  "/:id",
  protect,
  admin,
  updateFlight
);

router.delete(
  "/:id",
  protect,
  admin,
  deleteFlight
);

export default router;