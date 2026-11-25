"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/States";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

interface ImageUploadProps {
  /** Current image URL (a site path like /uploads/x.png or an https URL), or empty. */
  value?: string | null;
  /** Called with the new URL after a successful upload, or null when removed. */
  onChange: (url: string | null) => void;
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
}

/** Uploads to POST /upload (PNG, JPEG, WebP or GIF up to 5MB) and reports the stored URL. */
export function ImageUpload({ value, onChange, label, error, hint = "PNG, JPEG, WebP or GIF, up to 5MB", className }: ImageUploadProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setLocalError(null);
    if (!TYPES.includes(file.type)) return setLocalError("Choose a PNG, JPEG, WebP or GIF image");
    if (file.size > MAX_BYTES) return setLocalError("Image must be 5MB or smaller");

    setBusy(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await api.post("/upload", form);
      if (!res.url) throw new Error("Upload did not return an image URL");
      onChange(res.url);
    } catch (err) {
      setLocalError(errorMessage(err, "Upload failed. Please try again."));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const shownError = localError || error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-ink/70">
          {label}
        </label>
      )}
      <div className={cn("flex items-center gap-4 rounded-md border border-dashed bg-white p-3", shownError ? "border-danger" : "border-sand")}>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-parchment text-gold-dark">
          {busy ? (
            <Spinner />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-7 w-7" aria-hidden />
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <input ref={input} id={id} type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} disabled={busy} />
          <div className="flex gap-2">
            <label htmlFor={id} className={cn("inline-flex h-8 cursor-pointer items-center rounded-md border border-gold px-3 text-xs font-medium text-gold-dark hover:bg-parchment", busy && "pointer-events-none opacity-50")}>
              {value ? "Replace image" : "Choose image"}
            </label>
            {value && !busy && (
              <button type="button" onClick={() => onChange(null)} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-danger hover:bg-danger/10">
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
              </button>
            )}
          </div>
          <p className="text-xs text-ink/55">{hint}</p>
        </div>
      </div>
      {shownError && (
        <p role="alert" className="text-xs text-danger">
          {shownError}
        </p>
      )}
    </div>
  );
}
