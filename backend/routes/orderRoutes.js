import express from 'express';
import { 
  addOrderItems, 
  getOrderById, 
  getMyOrders, 
  getOrders, 
  assignOrderDelivery, 
  getDeliveryAssignedOrders, 
  updateDeliveryStatus,
  updateOrderStatusAdmin
} from '../controllers/orderController.js';
import { protect, admin, delivery } from '../middleware/authMiddleware.js';

const router = express.Router();

// Order listing / placement routes
router.route('/')
  .get(protect, admin, getOrders)
  .post(protect, addOrderItems);

// Delivery Console routes
router.route('/delivery/assigned')
  .get(protect, delivery, getDeliveryAssignedOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

// Tracking public details
router.route('/:id')
  .get(getOrderById);

// Order actions
router.route('/:id/assign')
  .put(protect, admin, assignOrderDelivery);

router.route('/:id/delivery-status')
  .put(protect, delivery, updateDeliveryStatus);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatusAdmin);

export default router;
