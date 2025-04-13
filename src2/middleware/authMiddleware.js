const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Adjust path as needed
const { JWT_SECRET } = require('../config/jwtProvider'); // Adjust path as needed

// Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication token required' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    
    // If user not found
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add user data to request
    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
  try {
    await exports.verifyToken(req, res, async () => {
      // If role is not admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Admin access required' 
        });
      }
      
      next();
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during admin verification',
      error: error.message 
    });
  }
};

// Special middleware for first admin creation (if needed)
exports.allowFirstAdminCreation = async (req, res, next) => {
  try {
    // Check if any admin users exist
    const adminExists = await User.exists({ role: 'admin' });
    
    if (!adminExists) {
      // If no admin exists, allow the operation
      return next();
    }
    
    // If admins exist, apply normal admin check
    exports.isAdmin(req, res, next);
  } catch (error) {
    console.error('First admin check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during admin verification',
      error: error.message 
    });
  }
};