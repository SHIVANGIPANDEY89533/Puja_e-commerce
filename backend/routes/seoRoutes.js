import express from 'express';
import { 
  getSEOConfig, 
  updateSEOConfig 
} from '../controllers/seoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSEOConfig)
  .put(protect, admin, updateSEOConfig);

export default router;
