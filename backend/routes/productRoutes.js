import express from 'express';
import { 
  getProducts, 
  getProductById, 
  getProductCategories,
  getSimilarProducts,
  addProduct, 
  updateProduct, 
  deleteProduct,
  createProductReview,
  bulkUploadProducts
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, addProduct);

// Bulk upload route (must be before :id to prevent mapping conflict)
router.route('/bulk')
  .post(protect, admin, bulkUploadProducts);

router.route('/categories')
  .get(getProductCategories);

router.route('/:id/similar')
  .get(getSimilarProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Customer review route
router.route('/:id/reviews')
  .post(protect, createProductReview);

export default router;
