"use server";

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2/client";
import { requireAuthUser } from "./auth-guard";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface PresignParams {
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  token: string;
}

export async function getPresignedUploadUrlAction({
  projectId,
  fileName,
  fileType,
  fileSize,
  token,
}: PresignParams) {
  const user = await requireAuthUser(token);

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 10MB limit");
  }

  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueId = crypto.randomBytes(6).toString("hex");
  const key = `users/${user.uid}/projects/${projectId}/attachments/${uniqueId}_${safeFileName}`;

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "";
  const publicUrl = `${publicBase}/${key}`;

  return { uploadUrl, publicUrl, filePath: key };
}

export async function deleteR2AttachmentAction(filePath: string, token: string) {
  const user = await requireAuthUser(token);
  if (!filePath.startsWith(`users/${user.uid}/`)) {
    throw new Error("Unauthorized to delete this object");
  }

  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filePath,
    })
  );

  return { success: true };
}
