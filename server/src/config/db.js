import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dayflow';
    console.log(`Attempting connection to MongoDB: ${mongoUri}`);
    
    // Try to connect with a short timeout to fail fast and fallback if not running
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Connection failed to standard MongoDB (${error.message}). Falling back to MongoMemoryServer...`);
    try {
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      console.log(`Starting MongoMemoryServer at: ${inMemoryUri}`);
      
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`MongoDB (In-Memory) Connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`Error connecting to MongoMemoryServer: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
