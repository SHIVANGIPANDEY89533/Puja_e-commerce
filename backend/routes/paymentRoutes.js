import express from 'express';
import { 
  createPaymentOrder, 
  verifyPayment, 
  getPaymentDetails 
} from '../controllers/paymentController.js';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/create-order').post(protect, createPaymentOrder);
router.route('/verify').post(protect, verifyPayment);
router.route('/webhook').post(handleRazorpayWebhook); // Webhook must be public
router.route('/:id').get(protect, getPaymentDetails);

export default router;
