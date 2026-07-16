import { Response } from "express";
import { z } from "zod";
import { setupMfaService, enableMfaService, disableMfaService } from "../services/mfa.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { recordActivity } from "../services/activity.service.js";

const TokenSchema = z.object({
  token: z.string().regex(/^\d{6}$/, "Authentication code must be 6 digits."),
});

export async function setupMfa(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const { otpauthUri, qrDataUrl } = await setupMfaService(req.user.id, req.user.email);
    res.status(200).json({ otpauthUri, qrDataUrl });
  } catch (error: any) {
    console.error("MFA setup failure:", error.message || error);
    res.status(500).json({ error: "Failed to start MFA setup." });
  }
}

export async function enableMfa(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const parsed = TokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const result = await enableMfaService(req.user.id, parsed.data.token);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    await recordActivity("MFA_ENABLED", { userId: req.user.id });
    res.status(200).json({ success: true, message: "MFA enabled." });
  } catch (error: any) {
    console.error("MFA enable failure:", error.message || error);
    res.status(500).json({ error: "Failed to enable MFA." });
  }
}

export async function disableMfa(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const parsed = TokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const result = await disableMfaService(req.user.id, parsed.data.token);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    await recordActivity("MFA_DISABLED", { userId: req.user.id });
    res.status(200).json({ success: true, message: "MFA disabled." });
  } catch (error: any) {
    console.error("MFA disable failure:", error.message || error);
    res.status(500).json({ error: "Failed to disable MFA." });
  }
}
