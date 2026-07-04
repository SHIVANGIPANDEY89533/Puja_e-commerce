import express from 'express';
import { 
  createPaymentOrder, 
  verifyPayment, 
  getPaymentById,
  getAllPayments,
  updatePaymentStatus,
  getPaymentStats 
} from '../controllers/paymentController.js';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getAllPayments);
router.route('/stats').get(protect, admin, getPaymentStats);
router.route('/create-order').post(protect, createPaymentOrder);
router.route('/verify').post(protect, verifyPayment);
router.route('/webhook').post(handleRazorpayWebhook); // Webhook must be public
router.route('/:id').get(protect, admin, getPaymentById).put(protect, admin, updatePaymentStatus);

export default router;
