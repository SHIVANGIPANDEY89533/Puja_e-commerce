import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    const validProducts = wishlist.products.filter(p => p != null);
    
    // Auto-clean dead references
    if (validProducts.length !== wishlist.products.length) {
      wishlist.products = validProducts.map(p => p._id);
      await wishlist.save();
    }
    
    res.json(validProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log(`[ADD] Adding productId: ${productId} for user: ${req.user._id}`);
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.log(`[ADD] Wishlist not found for user. Creating a new one.`);
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Convert array elements to strings to reliably check existence
    const existingIds = wishlist.products.map(p => p.toString());
    if (!existingIds.includes(productId)) {
      console.log(`[ADD] Product not in wishlist. Pushing to array.`);
      wishlist.products.push(productId);
      await wishlist.save();
      console.log(`[ADD] Saved successfully.`);
    } else {
      console.log(`[ADD] Product already in wishlist. Skipping.`);
    }
    
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    const validProducts = populatedWishlist.products.filter(p => p != null);
    res.json(validProducts);
  } catch (error) {
    console.error(`[ADD ERROR]`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log(`[REMOVE] Removing productId: ${productId} for user: ${req.user._id}`);
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      console.log(`[REMOVE] Wishlist found. Current products count: ${wishlist.products.length}`);
      // Filter out the productId by comparing string values
      wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
      await wishlist.save();
      console.log(`[REMOVE] Saved successfully. New count: ${wishlist.products.length}`);
      
      const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
      const validProducts = populatedWishlist.products.filter(p => p != null);
      res.json(validProducts);
    } else {
      console.log(`[REMOVE] Wishlist NOT FOUND for user! Returning 404.`);
      res.status(404).json({ message: 'Wishlist not found' });
    }
  } catch (error) {
    console.error(`[REMOVE ERROR]`, error);
    res.status(500).json({ message: error.message });
  }
};

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
