import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import users from './data/users.js';
import products from './data/products.js';
import coupons from './data/coupons.js';
import campaigns from './data/campaigns.js';
import seo from './data/seo.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
import Campaign from './models/Campaign.js';
import Seo from './models/Seo.js';
import Order from './models/Order.js';
import Query from './models/Query.js';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const importData = async () => {
  try {
    console.log('Clearing existing database collections...');
    await Order.deleteMany();
    await Query.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();
    await Campaign.deleteMany();
    await Seo.deleteMany();

    console.log('Hashing passwords for mock users...');
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    console.log('Seeding Users...');
    await User.insertMany(hashedUsers);

    console.log('Seeding Products...');
    await Product.insertMany(products);

    console.log('Seeding Coupons...');
    await Coupon.insertMany(coupons);

    console.log('Seeding Campaigns...');
    await Campaign.insertMany(campaigns);

    console.log('Seeding SEO settings...');
    await Seo.create(seo);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    console.log('Clearing all database collections...');
    await Order.deleteMany();
    await Query.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();
    await Campaign.deleteMany();
    await Seo.deleteMany();

    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyData();
} else {
  importData();
}
