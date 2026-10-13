"use server";

import { google } from "googleapis";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/crypto";
import { getGoogleOAuth2Client } from "@/lib/google/calendar";
import { requireAuthUser } from "./auth-guard";
import { TaskDoc } from "@/types/tasks";
import { ProjectDoc } from "@/types/projects";

export async function syncTaskToGoogleCalendarAction(
  taskId: string,
  token: string
) {
  const user = await requireAuthUser(token);
  const db = getAdminFirestore();

  const taskSnap = await db.collection("tasks").doc(taskId).get();
  if (!taskSnap.exists) throw new Error("Task not found");
  const task = taskSnap.data() as TaskDoc;

  if (task.userId !== user.uid) throw new Error("Unauthorized");
  if (!task.dueDate) throw new Error("Task does not have a dueDate");

  const intSnap = await db
    .collection("users")
    .doc(user.uid)
    .collection("integrations")
    .doc("google")
    .get();
  if (!intSnap.exists)
    throw new Error("Google Calendar integration not connected");
  const integration = intSnap.data();

  const secretKey = process.env.TOKEN_ENCRYPTION_KEY!;
  const refreshToken = decryptToken(integration!.refreshToken, secretKey);

  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const projectSnap = await db.collection("projects").doc(task.projectId).get();
  const projectName = projectSnap.exists
    ? (projectSnap.data() as ProjectDoc).name
    : "Project";

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const eventPayload = {
    summary: `[${projectName}] ${task.title}`,
    description: task.description || undefined,
    start: { dateTime: task.dueDate },
    end: { dateTime: task.dueDate },
  };

  let gcalEventId = task.gcalEventId;
  if (gcalEventId) {
    await calendar.events.patch({
      calendarId: "primary",
      eventId: gcalEventId,
      requestBody: eventPayload,
    });
  } else {
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: eventPayload,
    });
    gcalEventId = res.data.id || null;
    await db
      .collection("tasks")
      .doc(taskId)
      .update({ gcalEventId, updatedAt: new Date().toISOString() });
  }

  return { success: true, gcalEventId };
}
