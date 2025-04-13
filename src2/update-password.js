const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src2/models/userModel'); // Adjust path as needed
const config = require('../src2/config/jwtProvider'); // Adjust path as needed

// Your new plain password
const newPassword = '12345678901';

// Connect to MongoDB using the URI from config
mongoose.connect(config.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Generate hash
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      console.log('Generated hash:', hash);
      
      // Update user
      const result = await User.updateOne(
        { email: "khaliquehussain7@gmail.com", role: "admin" },
        { $set: { password: hash } }
      );
      
      console.log('Update result:', result);
      
      // Verify (without showing the password)
      const user = await User.findOne({ email: "khaliquehussain7@gmail.com" });
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log(`Password updated successfully for user: ${user.email}`);
      } else {
        console.log('User not found after update!');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });