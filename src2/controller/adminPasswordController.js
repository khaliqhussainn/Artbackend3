const bcrypt = require('bcrypt');
const User = require('../models/userModel');

/**
 * Reset admin password endpoint - requires super admin access or environment variable check
 */
const resetAdminPassword = async (req, res) => {
  try {
    // This endpoint should be well-protected
    // Either check for a special token/key or restrict to local environment only
    
    const { email, newPassword, secretKey } = req.body;
    
    // Optional: Add an additional security check
    if (secretKey !== process.env.ADMIN_RESET_SECRET) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid reset authorization' 
      });
    }
    
    // Find the admin user
    const adminUser = await User.findOne({ email, role: 'admin' });
    
    if (!adminUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin user not found' 
      });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Admin password reset successfully' 
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during password reset',
      error: error.message 
    });
  }
};

module.exports = { resetAdminPassword };