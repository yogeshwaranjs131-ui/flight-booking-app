import express from 'express';
import {
  createAirport,
  getAllAirports,
} from '../controllers/airportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').get(getAllAirports).post(protect, admin, createAirport);

export default router;