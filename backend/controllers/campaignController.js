import Campaign from '../models/Campaign.js';

// @desc    Get all marketing campaigns (Admin only)
// @route   GET /api/campaigns
// @access  Private/Admin
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new campaign (Admin only)
// @route   POST /api/campaigns
// @access  Private/Admin
const createCampaign = async (req, res) => {
  const { name, type, startDate, endDate, status } = req.body;

  try {
    const campaign = await Campaign.create({
      name,
      type,
      startDate,
      endDate,
      status: status || 'Scheduled',
      sent: status === 'Running' ? 100 : 0
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update campaign status (Admin only)
// @route   PUT /api/campaigns/:id/status
// @access  Private/Admin
const updateCampaignStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const campaign = await Campaign.findById(req.params.id);

    if (campaign) {
      campaign.status = status;
      if (status === 'Running' && campaign.sent === 0) {
        campaign.sent = 500; // Mock dispatch sent size
      }
      const updatedCampaign = await campaign.save();
      res.json(updatedCampaign);
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getCampaigns,
  createCampaign,
  updateCampaignStatus
};
