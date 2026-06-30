import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './models/Notification.js';
import User from './models/User.js';

dotenv.config();

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found, cannot seed notifications');
      process.exit(1);
    }

    const notifications = [
      {
        user: admin._id,
        type: 'Success',
        title: 'System Initialized',
        message: 'The new real-time database Notification Center has been activated successfully.',
        resourceType: 'System'
      },
      {
        user: admin._id,
        type: 'Info',
        title: 'Action Required: View Orders',
        message: 'Please review the latest orders in the dashboard.',
        resourceType: 'Order'
      }
    ];

    await Notification.insertMany(notifications);
    console.log('Test notifications seeded successfully to the Real DB!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
