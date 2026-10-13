"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Product Image" }: ImageUploadProps) {
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    setUploading(true);

    // 1. Generate local preview immediately via FileReader
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      try {
        // Try multipart FormData upload to backend
        const formData = new FormData();
        formData.append("image", file);

        const res = await api.post("/upload", formData);
        if (res.success && res.url) {
          onChange(res.url);
          setUrlInput(res.url);
        } else {
          // Fallback to Base64 data URL for offline preview
          onChange(base64);
          setUrlInput(base64);
        }
      } catch (err) {
        // Fallback to Base64 data URL
        onChange(base64);
        setUrlInput(base64);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] text-[#caa15e] hover:text-[#8b6528] flex items-center gap-1 font-medium"
        >
          {isUrlMode ? (
            <>
              <UploadCloud className="w-3 h-3" /> Upload File
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" /> Paste URL
            </>
          )}
        </button>
      </div>

      {isUrlMode ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800"
          >
            Apply
          </button>
        </div>
      ) : value ? (
        // Preview Active Image
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-2 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60 dark:border-zinc-800">
            <img src={value} alt="Product Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <Check className="w-3.5 h-3.5" />
              <span>Image Attached</span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{value}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-zinc-200 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 text-zinc-500 transition-colors"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Drag and Drop Area
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-[#caa15e] bg-amber-50/50 dark:bg-amber-950/20"
              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 text-[#caa15e] animate-spin" />
              <p className="text-xs text-zinc-500">Uploading image file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#caa15e] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Click to browse or drag & drop photo
              </p>
              <p className="text-[10px] text-zinc-400">
                PNG, JPG, WebP up to 15MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
