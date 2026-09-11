import express from 'express';
import { getUserProfile, uploadProfileImage } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile').get(protect, getUserProfile);
router.route('/profile-image').post(protect, uploadProfileImage); // 

export default router;