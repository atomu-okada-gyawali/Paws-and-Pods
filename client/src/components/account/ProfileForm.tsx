

import { FormEvent, useEffect, useState } from "react";
import { ProfileUpdate } from "../../types";
import { fetchProfile, updateProfile } from "../../lib/authApi";
import { useApp } from "../../context/AppContext";
import { ImageUploader } from "../ImageUploader";
import { Card, Field, Input, Textarea, Button, Alert, Spinner, Checkbox } from "../ui";
import { UserCircle } from "lucide-react";

export function ProfileForm() {
  const { accessToken } = useApp();
  const [form, setForm] = useState<ProfileUpdate>({
    displayName: "",
    bio: "",
    avatarUrl: "",
    marketingOptIn: false,
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchProfile(accessToken)
      .then((p) => {
        setEmail(p.email);
        setForm({
          displayName: p.displayName,
          bio: p.bio,
          avatarUrl: p.avatarUrl,
          marketingOptIn: p.marketingOptIn,
        });
      })
      .catch((err) => setError(err.message || "Failed to load profile."))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await updateProfile(accessToken, form);
      setNotice("Profile saved.");
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <UserCircle className="w-5 h-5 text-emerald-600" />
        <h2 className="text-base font-bold text-neutral-900">Profile</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400 py-4" role="status">
          <Spinner className="w-5 h-5" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {notice && <Alert variant="success">{notice}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}

          <div className="text-xs text-neutral-500">
            <p className="font-semibold text-neutral-700">{email}</p>
            <p>Email can't be changed here.</p>
          </div>

          <Field label="Avatar">
            <ImageUploader
              value={form.avatarUrl}
              onChange={(url) => setForm({ ...form, avatarUrl: url })}
              shape="square"
            />
          </Field>

          <Field label="Display name">
            <Input
              maxLength={60}
              value={form.displayName || ""}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="How your name appears"
            />
          </Field>

          <Field label="Bio">
            <Textarea
              rows={3}
              maxLength={500}
              value={form.bio || ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="A little about you"
            />
          </Field>

          <label className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer">
            <Checkbox
              checked={!!form.marketingOptIn}
              onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
            />
            Send me product updates and offers
          </label>

          <Button type="submit" loading={saving}>
            Save Profile
          </Button>
        </form>
      )}
    </Card>
  );
}
