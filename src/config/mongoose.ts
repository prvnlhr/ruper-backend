// src/config/mongoose.ts
import { connect, set } from "mongoose";

const MONGO_DB_URI = process.env.MONGO_DB_URI;

if (!MONGO_DB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables");
}

export const connectToDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");

    // Configure Mongoose
    set("strictQuery", false);
    set("debug", true); // Enable query debugging

    const connectionOptions = {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
    };

    const db = await connect(MONGO_DB_URI, connectionOptions);

    console.log(`✅ MongoDB connected to: ${db.connection.name}`);
    console.log(`📊 Host: ${db.connection.host}`);
    console.log(`🗃️ Database: ${db.connection.db?.databaseName}`);

    // Connection event listeners
    db.connection.on("connected", () => {
      console.log("Mongoose default connection open");
    });

    db.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    db.connection.on("disconnected", () => {
      console.warn("Mongoose connection disconnected");
    });

    // Close connection on app termination
    process.on("SIGINT", async () => {
      await db.connection.close();
      console.log("Mongoose connection closed through app termination");
      process.exit(0);
    });

    return db;
  } catch (error) {
    console.error("❌ FATAL: MongoDB connection failed");

    if (error instanceof Error) {
      console.error("Error details:");
      console.error("- Name:", error.name);
      console.error("- Message:", error.message);

      if (error.name === "MongoServerSelectionError") {
        console.error("\n🔧 Possible solutions:");
        console.error("1. Check if your IP is whitelisted in MongoDB Atlas");
        console.error("2. Verify your connection string is correct");
        console.error("3. Ensure your MongoDB Atlas cluster is running");
        console.error("4. Check your internet connection");
      }
    }

    // Exit process if DB connection is critical
    process.exit(1);
  }
};
