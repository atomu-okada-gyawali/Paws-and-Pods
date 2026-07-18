/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useState } from "react";
import { changePassword } from "../../lib/authApi";
import { meetsPasswordPolicy } from "../../lib/passwordPolicy";
import { useApp } from "../../context/AppContext";
import { PasswordStrengthMeter } from "../PasswordStrengthMeter";
import { Card, Input, Button, Alert } from "../ui";
import { KeyRound } from "lucide-react";

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
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-emerald-600" />
        <h2 className="text-base font-bold text-neutral-900">Change Password</h2>
      </div>

      {notice && <Alert variant="success" className="mb-4">{notice}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <Input
          type="password"
          required
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          type="password"
          required
          minLength={10}
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {newPassword && <PasswordStrengthMeter password={newPassword} />}
        <Button type="submit" loading={busy}>
          Update Password
        </Button>
      </form>
    </Card>
  );
}
