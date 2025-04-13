// index.js
const express = require("express");
const cors = require("cors");
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios'); // Add axios import
require('dotenv').config();

const upload = multer({
    storage: multer.memoryStorage(),
    fields: ['image', 'productId', 'customizationNote']
});

const app = express();
app.use(express.json());
app.use(upload.any());
app.use(bodyParser.json());

// More specific CORS configuration
const corsOptions = {
  origin: [
    'https://art-shop-dun.vercel.app', 
    'http://localhost:3000',
    'http://localhost:5173' // Add your local frontend dev server port if different
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Request Headers:', JSON.stringify(req.headers));
  next();
});

// Root endpoint
app.get('/', (req, res) => {
    return res.status(200).send({ message: "Server is running", status: true });
});

// Health check endpoint (important for Render)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Auth routes
const authRouters = require("./routes/authRoute");
app.use('/auth', authRouters);

// User routes
const userRouters = require("./routes/userRoute");
app.use('/api/users', userRouters);

// Mail routes
const mailRouters = require("./routes/mailRoute");
app.use('/api', mailRouters);

// Product routes
const productRouter = require("./routes/productRoute");
app.use('/api/products', productRouter);

// Admin product routes
const adminProductRouter = require("./routes/adminProductsRoute");
app.use('/api/admin/products', adminProductRouter);

// Hero section routes
const heroSectionRouter = require("./routes/heroSectionRoute");
app.use('/api', heroSectionRouter);

// Gallery routes
const galleryRouter = require("./routes/galleryRoute");
app.use('/api', galleryRouter);

// Contact routes
const contactRouter = require("./routes/contactRoute");
app.use('/api', contactRouter);

// Cart routes
const cartRouter = require("./routes/cartRoute");
app.use('/api/cart', cartRouter);

// Cart item routes
const cartItemRouter = require("./routes/cartItemsRoute");
app.use('/api/cart_items', cartItemRouter);

// Order routes
const orderRouter = require("./routes/orderRoute");
app.use('/api/orders', orderRouter);

// Admin order routes
const adminOrderRouter = require("./routes/adminOrderRoute");
app.use('/api/admin/orders', adminOrderRouter);

// Review routes
const reviewRouter = require("./routes/reviewRoute");
app.use('/api/reviews', reviewRouter);

// Rating routes
const ratingRouter = require("./routes/ratingRoute");
app.use('/api/ratings', ratingRouter);

// Payment routes
const paymentRouter = require("./routes/paymentRoute");
app.use("/api/payments", paymentRouter);

// Our best seller routes
const ourBestSellerRouter = require("./routes/ourBestSellerProductRoute");
app.use("/api/ourBestSellerProduct", ourBestSellerRouter);

// Our product routes
const ourProductRouter = require("./routes/ourProductRoute");
app.use("/api/ourProduct", ourProductRouter);

// Our featured product routes
const ourFeaturedProductRouter = require("./routes/ourFeaturedProductRoute");
app.use("/api/ourFeaturedProduct", ourFeaturedProductRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    status: false, 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ status: false, message: 'Route not found' });
});

module.exports = app;