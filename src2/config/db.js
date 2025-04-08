const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://khaliqhussain9711:khaliq@12@cluster0.mxso2jo.mongodb.net/';
    console.log('Attempting to connect to MongoDB with URI:', uri);

    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

module.exports = { connectDb };
