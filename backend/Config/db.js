import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Capture the connection response
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        // Log the successful host connection
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // 1 means exit with failure
    }
};