import { IUserInput } from "@/types";
import { Document, Model, model, models, Schema } from "mongoose";

export interface IUser extends Document, IUserInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  verificationCode?: string | null;
  verificationCodeExpires?: Date | null;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    gender: { type: String },
    dateOfBirth: { type: String, default: "" },
    address: { type: Object, default: {} },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    role: { type: String, required: true, default: "User" },
    password: { type: String },
    image: { type: String },
    profileType: { type: String, default: "Silver" },
    status: { type: String, default: "active" },
    wallet: { type: Number, default: 0 },
    shopDetails: { type: Object, default: {} },
    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    verificationCodeExpires: { type: Date, default: null },
    language: { type: String, default: "fr" },
  },
  {
    timestamps: true,
  }
);

const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
