import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

// Schema definition
const UserSchema: Schema = new Schema<UserType>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },

    // ✅ CHANGED: use fullName instead of firstName/lastName
    fullName: { type: String, required: true },

    // ✅ ADDED: phoneNumber
    phoneNumber: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    imageUrl: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

// Interface for user document
export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
