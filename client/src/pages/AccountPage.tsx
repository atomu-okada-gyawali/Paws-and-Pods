/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { fetchMe, mfaSetup, mfaEnable, mfaDisable } from "../lib/authApi";
import { ProfileForm } from "../components/account/ProfileForm";
import { ChangePasswordForm } from "../components/account/ChangePasswordForm";
import { ActivityLog } from "../components/account/ActivityLog";
import { DataControls } from "../components/account/DataControls";
import { Card, Input, Button, Alert, Badge, Spinner } from "../components/ui";
import { ShieldCheck, ShieldOff } from "lucide-react";

export function AccountPage() {
  const { user, accessToken } = useApp();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // enrollment state
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchMe(accessToken)
      .then((me) => setMfaEnabled(me.isMfaEnabled))
      .catch((err) => setError(err.message || "Failed to load account."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  async function startSetup() {
    if (!accessToken) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const { qrDataUrl } = await mfaSetup(accessToken);
      setQrDataUrl(qrDataUrl);
    } catch (err: any) {
      setError(err.message || "Failed to start MFA setup.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmEnable(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    setBusy(true);
    try {
      await mfaEnable(accessToken, code);
      setMfaEnabled(true);
      setQrDataUrl(null);
      setCode("");
      setNotice("Two-factor authentication is now enabled.");
    } catch (err: any) {
      setError(err.message || "Failed to enable MFA.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    setBusy(true);
    try {
      await mfaDisable(accessToken, code);
      setMfaEnabled(false);
      setCode("");
      setNotice("Two-factor authentication has been disabled.");
    } catch (err: any) {
      setError(err.message || "Failed to disable MFA.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-neutral-950 tracking-tight mb-1">My Account</h1>
        <p className="text-sm text-neutral-500">{user.email}</p>
      </div>

      <ProfileForm />

      <Card>
        <div className="flex items-start gap-3 mb-4">
          {mfaEnabled ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <ShieldOff className="w-6 h-6 text-neutral-400 shrink-0" />
          )}
          <div>
            <h2 className="text-base font-bold text-neutral-900">Two-Factor Authentication (TOTP)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Add a second step at login using an authenticator app like Google Authenticator or Authy.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-neutral-400 py-4" role="status">
            <Spinner className="w-5 h-5" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : (
          <div className="mt-4">
            {notice && <Alert variant="success" className="mb-4">{notice}</Alert>}
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            {mfaEnabled ? (
              <div>
                <Badge color="emerald" className="mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enabled
                </Badge>
                <form onSubmit={confirmDisable} className="space-y-3">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Enter a current code to disable
                  </label>
                  <Input
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-40 tracking-widest font-mono"
                  />
                  <Button type="submit" variant="danger" loading={busy}>
                    Disable 2FA
                  </Button>
                </form>
              </div>
            ) : qrDataUrl ? (
              <div>
                <ol className="text-xs text-neutral-600 space-y-1 mb-4 list-decimal list-inside">
                  <li>Scan this QR code with your authenticator app.</li>
                  <li>Enter the 6-digit code it shows to confirm.</li>
                </ol>
                <img src={qrDataUrl} alt="MFA QR code" className="w-44 h-44 border border-neutral-200 rounded-xl mb-4" />
                <form onSubmit={confirmEnable} className="space-y-3">
                  <Input
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-40 tracking-widest font-mono"
                  />
                  <Button type="submit" variant="success" loading={busy}>
                    Verify & Enable
                  </Button>
                </form>
              </div>
            ) : (
              <Button onClick={startSetup} loading={busy}>
                Set Up 2FA
              </Button>
            )}
          </div>
        )}
      </Card>

      <ChangePasswordForm />
      <DataControls />
      <ActivityLog />
    </div>
  );
}
