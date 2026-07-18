/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from "react";
import { uploadImage } from "../lib/authApi";
import { useApp } from "../context/AppContext";
import { ImagePlus, X } from "lucide-react";
import { Button, Spinner } from "./ui";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  // square = avatar, wide = product
  shape?: "square" | "wide";
}

const MAX_BYTES = 2 * 1024 * 1024;

export function ImageUploader({ value, onChange, shape = "wide" }: ImageUploaderProps) {
  const { accessToken } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    setError(null);

    // quick check, server revalidates
    if (file.size > MAX_BYTES) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(accessToken, file);
      onChange(url);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewClasses =
    shape === "square" ? "w-24 h-24 rounded-full" : "w-full aspect-video rounded-xl";

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className={`relative ${previewClasses} bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0`}>
          {value ? (
            <img src={value} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6 text-neutral-300" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Spinner className="w-5 h-5 text-neutral-500" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <ImagePlus className="w-3.5 h-3.5" />
            {value ? "Replace image" : "Upload image"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="hover:text-rose-600"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </Button>
          )}
          <p className="text-[10px] text-neutral-400">JPEG, PNG, GIF or WEBP · up to 2 MB</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
