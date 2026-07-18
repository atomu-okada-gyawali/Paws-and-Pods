import { Request, Response } from "express";
import { isValidEmail, validatePasswordPolicy, scorePasswordStrength } from "../validators/auth.validator.js";
import { registerUser, loginUser, refreshUser, logoutUser, changePasswordService } from "../services/auth.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { recordActivity } from "../services/activity.service.js";
import { User } from "../models/index.js";

function requestContext(req: Request) {
  return {
    ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || null,
    userAgent: req.headers["user-agent"] || null,
  };
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isMfaEnabled: user.isMfaEnabled,
      },
    });
  } catch (error: any) {
    console.error("Fetch profile failure:", error.message || error);
    res.status(500).json({ error: "Failed to load profile." });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required credentials." });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email format payload." });
      return;
    }

    const policy = validatePasswordPolicy(password);
    if (!policy.valid) {
      res.status(400).json({ error: "Password does not meet the security policy.", details: policy.errors });
      return;
    }

    const result = await registerUser(email, password, role);

    if ("error" in result) {
      res.status(result.status!).json({ error: result.error });
      return;
    }

    await recordActivity("USER_REGISTERED", { userId: result.user.id, ...requestContext(req) });

    res.status(201).json({
      message: "Registration completed successfully.",
      user: result.user,
    });
  } catch (error: any) {
    console.error("Registration Core Error:", error);
    res.status(500).json({ error: "An internal security error occurred." });
  }
}

export async function passwordStrength(req: Request, res: Response): Promise<void> {
  const { password } = req.body;
  if (typeof password !== "string") {
    res.status(400).json({ error: "Password is required." });
    return;
  }

  const policy = validatePasswordPolicy(password);
  const strength = scorePasswordStrength(password);
  res.status(200).json({
    valid: policy.valid,
    errors: policy.errors,
    score: strength.score,
    label: strength.label,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, totp } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required inputs." });
      return;
    }

    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString() || null;
    const userAgent = req.headers["user-agent"] || null;

    const result = await loginUser(email, password, ipAddress, userAgent, totp);

    if ("error" in result) {
      const action = result.status === 423 ? "ACCOUNT_LOCKED" : "LOGIN_FAILED";
      await recordActivity(action, { detail: `Email: ${email}`, ipAddress, userAgent });
      res.status(result.status!).json({ error: result.error });
      return;
    }

    // password ok but still need the totp code
    if ("mfaRequired" in result) {
      res.status(200).json({ mfaRequired: true });
      return;
    }

    await recordActivity("LOGIN_SUCCESS", { userId: result.user.id, ipAddress, userAgent });

    res.cookie("refreshToken", result.refreshSessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: result.sessionExpiry,
    });

    res.status(200).json({
      message: "Login successful.",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Login Core Error:", error);
    res.status(500).json({ error: "An internal security error occurred during login." });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: "Authentication sessions expired or not found." });
      return;
    }

    const result = await refreshUser(refreshToken);

    if ("error" in result) {
      res.status(result.status!).json({ error: result.error });
      return;
    }

    res.status(200).json({ accessToken: result.accessToken });
  } catch (error: any) {
    console.error("Refresh Error:", error);
    res.status(500).json({ error: "Could not execute session refreshment." });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies.refreshToken;

    await logoutUser(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({ message: "Successfully logged out from current session." });
  } catch (error: any) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Logout execution failure." });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current and new passwords are required." });
      return;
    }

    const policy = validatePasswordPolicy(newPassword);
    if (!policy.valid) {
      res.status(400).json({ error: "New password does not meet the security policy.", details: policy.errors });
      return;
    }

    const result = await changePasswordService(req.user.id, currentPassword, newPassword);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    await recordActivity("PASSWORD_CHANGED", { userId: req.user.id, ...requestContext(req) });
    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error: any) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password." });
  }
}
