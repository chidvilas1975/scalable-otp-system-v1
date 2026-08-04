import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        refreshToken: {
            type: String
        },

        lastLogin: {
            type: Date
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const User = mongoose.model("User", userSchema);

User.createIndexes({ email: 1 }, { unique: true });

export default User;