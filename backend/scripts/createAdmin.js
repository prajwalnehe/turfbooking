import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/turf-booking');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.argv[2] || 'admin@turfbooking.com' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      name: process.argv[3] || 'Admin User',
      email: process.argv[2] || 'admin@turfbooking.com',
      password: process.argv[4] || 'admin123',
      role: 'admin',
      isVerified: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${process.argv[4] || 'admin123'}`);
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();














