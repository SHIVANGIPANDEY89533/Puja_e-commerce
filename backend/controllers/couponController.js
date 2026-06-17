import Coupon from '../models/Coupon.js';

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  const { code, discount, type, minCart } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount,
      type,
      minCart
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle coupon status (Admin only)
// @route   PUT /api/coupons/:code/toggle
// @access  Private/Admin
const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

    if (coupon) {
      coupon.active = !coupon.active;
      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon code not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a coupon (Admin only)
// @route   DELETE /api/coupons/:code
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed successfully' });
    } else {
      res.status(404).json({ message: 'Coupon code not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  const { code, cartValue } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    if (!coupon.active) {
      return res.status(400).json({ message: 'Coupon is no longer active' });
    }
    if (cartValue < coupon.minCart) {
      return res.status(400).json({ message: `Minimum cart value of ₹${coupon.minCart} required` });
    }

    res.json({
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon
};
