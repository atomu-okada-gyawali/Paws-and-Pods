

import { UserRole, ActivityEntry, Profile, ProfileUpdate } from "../types";

export interface MeResponse {
  id: string;
  email: string;
  role: UserRole;
  isMfaEnabled: boolean;
}

async function authedRequest<T>(url: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const data = await authedRequest<{ user: MeResponse }>("/api/auth/me", accessToken);
  return data.user;
}

export async function mfaSetup(accessToken: string): Promise<{ otpauthUri: string; qrDataUrl: string }> {
  return authedRequest("/api/auth/mfa/setup", accessToken, { method: "POST" });
}

export async function mfaEnable(accessToken: string, token: string): Promise<void> {
  await authedRequest("/api/auth/mfa/enable", accessToken, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function mfaDisable(accessToken: string, token: string): Promise<void> {
  await authedRequest("/api/auth/mfa/disable", accessToken, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<void> {
  await authedRequest("/api/auth/change-password", accessToken, {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// profile

export async function fetchProfile(accessToken: string): Promise<Profile> {
  const data = await authedRequest<{ profile: Profile }>("/api/v1/account/profile", accessToken);
  return data.profile;
}

export async function updateProfile(accessToken: string, input: ProfileUpdate): Promise<Profile> {
  const data = await authedRequest<{ profile: Profile }>("/api/v1/account/profile", accessToken, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.profile;
}

// image upload

export async function uploadImage(accessToken: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  // no content-type, browser sets the multipart boundary
  const res = await fetch("/api/v1/images", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Upload failed.");
  }
  return data.url;
}

// account data / activity

export async function fetchActivity(accessToken: string): Promise<ActivityEntry[]> {
  const data = await authedRequest<{ activity: ActivityEntry[] }>("/api/v1/account/activity", accessToken);
  return data.activity;
}

export async function exportData(accessToken: string): Promise<unknown> {
  return authedRequest("/api/v1/account/export", accessToken);
}

export async function importData(accessToken: string, payload: unknown): Promise<{ success: boolean }> {
  return authedRequest("/api/v1/account/import", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
