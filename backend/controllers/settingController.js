import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// @desc    Get store settings (Public/Admin)
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne({});
  if (!settings) {
    settings = await Setting.create({});
  }
  res.json(settings);
});

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne({});
  
  if (!settings) {
    settings = new Setting();
  }

  // Update all provided fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      settings[key] = req.body[key];
    }
  });

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});
