import crypto from "crypto";

const configuredSecret = process.env.JWT_ACCESS_SECRET;

if (!configuredSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_ACCESS_SECRET environment variable must be set in production.");
}

// dev fallback. random each restart so old tokens stop working
export const JWT_ACCESS_SECRET = configuredSecret || crypto.randomBytes(32).toString("hex");
