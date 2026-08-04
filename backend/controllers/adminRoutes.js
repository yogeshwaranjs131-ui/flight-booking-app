import express from 'express';
import {
  getAllUsers,
  getAllBookings,
  createFlight,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Middleware to protect all admin routes
router.use(protect, admin);

router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.post('/flights', createFlight);

export default router;