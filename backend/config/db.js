import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    logger.error('MongoDB connection error: MONGO_URI is not defined in your .env file.');
    process.exit(1);
  }

  try {
    // We use process.env.MONGO_URI to get the connection string from the .env file
    const conn = await mongoose.connect(mongoURI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Log when the connection is disconnected
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB connection lost.'));
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;