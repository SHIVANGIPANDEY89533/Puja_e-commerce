import Banner from '../models/Banner.js';
import { notifyAdmins } from '../services/notificationService.js';

// @desc    Get active banners for a specific position
// @route   GET /api/banners?position=Home
// @access  Public
const getBanners = async (req, res) => {
  try {
    const position = req.query.position;
    
    let filter = { status: 'Active' };
    if (position) {
      filter.displayPosition = position;
    }

    const banners = await Banner.find(filter)
      .sort({ priority: -1, createdAt: -1 });
    
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/banners/all
// @access  Private/Admin
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
  const { title, image, redirectUrl, displayPosition, priority, startDate, endDate, status } = req.body;

  try {
    const banner = await Banner.create({
      title,
      image,
      redirectUrl,
      displayPosition: displayPosition || 'Home',
      priority: priority || 0,
      startDate,
      endDate,
      status: status || 'Active'
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      const oldStatus = banner.status;
      
      banner.title = req.body.title || banner.title;
      banner.image = req.body.image || banner.image;
      banner.redirectUrl = req.body.redirectUrl !== undefined ? req.body.redirectUrl : banner.redirectUrl;
      banner.displayPosition = req.body.displayPosition || banner.displayPosition;
      banner.priority = req.body.priority !== undefined ? req.body.priority : banner.priority;
      banner.startDate = req.body.startDate || banner.startDate;
      banner.endDate = req.body.endDate || banner.endDate;
      banner.status = req.body.status || banner.status;

      const updatedBanner = await banner.save();

      if (req.body.status && req.body.status !== oldStatus) {
        if (req.body.status === 'Active') {
          await notifyAdmins('Info', 'Banner Activated', `Banner "${updatedBanner.title}" has been activated.`, updatedBanner._id, 'Banner');
        } else if (req.body.status === 'Inactive') {
          await notifyAdmins('Warning', 'Banner Deactivated', `Banner "${updatedBanner.title}" has been deactivated.`, updatedBanner._id, 'Banner');
        }
      }

      res.json(updatedBanner);
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      await banner.deleteOne();
      res.json({ message: 'Banner removed' });
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
