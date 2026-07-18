import crypto from "crypto";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { User, Session } from "../models/index.js";
import { connectDB } from "../db.js";
import { JWT_ACCESS_SECRET } from "../config/jwt.js";
import { verifyTotp } from "./mfa.service.js";
import {
  ARGON2_OPTIONS,
  DUMMY_HASH,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_DAYS,
  MAX_FAILED_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  PASSWORD_HISTORY_SIZE,
  sanitizeRole,
  normalizeEmail,
} from "../validators/auth.validator.js";

export function getJwtSecret(): string {
  return JWT_ACCESS_SECRET;
}

export async function registerUser(email: string, password: string, role?: string) {
  await connectDB();
  const normalizedEmail = normalizeEmail(email);
  const finalRole = sanitizeRole(role);

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return { error: "Registration could not be completed with these parameters.", status: 400 as const };
  }

  const passwordHash = await argon2.hash(password, ARGON2_OPTIONS);

  const newUser = await User.create({
    email: normalizedEmail,
    passwordHash,
    role: finalRole,
    passwordHistory: [passwordHash],
    passwordChangedAt: new Date(),
  });

  return {
    user: {
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    },
  };
}

export async function loginUser(
  email: string,
  password: string,
  ip?: string | null,
  userAgent?: string | null,
  totp?: string
) {
  await connectDB();
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail }).select("+mfaSecret");

  // bail if locked out, before we even check the password
  if (user && user.lockoutUntil && user.lockoutUntil > new Date()) {
    return {
      error: "Account temporarily locked due to repeated failed logins. Try again later.",
      status: 423 as const,
    };
  }

  // hash a dummy for unknown emails so timing doesn't leak whether the account exists
  const targetHash = user ? user.passwordHash : DUMMY_HASH;
  const isPasswordValid = await argon2.verify(targetHash, password);

  if (!user || !isPasswordValid) {
    if (user) {
      const attempts = user.failedLoginAttempts + 1;
      const update: Record<string, unknown> = { failedLoginAttempts: attempts };
      if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        update.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        update.failedLoginAttempts = 0;
      }
      await User.updateOne({ _id: user._id }, update);
    }
    return { error: "Invalid credentials provided.", status: 401 as const };
  }

  // password ok, reset the failed attempt counter
  if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
    await User.updateOne({ _id: user._id }, { failedLoginAttempts: 0, $unset: { lockoutUntil: 1 } });
  }

  // mfa check only runs after the password is right
  if (user.isMfaEnabled && user.mfaSecret) {
    if (!totp) {
      return { mfaRequired: true as const };
    }
    if (!(await verifyTotp(user.mfaSecret, totp))) {
      return { error: "Invalid authentication code.", status: 401 as const };
    }
  }

  const accessToken = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshSessionToken = crypto.randomBytes(64).toString("hex");
  const sessionExpiry = new Date();
  sessionExpiry.setDate(sessionExpiry.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await Session.create({
    userId: user._id,
    sessionToken: refreshSessionToken,
    expiresAt: sessionExpiry,
    ipAddress: ip || null,
    userAgent: userAgent || null,
  });

  return {
    accessToken,
    refreshSessionToken,
    sessionExpiry,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  };
}

export async function refreshUser(refreshToken: string) {
  await connectDB();
  const session = await Session.findOne({ sessionToken: refreshToken }).populate("userId");

  if (!session || !session.isValid || session.expiresAt < new Date()) {
    if (session) {
      await Session.updateOne({ _id: session._id }, { isValid: false });
    }
    return { error: "Session is inactive or expired.", status: 401 as const };
  }

  const user = session.userId as any;
  const accessToken = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  return { accessToken };
}

export async function logoutUser(refreshToken: string | undefined) {
  await connectDB();
  if (refreshToken) {
    await Session.updateMany({ sessionToken: refreshToken }, { isValid: false });
  }
}

export async function changePasswordService(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: true } | { error: string; status: 400 | 404 }> {
  await connectDB();

  const user = await User.findById(userId).select("+passwordHistory");
  if (!user) {
    return { error: "User not found.", status: 404 as const };
  }

  const currentValid = await argon2.verify(user.passwordHash, currentPassword);
  if (!currentValid) {
    return { error: "Current password is incorrect.", status: 400 as const };
  }

  // block reusing the current or any recent password
  const history = user.passwordHistory && user.passwordHistory.length > 0 ? user.passwordHistory : [user.passwordHash];
  for (const oldHash of history) {
    if (await argon2.verify(oldHash, newPassword)) {
      return { error: "You cannot reuse a recent password.", status: 400 as const };
    }
  }

  const newHash = await argon2.hash(newPassword, ARGON2_OPTIONS);
  const updatedHistory = [newHash, ...history].slice(0, PASSWORD_HISTORY_SIZE);

  await User.updateOne(
    { _id: userId },
    { passwordHash: newHash, passwordHistory: updatedHistory, passwordChangedAt: new Date() }
  );

  // log out the other sessions
  await Session.updateMany({ userId: user._id }, { isValid: false });

  return { success: true as const };
}
