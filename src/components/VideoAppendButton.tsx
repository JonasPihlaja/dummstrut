"use client";

import React, { useEffect, useRef, useState } from "react";
import { compressVideo } from "@/lib/videoCompression";

interface VideoAppendButtonProps {
  betId: number;
  onAppendVideo: (
    formData: FormData
  ) => Promise<
    { success: boolean; message: string; error?: string } | undefined
  >;
  triggerOnMount?: boolean;
  disabled?: boolean;
  onFinished?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function VideoAppendButton({
  betId,
  onAppendVideo,
  triggerOnMount = false,
  disabled = false,
  onFinished,
  className = "",
  children,
}: VideoAppendButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (triggerOnMount && !disabled) {
      inputRef.current?.click();
    }
  }, [triggerOnMount, disabled]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setProgress(0);

      const fileToUpload = await compressVideo(file, (p) => setProgress(p));

      const formData = new FormData();
      formData.append("betId", String(betId));
      formData.append("file", fileToUpload);

      const result = await onAppendVideo(formData);
      if (!result?.success) {
        alert(result?.error || result?.message || "Upload failed");
      }
    } catch (error) {
      alert(
        `Failed to compress video: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCompressing(false);
      setProgress(0);
      e.target.value = "";
      onFinished?.();
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="hidden"
        disabled={isCompressing || disabled}
      />
      <button
        type="button"
        disabled={isCompressing || disabled}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer ${className}`}
      >
        {isCompressing
          ? `Compressing… ${Math.round(progress)}%`
          : (children ?? "🎥?")}
      </button>
    </>
  );
}