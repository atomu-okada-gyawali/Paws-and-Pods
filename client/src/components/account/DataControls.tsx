/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from "react";
import { exportData, importData } from "../../lib/authApi";
import { useApp } from "../../context/AppContext";
import { Download, Loader2, Upload } from "lucide-react";

export function DataControls() {
  const { accessToken } = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (!accessToken) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const data = await exportData(accessToken);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paws-and-pods-data.json";
      a.click();
      URL.revokeObjectURL(url);
      setNotice("Your data was exported.");
    } catch (err: any) {
      setError(err.message || "Failed to export data.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // Only profile fields are importable; the server's strict schema rejects
      // anything else (role, email, security state, etc.).
      const payload = { profile: parsed.profile ?? {} };
      await importData(accessToken, payload);
      setNotice("Your profile was imported.");
    } catch (err: any) {
      setError(err.message || "Failed to import data. Is the file valid JSON?");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
      <h2 className="text-base font-bold text-neutral-900 mb-1">Your Data</h2>
      <p className="text-xs text-neutral-500 mb-4">
        Export a copy of your account data, or import your profile from a previous export.
      </p>

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

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          disabled={busy}
          className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 rounded-xl text-xs font-semibold text-neutral-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export data
        </button>
        <button
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 rounded-xl text-xs font-semibold text-neutral-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import profile
        </button>
        <input ref={fileInput} type="file" accept="application/json" onChange={handleImport} className="hidden" />
      </div>
    </div>
  );
}
