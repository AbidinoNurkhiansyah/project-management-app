"use server";

import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2/client";
import { requireAuthUser } from "./auth-guard";

export async function deleteProjectCascadeAction(projectId: string, token: string) {
  const user = await requireAuthUser(token);
  const db = getAdminFirestore();

  const projectRef = db.collection("projects").doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists || projectSnap.data()?.userId !== user.uid) {
    throw new Error("Project not found or unauthorized");
  }

  // 1. Purge all Cloudflare R2 files under project prefix
  const r2 = getR2Client();
  const prefix = `users/${user.uid}/projects/${projectId}/`;
  const listed = await r2.send(
    new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: prefix })
  );

  if (listed.Contents && listed.Contents.length > 0) {
    await r2.send(
      new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: { Objects: listed.Contents.map((obj) => ({ Key: obj.Key })) },
      })
    );
  }

  // 2. Batch delete all tasks belonging to project
  const tasksSnap = await db.collection("tasks").where("projectId", "==", projectId).get();
  const batch = db.batch();
  tasksSnap.docs.forEach((doc) => batch.delete(doc.ref));

  // 3. Batch delete all boards belonging to project
  const boardsSnap = await db.collection("boards").where("projectId", "==", projectId).get();
  boardsSnap.docs.forEach((doc) => batch.delete(doc.ref));

  // 4. Delete the project document
  batch.delete(projectRef);
  await batch.commit();

  return { success: true };
}
