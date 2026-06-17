import express from 'express';
import { 
  getCampaigns, 
  createCampaign, 
  updateCampaignStatus 
} from '../controllers/campaignController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getCampaigns)
  .post(protect, admin, createCampaign);

router.route('/:id/status')
  .put(protect, admin, updateCampaignStatus);

export default router;
