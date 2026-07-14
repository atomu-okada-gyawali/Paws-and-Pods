/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Lock, Mail, Loader2, UserCheck } from "lucide-react";
import { UserState } from "../types.js";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { meetsPasswordPolicy } from "../lib/passwordPolicy";

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

    // Client-side gate for registration so users get instant feedback; the
    // server enforces the same policy authoritatively.
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

      // Password accepted, but a TOTP code is still required to finish login.
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden">
        {/* Decorative accent border top bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg transition-colors"
          aria-label="Close authentication window"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-6 h-6 text-emerald-600" />
            <h2 id="auth-modal-title" className="text-xl font-sans font-bold text-neutral-950">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={isLogin ? "Your password" : "At least 10 characters"}
                />
              </div>

              {!isLogin && (
                <div className="mt-3">
                  <PasswordStrengthMeter password={password} />
                </div>
              )}
            </div>

            {isLogin && mfaRequired && (
              <div>
                <label htmlFor="auth-totp" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Authentication Code
                </label>
                <input
                  id="auth-totp"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={totp}
                  onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 text-sm tracking-[0.3em] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="123456"
                />
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>
            )}

            {error && (
              <div role="alert" className="p-3.5 bg-rose-50 text-xs font-medium text-rose-700 rounded-xl border border-rose-100 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-rose-600 rounded-full mt-1.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div role="status" className="p-3.5 bg-emerald-50 text-xs font-medium text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:bg-neutral-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isLogin && mfaRequired ? (
                "Verify & Sign In"
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
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
              {isLogin
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
