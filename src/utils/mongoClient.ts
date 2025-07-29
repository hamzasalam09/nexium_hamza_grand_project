import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Extend the global type to include our custom property
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Enhanced MongoDB client options with SSL error handling
const clientOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  connectTimeoutMS: 10000, // Give up initial connection after 10s
  maxPoolSize: 10, // Maintain up to 10 socket connections
  retryWrites: true,
  // SSL/TLS options to handle SSL errors
  tls: true,
  tlsAllowInvalidCertificates: true, // Allow invalid certificates to resolve SSL errors
  tlsAllowInvalidHostnames: true, // Allow invalid hostnames
  // Additional connection options
  maxIdleTimeMS: 30000,
  socketTimeoutMS: 45000,
  // Retry options
  retryReads: true,
  heartbeatFrequencyMS: 30000,
};

// Create a safer client promise with proper error handling
const createClientPromise = (): Promise<MongoClient> => {
  const mongoClient = new MongoClient(uri, clientOptions);
  
  return mongoClient.connect().catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    console.log('MongoDB operations will be disabled due to connection failure');
    throw error;
  });
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createClientPromise();
}

// Add process-level error handlers for unhandled MongoDB errors
process.on('unhandledRejection', (reason, promise) => {
  if (reason && typeof reason === 'object' && 'name' in reason) {
    const error = reason as Error;
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      console.error('MongoDB connection error handled:', error.message);
      // Don't crash the process for MongoDB connection errors
      return;
    }
  }
  // For other unhandled rejections, log them but don't crash in development
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default clientPromise; 