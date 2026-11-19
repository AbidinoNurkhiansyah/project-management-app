"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { useAuth } from "@/features/auth";
import { ScheduleEventDoc } from "@/types/schedule";
import {
  scheduleEventCreateSchema,
  scheduleEventUpdateSchema,
  ScheduleEventCreateInput,
  ScheduleEventUpdateInput,
} from "../schemas/schedule.schema";

export function useScheduleEvents(projectId: string | null = null) {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = getFirebaseFirestore();
      const constraints = [where("userId", "==", user.uid)];
      if (projectId) {
        constraints.push(where("projectId", "==", projectId));
      }

      const q = query(collection(db, "schedule_events"), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: ScheduleEventDoc[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Omit<ScheduleEventDoc, "id">;
            return {
              id: docSnap.id,
              ...data,
              links: Array.isArray(data.links) ? data.links : [],
            };
          });
          list.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
          setEvents(list);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load schedule events");
      setLoading(false);
    }
  }, [user, projectId]);

  const createEvent = useCallback(
    async (input: ScheduleEventCreateInput): Promise<string> => {
      if (!user) throw new Error("Must be logged in to create an event");
      const validated = scheduleEventCreateSchema.parse(input);
      const db = getFirebaseFirestore();
      const now = new Date().toISOString();

      const docRef = await addDoc(collection(db, "schedule_events"), {
        userId: user.uid,
        projectId: validated.projectId ?? null,
        taskId: validated.taskId ?? null,
        title: validated.title,
        description: validated.description ?? null,
        startAt: validated.startAt,
        endAt: validated.endAt,
        allDay: validated.allDay,
        category: validated.category,
        color: validated.color,
        links: validated.links,
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    },
    [user]
  );

  const updateEvent = useCallback(
    async (eventId: string, input: ScheduleEventUpdateInput): Promise<void> => {
      if (!user) throw new Error("Must be logged in to update an event");
      const validated = scheduleEventUpdateSchema.parse(input);
      const db = getFirebaseFirestore();
      const ref = doc(db, "schedule_events", eventId);

      // Strip undefined keys so Firestore doesn't throw on undefined field values
      const payload: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };
      for (const [key, value] of Object.entries(validated)) {
        if (value !== undefined) {
          payload[key] = value;
        }
      }

      await updateDoc(ref, payload);
    },
    [user]
  );

  const deleteEvent = useCallback(
    async (eventId: string): Promise<void> => {
      if (!user) throw new Error("Must be logged in to delete an event");
      const db = getFirebaseFirestore();
      await deleteDoc(doc(db, "schedule_events", eventId));
    },
    [user]
  );

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
