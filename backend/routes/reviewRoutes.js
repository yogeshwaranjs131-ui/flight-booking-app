import express from "express";
import { createReview, getReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", protect, createReview);

export default router;