import Category from '../models/Category.js';

// @desc    Fetch all active categories (Customer app)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'Active' }).sort({ displayOrder: 1, createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch all categories (Admin)
// @route   GET /api/categories/all
// @access  Private/Admin
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ displayOrder: 1, createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  const { name, icon, banner, description, status, displayOrder } = req.body;

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      icon,
      banner,
      description,
      status,
      displayOrder: displayOrder || 0
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = req.body.name || category.name;
      category.icon = req.body.icon !== undefined ? req.body.icon : category.icon;
      category.banner = req.body.banner !== undefined ? req.body.banner : category.banner;
      category.description = req.body.description !== undefined ? req.body.description : category.description;
      category.status = req.body.status || category.status;
      category.displayOrder = req.body.displayOrder !== undefined ? req.body.displayOrder : category.displayOrder;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private/Admin
const reorderCategories = async (req, res) => {
  const { categories } = req.body; // Array of { id, displayOrder }
  try {
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    // Bulk write is more efficient, but let's use Promise.all for simplicity
    await Promise.all(
      categories.map((c) =>
        Category.findByIdAndUpdate(c.id, { displayOrder: c.displayOrder })
      )
    );
    
    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
};
