import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/paws-and-pods";

// avoid reconnecting on every hot reload
const globalForMongoose = global as unknown as { mongoose: typeof mongoose };

export const db = globalForMongoose.mongoose || mongoose;

if (process.env.NODE_ENV !== "production") {
  globalForMongoose.mongoose = db;
}

export async function connectDB() {
  if (db.connection.readyState >= 1) {
    return;
  }

  try {
    await db.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function disconnectDB() {
  if (db.connection.readyState >= 1) {
    await db.disconnect();
    console.log("MongoDB disconnected");
  }
}
