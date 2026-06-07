const mongoose = require('mongoose');
const { getSecret } = require('../utils/getSecret');

const connectDB = async () => {
  try {
    const mongoURI = getSecret('MONGO_URI', null, true);

    // Connect to MongoDB using recommended mongoose options
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Wait and retry connection
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
