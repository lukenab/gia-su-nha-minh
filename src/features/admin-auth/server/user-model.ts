import "server-only";
import mongoose, { Schema } from "mongoose";

/*
 * One record per team member who has signed in or set a password. Who may
 * sign in is decided by ADMIN_ALLOWED_EMAILS, not by this collection.
 * Only hashes are stored: never the password or the reset token itself.
 */
const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, default: "" },
    passwordHash: { type: String, default: null },
    passwordUpdatedAt: { type: Date, default: null },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    resetTokenHash: { type: String, default: null, index: true },
    resetTokenExpiresAt: { type: Date, default: null },
    resetRequestedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginMethod: { type: String, default: "" },
  },
  { timestamps: true, collection: "admin_users" },
);

export const AdminUser =
  mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
