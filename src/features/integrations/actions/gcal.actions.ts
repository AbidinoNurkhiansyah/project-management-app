"use server";

import crypto from "crypto";
import { google } from "googleapis";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { decryptToken } from "@/lib/crypto";
import { getGoogleOAuth2Client } from "@/lib/google/calendar";
import { requireAuthUser } from "@/lib/firebase/auth-guard";
import { TaskDoc } from "@/types/tasks";
import { ProjectDoc } from "@/types/projects";

const CreateGoogleMeetInputSchema = z.object({
  title: z.string().max(160).optional().default("Meeting"),
  description: z.string().max(2000).nullable().optional(),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
});

export type CreateGoogleMeetInput = z.input<typeof CreateGoogleMeetInputSchema>;

export type CreateGoogleMeetResult =
  | { ok: true; meetUrl: string; gcalEventId: string | null }
  | {
      ok: false;
      code: "UNAUTHENTICATED" | "NOT_CONNECTED" | "INVALID_INPUT" | "API_ERROR";
      error: string;
    };

export async function createGoogleMeetAction(
  input: CreateGoogleMeetInput,
  token: string,
): Promise<CreateGoogleMeetResult> {
  const parsed = CreateGoogleMeetInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      error: "Invalid schedule date/time for Google Meet.",
    };
  }

  let user;
  try {
    user = await requireAuthUser(token);
  } catch {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      error: "Sesi login tidak valid. Silakan login ulang.",
    };
  }

  try {
    const db = getAdminFirestore();
    const intSnap = await db
      .collection("users")
      .doc(user.uid)
      .collection("integrations")
      .doc("google")
      .get();

    const integration = intSnap.exists ? intSnap.data() : null;
    if (!integration?.refreshToken) {
      return {
        ok: false,
        code: "NOT_CONNECTED",
        error:
          "Google Calendar belum terhubung. Hubungkan dulu di Project Settings → Google Calendar.",
      };
    }

    const secretKey = process.env.TOKEN_ENCRYPTION_KEY;
    if (!secretKey) {
      return {
        ok: false,
        code: "API_ERROR",
        error: "Server encryption key belum dikonfigurasi.",
      };
    }

    const refreshToken = decryptToken(integration.refreshToken, secretKey);
    const oauth2Client = getGoogleOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const res = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: parsed.data.title.trim() || "Meeting",
        description: parsed.data.description?.trim() || undefined,
        start: { dateTime: parsed.data.startAt },
        end: { dateTime: parsed.data.endAt },
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    const rawMeetUrl =
      res.data.hangoutLink ||
      res.data.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === "video",
      )?.uri ||
      null;

    if (!rawMeetUrl) {
      return {
        ok: false,
        code: "API_ERROR",
        error: "Google Calendar tidak mengembalikan link Google Meet.",
      };
    }

    const organizerEmail =
      res.data.organizer?.email || res.data.creator?.email || null;
    let meetUrl = rawMeetUrl;
    if (organizerEmail) {
      try {
        const parsedUrl = new URL(rawMeetUrl);
        parsedUrl.searchParams.set("authuser", organizerEmail);
        meetUrl = parsedUrl.toString();
      } catch {
        meetUrl = rawMeetUrl;
      }
    }

    return {
      ok: true,
      meetUrl,
      gcalEventId: res.data.id ?? null,
    };
  } catch (err: unknown) {
    console.error("Failed to create Google Meet event:", err);
    return {
      ok: false,
      code: "API_ERROR",
      error:
        err instanceof Error
          ? err.message
          : "Gagal membuat Google Meet. Coba reconnect Google Calendar.",
    };
  }
}

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
