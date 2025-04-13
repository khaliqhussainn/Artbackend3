// adminAuthController.js - Fixed version
const userService = require("../service/userService.js");
const jwtProvider = require("../config/jwtProvider.js");
const bcrypt = require("bcrypt");

/**
 * Controller for admin login - FIXED VERSION
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with JWT token or error message
 */
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log(`Admin login attempt for email: ${email}`);
        
        // Check if SECRET_KEY exists
        if (!process.env.SECRET_KEY) {
            console.error("SECRET_KEY environment variable is missing");
            return res.status(500).send({ error: "Server configuration error" });
        }

        // First find the user by email
        const user = await userService.getUserByEmail(email);

        if (!user) {
            console.log(`User not found with email: ${email}`);
            return res.status(404).send({ message: 'User not found with email: ' + email });
        }

        // Next, verify the password - do this BEFORE checking admin role
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            console.log(`Invalid password for user: ${email}`);
            return res.status(401).send({ message: 'Invalid Password' });
        }

        // Only after successfully authenticating, check for admin role
        if (user.role !== 'admin') {
            console.log(`Access denied for non-admin user: ${email}`);
            return res.status(403).send({ message: 'Access denied. Admin privileges required.' });
        }

        // Generate JWT token with admin role
        let jwt;
        try {
            jwt = jwtProvider.generateToken(user._id);
            console.log(`JWT generated successfully for admin: ${email}`);
        } catch (jwtError) {
            console.error("Error generating JWT:", jwtError);
            return res.status(500).send({ error: "Failed to generate authentication token" });
        }

        console.log(`Admin login successful for: ${email}`);
        return res.status(200).send({
            jwt,
            role: user.role,
            message: 'Admin Login Success'
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).send({ error: error.message });
    }
};

// Rest of your admin controller functions remain the same
const createAdmin = async (req, res) => {
    // Existing implementation
};

const getAdminProfile = async (req, res) => {
    // Existing implementation
};

const verifyAdminStatus = async (req, res) => {
    // Existing implementation
};

module.exports = { 
    adminLogin,
    createAdmin,
    getAdminProfile,
    verifyAdminStatus 
};