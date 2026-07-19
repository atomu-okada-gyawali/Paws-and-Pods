import { useRef, useState } from "react";
import { exportData, importData } from "../../lib/authApi";
import { useApp } from "../../context/AppContext";
import { Card, Button, Alert, Spinner } from "../ui";
import { Download, Upload } from "lucide-react";

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
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
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
      // only send profile, server rejects the rest
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
    <Card>
      <h2 className="text-base font-bold text-neutral-900 mb-1">Your Data</h2>
      <p className="text-xs text-neutral-500 mb-4">
        Export a copy of your account data, or import your profile from a
        previous export.
      </p>

      {notice && (
        <Alert variant="success" className="mb-4">
          {notice}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExport} disabled={busy}>
          {busy ? <Spinner /> : <Download className="w-4 h-4" />}
          Export data
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
        >
          <Upload className="w-4 h-4" />
          Import profile
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </Card>
  );
}
