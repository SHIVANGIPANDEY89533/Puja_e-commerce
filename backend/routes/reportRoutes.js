import express from 'express';
import { getAnalytics } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/analytics').get(protect, admin, getAnalytics);

export default router;
