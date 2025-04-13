const jwtProvider = require("../config/jwtProvider.js");
const userService = require("../service/userService.js");

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).send({ error: "Token not found. Please login." });
        }
        
        const userId = jwtProvider.getUserIdFromToken(token);
        const user = await userService.findUserById(userId);
        
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({ error: "Authentication failed: " + error.message });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
};

const localVariables = (req, res, next) => {
    console.log('Setting local variables');
    req.app.locals = {
        OTP: null,
        resetSession: false
    }
    next();
}

module.exports = { authenticate, isAdmin, localVariables };