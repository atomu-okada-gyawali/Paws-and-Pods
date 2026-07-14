/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useEffect, useState } from "react";
import { ProfileUpdate } from "../../types";
import { fetchProfile, updateProfile } from "../../lib/authApi";
import { useApp } from "../../context/AppContext";
import { ImageUploader } from "../ImageUploader";
import { Loader2, UserCircle } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <UserCircle className="w-5 h-5 text-emerald-600" />
        <h2 className="text-base font-bold text-neutral-900">Profile</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400 py-4" role="status">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {notice && (
            <div role="status" className="p-3 bg-emerald-50 text-xs font-semibold text-emerald-800 rounded-xl border border-emerald-100">
              {notice}
            </div>
          )}
          {error && (
            <div role="alert" className="p-3 bg-rose-50 text-xs font-semibold text-rose-700 rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-neutral-500">
              <p className="font-semibold text-neutral-700">{email}</p>
              <p>Email can't be changed here.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Avatar</label>
            <ImageUploader
              value={form.avatarUrl}
              onChange={(url) => setForm({ ...form, avatarUrl: url })}
              shape="square"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Display name</label>
            <input
              maxLength={60}
              value={form.displayName || ""}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="How your name appears"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Bio</label>
            <textarea
              rows={3}
              maxLength={500}
              value={form.bio || ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="A little about you"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.marketingOptIn}
              onChange={(e) => setForm({ ...form, marketingOptIn: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
            />
            Send me product updates and offers
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-neutral-950 hover:bg-neutral-850 disabled:bg-neutral-300 text-white rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Profile
          </button>
        </form>
      )}
    </div>
  );
}
