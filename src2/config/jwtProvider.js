const jwt = require("jsonwebtoken");
require('dotenv').config(); // Load environment variables from .env file

// Function to get SECRET_KEY with validation
const getSecretKey = () => {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
        throw new Error("SECRET_KEY environment variable is not set");
    }
    return secretKey;
};

const generateToken = (userId) => {
    try {
        const secretKey = getSecretKey();
        const token = jwt.sign({ userId }, secretKey, { expiresIn: "48h" });
        return token;
    } catch (error) {
        console.error("JWT generation error:", error);
        throw error; // Re-throw to be handled by the caller
    }
};

const getUserIdFromToken = (token) => {
    try {
        const secretKey = getSecretKey();
        const decodedToken = jwt.verify(token, secretKey);
        return decodedToken.userId;
    } catch (error) {
        console.error("JWT verification error:", error);
        throw error; // Re-throw to be handled by the caller
    }
};

// Export MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
}

module.exports = {
    generateToken,
    getUserIdFromToken,
    MONGODB_URI // Export MONGODB_URI
};
