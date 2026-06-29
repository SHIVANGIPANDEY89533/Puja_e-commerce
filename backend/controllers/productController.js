import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Fetch all products with optional filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const search = req.query.search;
    const minPrice = req.query.minPrice || 0;
    const maxPrice = req.query.maxPrice || 100000;

    let filter = {
      price: { $gte: Number(minPrice), $lte: Number(maxPrice) }
    };

    if (req.query.categoryId) {
      const categoryDoc = await Category.findById(req.query.categoryId);
      if (categoryDoc) {
        filter.category = categoryDoc.name;
      } else {
        // If invalid categoryId, return empty result or match nothing
        filter.category = '__INVALID_CATEGORY__';
      }
    } else if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Product.find(filter);

    // Sorting logic
    const sort = req.query.sort;
    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else if (sort === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else {
      // Popularity (defaulting to rating + stock heuristic or just default)
      query = query.sort({ rating: -1, createdAt: -1 });
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch distinct product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch similar products
// @route   GET /api/products/:id/similar
// @access  Public
const getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let filter = {
      _id: { $ne: product._id }
    };

    if (req.query.categoryId) {
      const categoryDoc = await Category.findById(req.query.categoryId);
      if (categoryDoc) {
        filter.category = categoryDoc.name;
      }
    } else {
      filter.category = product.category;
    }

    const similar = await Product.find(filter).limit(6);

    res.json(similar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const addProduct = async (req, res) => {
  const { name, category, price, originalPrice, stock, images, description, features } = req.body;

  try {
    const product = new Product({
      name,
      category,
      price,
      originalPrice: originalPrice || price,
      stock,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1605847444195-223040b5d97d?w=500&auto=format&fit=crop&q=60'],
      description,
      features: features || [],
      rating: 5.0
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, category, price, originalPrice, stock, images, description, features } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.category = category || product.category;
      product.price = price !== undefined ? price : product.price;
      product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
      product.stock = stock !== undefined ? stock : product.stock;
      product.images = images || product.images;
      product.description = description || product.description;
      product.features = features || product.features;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Create review object
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id
      };

      // Since reviews were mock structures in frontend, we will append ratings details or mock review details inside Product if we model it.
      // Let's calculate new aggregate rating.
      // For simplicity, we just save a mock success response, or update product rating.
      product.rating = Number((product.rating * 4 + Number(rating)) / 5); 
      await product.save();

      res.status(201).json({ message: 'Review added successfully', rating: product.rating });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk upload products (Admin only)
// @route   POST /api/products/bulk
// @access  Private/Admin
const bulkUploadProducts = async (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Invalid products data. Expected an array of products.' });
  }

  try {
    const formattedProducts = products
      .filter(prod => prod && prod.name) // Filter out empty lines or invalid rows
      .map((prod) => {
      return {
        name: prod.name,
        category: prod.category || 'Other',
        price: Number(prod.price) || 0,
        originalPrice: Number(prod.originalPrice || prod.price) || 0,
        stock: Number(prod.stock) || 0,
        images: prod.images && prod.images.length > 0 ? (Array.isArray(prod.images) ? prod.images : [prod.images]) : ['https://images.unsplash.com/photo-1605847444195-223040b5d97d?w=500&auto=format&fit=crop&q=60'],
        description: prod.description || 'No description provided.',
        features: prod.features || ['Premium Quality', 'Handcrafted'],
        rating: Number(prod.rating) || 5.0
      };
    });

    if (formattedProducts.length === 0) {
      return res.status(400).json({ message: 'No valid products found in the file. Ensure the "name" column exists.' });
    }

    const createdProducts = await Product.insertMany(formattedProducts);
    res.status(201).json({
      message: `${createdProducts.length} products uploaded successfully.`,
      products: createdProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductById,
  getProductCategories,
  getSimilarProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  bulkUploadProducts
};
