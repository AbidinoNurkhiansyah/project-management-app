"use client";

import React, { useState } from "react";
import { UploadCloud } from "lucide-react";
import { FileAttachment } from "@/types/common";
import { getPresignedUploadUrlAction } from "@/actions/storage.actions";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface FileUploadZoneProps {
  projectId: string;
  onUploadComplete: (attachment: FileAttachment) => void;
}

export function FileUploadZone({
  projectId,
  onUploadComplete,
}: FileUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Please log in to upload files");

      const { uploadUrl, publicUrl, filePath } =
        await getPresignedUploadUrlAction({
          projectId,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          token,
        });

      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) throw new Error("Upload to Cloudflare R2 failed");

      onUploadComplete({
        fileName: file.name,
        fileUrl: publicUrl,
        filePath,
        fileSize: file.size,
        fileType: file.type,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative border border-dashed border-border rounded p-4 text-center hover:border-zinc-500 transition-colors bg-surface-base">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="text-xs text-muted-foreground flex flex-col items-center justify-center">
        <UploadCloud className="w-5 h-5 mb-1.5 text-muted-foreground" />
        {uploading ? (
          <span className="text-foreground animate-pulse">
            Uploading to R2...
          </span>
        ) : (
          <span>Drag & drop file or click to browse (Max 10MB)</span>
        )}
      </div>
      {errorMsg && <p className="text-[11px] text-red-400 mt-1">{errorMsg}</p>}
    </div>
  );
}
