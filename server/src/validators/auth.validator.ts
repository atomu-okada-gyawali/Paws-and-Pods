import argon2 from "argon2";

export interface RegisterDTO {
  email: string;
  password: string;
  role?: "CUSTOMER" | "VET" | "ADMIN";
}

export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$6mS0g6U1wzU8Zg$X6VfNz2vWqgY1X2pZ/5SgA";

export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// lock the account after this many bad logins
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 min

// how many old passwords to remember
export const PASSWORD_HISTORY_SIZE = 5;

// min password length
export const MIN_PASSWORD_LENGTH = 10;

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export interface PasswordPolicyResult {
  valid: boolean;
  errors: string[];
}

// check the password rules, return every one it fails
export function validatePasswordPolicy(password: unknown): PasswordPolicyResult {
  const errors: string[] = [];

  if (typeof password !== "string") {
    return { valid: false, errors: ["Password must be a string."] };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must include at least one number.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must include at least one symbol.");
  }

  return { valid: errors.length === 0, errors };
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "very weak" | "weak" | "fair" | "strong" | "very strong";
}

// rough score for the meter, not the real gate
export function scorePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const labels: PasswordStrength["label"][] = ["very weak", "weak", "fair", "strong", "very strong"];
  return { score: clamped, label: labels[clamped] };
}

export function sanitizeRole(role: unknown): "CUSTOMER" | "VET" | "ADMIN" {
  if (role === "CUSTOMER") return "CUSTOMER";
  return "CUSTOMER";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
