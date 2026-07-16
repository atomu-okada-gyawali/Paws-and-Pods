import mongoose, { Schema, Document, Model } from "mongoose";

export type ActivityAction =
  | "USER_REGISTERED"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "ACCOUNT_LOCKED"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "PROFILE_UPDATED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "DATA_EXPORTED"
  | "DATA_IMPORTED"
  | "CHECKOUT_COMPLETED"
  | "ORDER_STATUS_CHANGED"
  | "USER_ROLE_CHANGED";

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: ActivityAction;
  // keep it non-sensitive, no passwords or tokens
  detail?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog: Model<IActivityLog> = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
