import { z } from "zod";

export const UserIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "User ID must be a valid identifier."),
});

export const UserRoleUpdateSchema = z.object({
  role: z.enum(["CUSTOMER", "VET", "ADMIN"]),
});
