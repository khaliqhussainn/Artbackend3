// auth.controller.js
const userService = require("../service/userService.js");
const jwtProvider = require("../config/jwtProvider.js");
const bcrypt = require("bcrypt");
const cartService = require("../service/cartService.js");

const register = async (req, res) => {
    try {
        // Check if SECRET_KEY exists
        if (!process.env.SECRET_KEY) {
            console.error("SECRET_KEY environment variable is missing");
            return res.status(500).send({ error: "Server configuration error" });
        }

        const user = await userService.createUser(req.body);
        
        // Generate JWT token - wrapped in try/catch to catch any JWT generation errors
        let jwt;
        try {
            jwt = jwtProvider.generateToken(user._id);
        } catch (jwtError) {
            console.error("Error generating JWT:", jwtError);
            return res.status(500).send({ 
                error: "Failed to generate authentication token",
                userId: user._id,
                isCreated: true
            });
        }
        
        // Create cart - notice we're only doing this once, not twice
        let createdCart;
        try {
            createdCart = await cartService.createCart(user);
        } catch (cartError) {
            console.error("Error creating cart:", cartError);
            // Continue even if cart creation fails
        }

        return res.status(200).send({ 
            jwt, 
            message: "register success", 
            cart: createdCart 
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).send({ error: error.message });
    }
};

const login = async (req, res) => {
    const { password, email } = req.body;
    try {
        // Check if SECRET_KEY exists
        if (!process.env.SECRET_KEY) {
            console.error("SECRET_KEY environment variable is missing");
            return res.status(500).send({ error: "Server configuration error" });
        }

        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).send({ message: 'User not found with email: ' + email });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).send({message: 'Invalid Password'});
        }

        // Generate JWT token - wrapped in try/catch
        let jwt;
        try {
            jwt = jwtProvider.generateToken(user._id);
        } catch (jwtError) {
            console.error("Error generating JWT:", jwtError);
            return res.status(500).send({ error: "Failed to generate authentication token" });
        }

        return res.status(200).send({
            jwt,
            message: 'Login Success'
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send({error: error.message});
    }
};

module.exports = { register, login };