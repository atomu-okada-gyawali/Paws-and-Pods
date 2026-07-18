import { Response } from "express";
import { UserIdParamSchema, UserRoleUpdateSchema } from "../validators/users.validator.js";
import { listUsersService, updateUserRoleService } from "../services/users.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { recordActivity } from "../services/activity.service.js";
import { IUser } from "../models/index.js";

function serializeUser(user: IUser) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isMfaEnabled: user.isMfaEnabled,
    createdAt: user.createdAt,
  };
}

export async function listUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const users = await listUsersService();
    res.status(200).json({ users: users.map(serializeUser) });
  } catch (error: any) {
    console.error("User listing failure:", error.message || error);
    res.status(500).json({ error: "Failed to load users." });
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const paramResult = UserIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      res.status(400).json({ error: "Validation failed on the provided user ID." });
      return;
    }

    if (req.user && req.user.id === paramResult.data.id) {
      res.status(400).json({ error: "You cannot change your own role." });
      return;
    }

    const bodyResult = UserRoleUpdateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        error: "Validation failed on the provided role.",
        details: bodyResult.error.issues.map((err) => err.message),
      });
      return;
    }

    const user = await updateUserRoleService(paramResult.data.id, bodyResult.data.role);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    await recordActivity("USER_ROLE_CHANGED", {
      userId: req.user!.id,
      detail: `${user.email} → ${bodyResult.data.role}`,
    });
    res.status(200).json({ user: serializeUser(user) });
  } catch (error: any) {
    console.error("User role update failure:", error.message || error);
    res.status(500).json({ error: "Failed to update user role." });
  }
}
