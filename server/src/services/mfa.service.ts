import { generateSecret, generateURI, verify } from "otplib";
import qrcode from "qrcode";
import { User } from "../models/index.js";
import { connectDB } from "../db.js";

const MFA_ISSUER = "Paws & Pods";

type MfaResult = { success: true } | { error: string; status: 400 };

// allow one step of clock drift
const EPOCH_TOLERANCE_SECONDS = 30;

// make a secret, save it as pending, return the qr to scan
export async function setupMfaService(userId: string, email: string) {
  await connectDB();

  const secret = generateSecret();
  const otpauthUri = generateURI({ issuer: MFA_ISSUER, label: email, secret });
  const qrDataUrl = await qrcode.toDataURL(otpauthUri);

  await User.updateOne({ _id: userId }, { mfaSecret: secret });

  return { otpauthUri, qrDataUrl };
}

// check the code, turn mfa on
export async function enableMfaService(userId: string, token: string): Promise<MfaResult> {
  await connectDB();

  const user = await User.findById(userId).select("+mfaSecret");
  if (!user || !user.mfaSecret) {
    return { error: "No pending MFA setup found. Start setup first.", status: 400 as const };
  }

  if (user.isMfaEnabled) {
    return { error: "MFA is already enabled.", status: 400 as const };
  }

  if (!(await verifyTotp(user.mfaSecret, token))) {
    return { error: "Invalid authentication code.", status: 400 as const };
  }

  await User.updateOne({ _id: userId }, { isMfaEnabled: true });
  return { success: true as const };
}

// check the code, turn mfa off and wipe the secret
export async function disableMfaService(userId: string, token: string): Promise<MfaResult> {
  await connectDB();

  const user = await User.findById(userId).select("+mfaSecret");
  if (!user || !user.isMfaEnabled || !user.mfaSecret) {
    return { error: "MFA is not currently enabled.", status: 400 as const };
  }

  if (!(await verifyTotp(user.mfaSecret, token))) {
    return { error: "Invalid authentication code.", status: 400 as const };
  }

  await User.updateOne({ _id: userId }, { isMfaEnabled: false, $unset: { mfaSecret: 1 } });
  return { success: true as const };
}

// verify a code at login
export async function verifyTotp(secret: string, token: string): Promise<boolean> {
  const result = await verify({ secret, token, epochTolerance: EPOCH_TOLERANCE_SECONDS });
  return result.valid;
}
