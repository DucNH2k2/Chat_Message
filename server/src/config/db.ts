import mongoose from "mongoose";

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const DB_URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

export const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);

        console.log("DB connected");
    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1);
    }
}