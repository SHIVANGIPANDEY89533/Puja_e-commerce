import express from 'express';
import { exportProducts, exportReports } from '../controllers/exportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/products').get(protect, admin, exportProducts);
router.route('/reports').get(protect, admin, exportReports);

export default router;
