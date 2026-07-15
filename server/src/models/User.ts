import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: "CUSTOMER" | "VET" | "ADMIN";
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  marketingOptIn: boolean;
  isMfaEnabled: boolean;
  mfaSecret?: string;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  passwordHistory: string[];
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["CUSTOMER", "VET", "ADMIN"],
      default: "CUSTOMER",
    },
    displayName: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    marketingOptIn: {
      type: Boolean,
      default: false,
    },
    isMfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      select: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
    },
    // old hashes, newest first, to block reuse
    passwordHistory: {
      type: [String],
      default: [],
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
