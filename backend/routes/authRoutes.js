import express from "express";

import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";
import { getUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// User Profile
router.get(
  "/profile",
  protect,
  getUserProfile
);

export default router;
