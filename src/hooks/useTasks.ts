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
import { useAuth } from "@/context/AuthContext";
import { TaskDoc } from "@/types/tasks";
import { TaskCreateInput, TaskUpdateInput } from "@/schemas/task.schema";

export function useTasks(projectId: string | null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const db = getFirebaseFirestore();
      const q = query(
        collection(db, "tasks"),
        where("projectId", "==", projectId),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: TaskDoc[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<TaskDoc, "id">),
          }));
          list.sort((a, b) => a.order - b.order);
          setTasks(list);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
      setLoading(false);
    }
  }, [user, projectId]);

  const createTask = useCallback(
    async (input: TaskCreateInput): Promise<string> => {
      if (!user) throw new Error("Must be logged in to create a task");
      const db = getFirebaseFirestore();
      const now = new Date().toISOString();

      const docRef = await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        projectId: input.projectId,
        boardId: input.boardId ?? null,
        columnId: input.columnId || "TODO",
        order: input.order ?? (tasks.length + 1) * 1000,
        title: input.title,
        description: input.description ?? null,
        dueDate: input.dueDate ?? null,
        priority: input.priority || "MEDIUM",
        gcalEventId: null,
        attachments: input.attachments || [],
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    },
    [user, tasks.length]
  );

  const updateTask = useCallback(
    async (taskId: string, input: TaskUpdateInput) => {
      if (!user) throw new Error("Must be logged in to update a task");
      const db = getFirebaseFirestore();
      const ref = doc(db, "tasks", taskId);
      await updateDoc(ref, {
        ...input,
        updatedAt: new Date().toISOString(),
      });
    },
    [user]
  );

  const moveTask = useCallback(
    async (taskId: string, columnId: string, newOrder: number) => {
      if (!user) throw new Error("Must be logged in to move a task");
      const db = getFirebaseFirestore();
      const ref = doc(db, "tasks", taskId);
      await updateDoc(ref, {
        columnId,
        order: newOrder,
        updatedAt: new Date().toISOString(),
      });
    },
    [user]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!user) throw new Error("Must be logged in to delete a task");
      const db = getFirebaseFirestore();
      const ref = doc(db, "tasks", taskId);
      await deleteDoc(ref);
    },
    [user]
  );

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  };
}
