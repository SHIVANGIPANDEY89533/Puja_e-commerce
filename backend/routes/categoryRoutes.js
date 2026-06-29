import express from 'express';
import { 
  getCategories, 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories 
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

router.route('/all')
  .get(protect, admin, getAllCategories);

router.route('/reorder')
  .put(protect, admin, reorderCategories);

router.route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
