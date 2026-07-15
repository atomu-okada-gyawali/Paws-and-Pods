import { User } from "../models/index.js";
import { connectDB } from "../db.js";

export async function listUsersService() {
  await connectDB();
  return User.find().select("-passwordHash -mfaSecret").sort({ createdAt: -1 });
}

export async function updateUserRoleService(id: string, role: "CUSTOMER" | "VET" | "ADMIN") {
  await connectDB();
  return User.findByIdAndUpdate(id, { role }, { new: true }).select("-passwordHash -mfaSecret");
}
