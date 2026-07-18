import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { User, IUser } from "../models/index.js";
import { recordActivity, listUserActivityService } from "../services/activity.service.js";
import { ProfileUpdateSchema } from "../validators/account.validator.js";
import { connectDB } from "../db.js";

// import only touches profile fields. role/email/etc get rejected by the strict schema
const ImportSchema = z.object({
  profile: ProfileUpdateSchema.optional(),
});

function serializeProfile(user: IUser) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    displayName: user.displayName || "",
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || "",
    marketingOptIn: user.marketingOptIn,
    isMfaEnabled: user.isMfaEnabled,
    createdAt: user.createdAt,
  };
}

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await connectDB();
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.status(200).json({ profile: serializeProfile(user) });
  } catch (error: any) {
    console.error("Profile fetch failure:", error.message || error);
    res.status(500).json({ error: "Failed to load profile." });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = ProfileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed on the provided profile data.",
        details: parsed.error.issues.map((e) => e.message),
      });
      return;
    }

    await connectDB();
    // schema already dropped anything that isn't a profile field
    const user = await User.findByIdAndUpdate(req.user!.id, parsed.data, { new: true, runValidators: true });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    await recordActivity("PROFILE_UPDATED", { userId: req.user!.id });
    res.status(200).json({ profile: serializeProfile(user) });
  } catch (error: any) {
    console.error("Profile update failure:", error.message || error);
    res.status(500).json({ error: "Failed to update profile." });
  }
}

export async function exportData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await connectDB();
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        marketingOptIn: user.marketingOptIn,
        isMfaEnabled: user.isMfaEnabled,
        createdAt: user.createdAt,
      },
    };

    await recordActivity("DATA_EXPORTED", { userId });

    res.setHeader("Content-Disposition", 'attachment; filename="paws-and-pods-data.json"');
    res.status(200).json(payload);
  } catch (error: any) {
    console.error("Data export failure:", error.message || error);
    res.status(500).json({ error: "Failed to export data." });
  }
}

export async function importData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const parsed = ImportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid import file.",
        details: parsed.error.issues.map((e) => e.message),
      });
      return;
    }

    const userId = req.user!.id;
    if (parsed.data.profile && Object.keys(parsed.data.profile).length > 0) {
      await connectDB();
      await User.findByIdAndUpdate(userId, parsed.data.profile, { runValidators: true });
    }

    await recordActivity("DATA_IMPORTED", { userId });
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Data import failure:", error.message || error);
    res.status(500).json({ error: "Failed to import data." });
  }
}

export async function activity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const logs = await listUserActivityService(req.user!.id);
    res.status(200).json({
      activity: logs.map((log) => ({
        action: log.action,
        detail: log.detail,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Activity fetch failure:", error.message || error);
    res.status(500).json({ error: "Failed to load activity." });
  }
}
