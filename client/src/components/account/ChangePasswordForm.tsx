/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useState } from "react";
import { changePassword } from "../../lib/authApi";
import { meetsPasswordPolicy } from "../../lib/passwordPolicy";
import { useApp } from "../../context/AppContext";
import { PasswordStrengthMeter } from "../PasswordStrengthMeter";
import { KeyRound, Loader2 } from "lucide-react";

export function ChangePasswordForm() {
  const { accessToken } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!meetsPasswordPolicy(newPassword)) {
      setError("New password does not meet all the requirements below.");
      return;
    }
    if (!accessToken) return;

    setBusy(true);
    try {
      await changePassword(accessToken, currentPassword, newPassword);
      setNotice("Password changed. Other sessions have been signed out.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-emerald-600" />
        <h2 className="text-base font-bold text-neutral-900">Change Password</h2>
      </div>

      {notice && (
        <div role="status" className="mb-4 p-3 bg-emerald-50 text-xs font-semibold text-emerald-800 rounded-xl border border-emerald-100">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="mb-4 p-3 bg-rose-50 text-xs font-semibold text-rose-700 rounded-xl border border-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          type="password"
          required
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="password"
          required
          minLength={10}
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {newPassword && <PasswordStrengthMeter password={newPassword} />}
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 bg-neutral-950 hover:bg-neutral-850 disabled:bg-neutral-300 text-white rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center gap-2"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}
