import Address from '../models/Address.js';

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get address by ID
// @route   GET /api/addresses/:id
// @access  Private
export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (address && address.user.toString() === req.user._id.toString()) {
      res.json(address);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
export const createAddress = async (req, res) => {
  try {
    const { fullName, phone, flat, area, landmark, city, state, pincode, addressType, isDefault } = req.body;

    // Check if this is the first address, if so, make it default
    const count = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = count === 0 ? true : isDefault;

    const address = new Address({
      user: req.user._id,
      fullName,
      phone,
      flat,
      area,
      landmark,
      city,
      state,
      pincode,
      addressType,
      isDefault: shouldBeDefault,
    });

    const createdAddress = await address.save();
    res.status(201).json(createdAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (address && address.user.toString() === req.user._id.toString()) {
      address.fullName = req.body.fullName || address.fullName;
      address.phone = req.body.phone || address.phone;
      address.flat = req.body.flat || address.flat;
      address.area = req.body.area || address.area;
      address.landmark = req.body.landmark !== undefined ? req.body.landmark : address.landmark;
      address.city = req.body.city || address.city;
      address.state = req.body.state || address.state;
      address.pincode = req.body.pincode || address.pincode;
      address.addressType = req.body.addressType || address.addressType;
      
      if (req.body.isDefault !== undefined) {
        address.isDefault = req.body.isDefault;
      }

      const updatedAddress = await address.save();
      res.json(updatedAddress);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (address && address.user.toString() === req.user._id.toString()) {
      await address.deleteOne();
      
      // If it was default, assign default to another address if exists
      if (address.isDefault) {
        const nextAddress = await Address.findOne({ user: req.user._id });
        if (nextAddress) {
          nextAddress.isDefault = true;
          await nextAddress.save();
        }
      }
      
      res.json({ message: 'Address removed' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
