const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solidex';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@solidex.in' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@solidex.in');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@solidex.in',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log('✓ Admin user created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Email: admin@solidex.in');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
