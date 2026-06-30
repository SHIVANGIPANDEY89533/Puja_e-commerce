import express from 'express';
import { 
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMyNotifications);

router.route('/clear-all')
  .delete(protect, clearAllNotifications);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

router.route('/:id/read')
  .put(protect, markAsRead);

export default router;
