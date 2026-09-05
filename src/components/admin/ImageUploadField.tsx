/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, useState } from "react";
import { imageUploadError } from "@/lib/image-upload";

export function ImageUploadField({
  name,
  defaultValue = "",
  label,
  required = false,
}: {
  name: string;
  defaultValue?: string | null;
  label: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = imageUploadError(file.size, file.type);
    if (validationError) {
      setStatus(validationError);
      return;
    }

    setStatus("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(response.status === 413 ? "Image must be 4 MB or smaller." : "Unable to upload image. Please try again.");
      }
      const data: { url?: string; error?: string } = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error ?? "Unable to upload image.");
      setUrl(data.url);
      setStatus("Image uploaded. Save the form to apply it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <input type="hidden" name={name} value={url} required={required} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-card">
          <span>{isUploading ? "Uploading…" : "Choose image"}</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={isUploading} className="sr-only" />
        </label>
        {url && <button type="button" disabled={isUploading} onClick={() => { setUrl(""); setStatus("Image removed. Save the form to apply this change."); }} className="rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove</button>}
      </div>
      <p className="text-xs text-foreground-subtle">PNG, JPEG, WebP · up to 4 MB. Choose a file, wait for the preview, then save the form.</p>
      {url && <img src={url} alt={`${label} preview`} className="aspect-video w-full max-w-sm rounded-lg object-cover" />}
      {status && <p role="status" className="text-sm text-foreground-muted">{status}</p>}
      {!url && required && <p className="text-xs text-foreground-subtle">An image is required.</p>}
    </div>
  );
}
