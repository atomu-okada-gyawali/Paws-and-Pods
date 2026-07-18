/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { ActivityEntry } from "../../types";
import { fetchActivity } from "../../lib/authApi";
import { useApp } from "../../context/AppContext";
import { Card, Alert, Spinner } from "../ui";
import { ScrollText } from "lucide-react";

const LABELS: Record<string, string> = {
  USER_REGISTERED: "Account created",
  LOGIN_SUCCESS: "Signed in",
  LOGIN_FAILED: "Failed sign-in",
  ACCOUNT_LOCKED: "Account locked",
  LOGOUT: "Signed out",
  PASSWORD_CHANGED: "Password changed",
  PROFILE_UPDATED: "Profile updated",
  MFA_ENABLED: "2FA enabled",
  MFA_DISABLED: "2FA disabled",
  DATA_EXPORTED: "Data exported",
  DATA_IMPORTED: "Data imported",
  CHECKOUT_COMPLETED: "Order placed",
  ORDER_STATUS_CHANGED: "Order status changed",
  USER_ROLE_CHANGED: "User role changed",
};

export function ActivityLog() {
  const { accessToken } = useApp();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchActivity(accessToken)
      .then(setEntries)
      .catch((err) => setError(err.message || "Failed to load activity."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="w-5 h-5 text-emerald-600" />
        <h2 className="text-base font-bold text-neutral-900">Recent Activity</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400 py-4" role="status">
          <Spinner className="w-5 h-5" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : error ? (
        <Alert variant="error">{error}</Alert>
      ) : entries.length === 0 ? (
        <p className="text-sm text-neutral-500">No recorded activity yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
          {entries.map((entry, i) => (
            <li key={i} className="flex items-center justify-between py-2.5 text-sm">
              <div className="min-w-0">
                <span className="font-medium text-neutral-800">{LABELS[entry.action] || entry.action}</span>
                {entry.detail && <span className="text-neutral-400 text-xs ml-2">{entry.detail}</span>}
              </div>
              <span className="text-xs text-neutral-400 shrink-0 ml-3">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
