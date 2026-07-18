/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Mail, UserCheck } from "lucide-react";
import { UserState } from "../types.js";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { meetsPasswordPolicy } from "../lib/passwordPolicy";
import { Modal, Field, Input, Button, Alert } from "./ui";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserState, token: string) => void;
  onAnnounce: (text: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess, onAnnounce }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // quick client check, server checks for real
    if (!isLogin && !meetsPasswordPolicy(password)) {
      setError("Password does not meet all the requirements below.");
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body: Record<string, string> = { email, password };
    if (isLogin && mfaRequired) {
      body.totp = totp;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = Array.isArray(data.details) && data.details.length > 0 ? data.details[0] : null;
        throw new Error(detail || data.error || "Authentication operation failed.");
      }

      // password ok, now need the totp code
      if (isLogin && data.mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      if (isLogin) {
        setSuccessMsg("Logged in successfully!");
        onAnnounce("Signed in as " + data.user.email);
        setTimeout(() => {
          onSuccess(data.user, data.accessToken);
          onClose();
        }, 1000);
      } else {
        setSuccessMsg("Account created! Please sign in.");
        onAnnounce("Account created for " + data.user.email);
        setIsLogin(true);
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="auth-modal-title">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-6 h-6 text-emerald-600" />
          <h2 id="auth-modal-title" className="text-xl font-display font-bold text-neutral-950">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email address" htmlFor="auth-email">
            <Input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              icon={<Mail className="w-4 h-4" />}
            />
          </Field>

          <div>
            <Field label="Password" htmlFor="auth-password">
              <Input
                id="auth-password"
                type="password"
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Your password" : "At least 10 characters"}
                icon={<Lock className="w-4 h-4" />}
              />
            </Field>
            {!isLogin && (
              <div className="mt-3">
                <PasswordStrengthMeter password={password} />
              </div>
            )}
          </div>

          {isLogin && mfaRequired && (
            <Field label="Authentication code" htmlFor="auth-totp">
              <Input
                id="auth-totp"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="tracking-[0.3em] font-mono"
              />
              <p className="text-[11px] text-neutral-500 mt-1.5">
                Enter the 6-digit code from your authenticator app.
              </p>
            </Field>
          )}

          {error && <Alert variant="error">{error}</Alert>}

          {successMsg && (
            <Alert variant="success">
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                {successMsg}
              </span>
            </Alert>
          )}

          <Button type="submit" fullWidth loading={loading} className="mt-2">
            {isLogin && mfaRequired ? "Verify & Sign In" : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-neutral-150 text-center text-xs">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccessMsg(null);
              setMfaRequired(false);
              setTotp("");
            }}
            className="text-neutral-650 hover:text-emerald-700 font-semibold focus:outline-none focus:underline"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
