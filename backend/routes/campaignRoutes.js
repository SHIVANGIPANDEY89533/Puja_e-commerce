import express from 'express';
import { 
  getCampaigns, 
  createCampaign, 
  updateCampaignStatus,
  deleteCampaign
} from '../controllers/campaignController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getCampaigns)
  .post(protect, admin, createCampaign);

router.route('/:id/status')
  .put(protect, admin, updateCampaignStatus);

router.route('/:id')
  .delete(protect, admin, deleteCampaign);

export default router;
