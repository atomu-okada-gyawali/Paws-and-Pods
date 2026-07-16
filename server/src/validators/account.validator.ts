import { z } from "zod";
import { imageReference } from "./products.validator.js";

// strict whitelist. .strict() rejects anything not listed, so no mass assignment
export const ProfileUpdateSchema = z
  .object({
    displayName: z.string().trim().max(60).optional(),
    bio: z.string().trim().max(500).optional(),
    avatarUrl: imageReference.optional(),
    marketingOptIn: z.boolean().optional(),
  })
  .strict();
