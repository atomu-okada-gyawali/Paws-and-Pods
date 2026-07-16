import { ActivityLog, ActivityAction } from "../models/index.js";
import { connectDB } from "../db.js";

interface LogContext {
  userId?: string;
  detail?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// best effort log. swallow errors so it never breaks the request. no secrets in here
export async function recordActivity(action: ActivityAction, ctx: LogContext = {}): Promise<void> {
  try {
    await connectDB();
    await ActivityLog.create({
      userId: ctx.userId,
      action,
      detail: ctx.detail,
      ipAddress: ctx.ipAddress || undefined,
      userAgent: ctx.userAgent || undefined,
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
  }
}

export async function listUserActivityService(userId: string, limit = 50) {
  await connectDB();
  return ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function listAllActivityService(limit = 200) {
  await connectDB();
  return ActivityLog.find().sort({ createdAt: -1 }).limit(limit).populate("userId", "email");
}
