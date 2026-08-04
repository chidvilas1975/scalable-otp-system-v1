import mongoose from "mongoose";
import env from "./env.js";

const connectDatabase = async () => {
    try {

        if (!env.MONGODB_URI) {

            throw new Error("MONGODB_URI missing");

        }
        await mongoose.connect(env.MONGODB_URI);

        console.log("MongoDB Connected");
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
};

export default connectDatabase;