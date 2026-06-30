import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Notifies all admin users
 * @param {String} type - Type of notification (Info, Success, Warning, Error)
 * @param {String} title - Short title of notification
 * @param {String} message - Detailed message
 * @param {String} relatedId - ID of related resource
 * @param {String} resourceType - Type of resource (Order, Product, Ticket, User, Coupon, Campaign, Banner)
 */
export const notifyAdmins = async (type, title, message, relatedId = null, resourceType = null) => {
  try {
    // Find all admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    
    if (admins.length === 0) return;

    // Create a notification document for each admin
    const notifications = admins.map(admin => ({
      user: admin._id,
      type,
      title,
      message,
      relatedId: relatedId ? relatedId.toString() : null,
      resourceType
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error generating admin notifications:', error);
  }
};
