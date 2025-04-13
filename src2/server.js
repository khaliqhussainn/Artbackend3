// server.js
const { connectDb } = require("./config/db");
const app = require("./index");
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Add SECRET_KEY validation at startup
if (!process.env.SECRET_KEY) {
    console.error("ERROR: SECRET_KEY environment variable is not set!");
    console.error("Please create a .env file with a SECRET_KEY value.");
    console.error("You can generate a secure key using: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
    process.exit(1); // Exit the application if SECRET_KEY is missing
}

// Improved keep-alive function to prevent Render from putting the service to sleep
const keepAlive = () => {
    const url = process.env.RENDER_EXTERNAL_URL || 'https://artbackend3.onrender.com';
    console.log(`Setting up keep-alive ping to ${url}/api/health`);
    
    setInterval(() => {
        console.log(`${new Date().toISOString()} - Sending keep-alive request...`);
        axios.get(`${url}/api/health`)
            .then(response => console.log(`Keep-alive successful: ${response.status} ${JSON.stringify(response.data)}`))
            .catch(err => console.error('Keep-alive request failed:', err.message));
    }, 10 * 60 * 1000); // Every 10 minutes instead of 14
};

// Database connection retry logic
const connectWithRetry = async (maxRetries = 5, delay = 5000) => {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`Attempting database connection (${retries + 1}/${maxRetries})...`);
            await connectDb();
            console.log("Database connection established successfully");
            return true;
        } catch (error) {
            retries++;
            console.error(`Database connection failed (Attempt ${retries}/${maxRetries})`, error.message);
            
            if (retries >= maxRetries) {
                console.error("Max retries reached. Could not connect to database.");
                return false;
            }
            
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Start the server with proper error handling
const startServer = async () => {
    try {
        // Connect to database first with retry logic
        const dbConnected = await connectWithRetry();
        
        if (!dbConnected) {
            console.error("Failed to connect to database after multiple attempts");
            process.exit(1);
        }
        
        // Then start the server
        const server = app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            
            // Initialize keep-alive mechanism in production
            if (process.env.NODE_ENV === 'production') {
                keepAlive();
            }
        });
        
        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            // Keep server running but log the error
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            // Keep server running but log the error
        });
        
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();