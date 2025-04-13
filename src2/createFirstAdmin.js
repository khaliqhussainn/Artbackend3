const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src2/models/userModel'); // Adjust path as needed
const config = require('../src2/config/jwtProvider'); // Adjust path as needed

const updateAdminPassword = async () => {
  try {
    console.log('MONGODB_URI:', config.MONGODB_URI); // Log the URI
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Email of the admin whose password you want to update
    const adminEmail = 'khaliquehussain7@gmail.com';
    
    // New password
    const newPassword = '1234567890';

    // Find the admin user
    const adminUser = await User.findOne({ email: adminEmail, role: 'admin' });

    if (!adminUser) {
      console.log(`Admin user with email ${adminEmail} not found!`);
      process.exit(1);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('Admin password updated successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`New Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
};

// Run the function
updateAdminPassword();