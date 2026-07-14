import crypto from "crypto";

const configuredSecret = process.env.JWT_ACCESS_SECRET;

if (!configuredSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_ACCESS_SECRET environment variable must be set in production.");
}

// Dev-only fallback: generated once per process so tokens signed and verified
// within the same running server stay consistent. Restarting the server
// invalidates existing tokens when no JWT_ACCESS_SECRET is configured.
export const JWT_ACCESS_SECRET = configuredSecret || crypto.randomBytes(32).toString("hex");
