// checkAdminStatus.js
const mongoose = require('mongoose');
const User = require('../src2/models/userModel'); // Adjust path as needed
const { MONGODB_URI } = require('../src2/config/jwtProvider'); // Adjust path as needed

const checkAdminStatus = async () => {
  try {
    console.log('MONGODB_URI:', MONGODB_URI);
    
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Email of the user to check
    const userEmail = 'khaliquehussain7@gmail.com';

    // Find the user
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log(`User with email ${userEmail} not found!`);
      process.exit(1);
    }

    console.log('User found:');
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`User has admin privileges: ${user.role === 'admin'}`);

    // If not admin, update to admin
    if (user.role !== 'admin') {
      console.log('Updating user to admin role...');
      user.role = 'admin';
      await user.save();
      console.log('User updated to admin role successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking admin status:', error);
    process.exit(1);
  }
};

// Run the function
checkAdminStatus();