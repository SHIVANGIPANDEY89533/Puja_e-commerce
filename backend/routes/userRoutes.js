import express from 'express';
import { 
  registerUser, 
  authUser, 
  getUserProfile, 
  updateUserProfile,
  submitQuery,
  getQueries,
  resolveQueryTicket
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/queries', submitQuery);

// Auth protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin protected routes
router.route('/queries')
  .get(protect, admin, getQueries);

router.route('/queries/:id')
  .put(protect, admin, resolveQueryTicket);

export default router;
