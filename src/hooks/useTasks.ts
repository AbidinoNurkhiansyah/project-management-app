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
import { TaskDoc, Subtask, TaskColumnStatus, TaskPriority } from "@/types/tasks";
import { TaskCreateInput, TaskUpdateInput } from "@/schemas/task.schema";
import { deriveParentTaskStatus } from "@/lib/progress";

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
          const list: TaskDoc[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Omit<TaskDoc, "id">;
            const effectiveColumnId = deriveParentTaskStatus(data.subtasks, data.columnId);

            // Auto-heal Firestore if status was out of sync
            if (effectiveColumnId !== data.columnId) {
              const ref = doc(db, "tasks", docSnap.id);
              updateDoc(ref, { columnId: effectiveColumnId }).catch(() => {});
            }

            return {
              id: docSnap.id,
              ...data,
              columnId: effectiveColumnId,
            };
          });
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
      const target = tasks.find((t) => t.id === taskId);
      const db = getFirebaseFirestore();
      const ref = doc(db, "tasks", taskId);

      // If dragged to DONE, synchronize all subtasks as completed
      // If dragged to TODO, reset all subtasks as pending
      let updatedSubtasks = target?.subtasks;
      if (columnId === "DONE" && updatedSubtasks && updatedSubtasks.length > 0) {
        updatedSubtasks = updatedSubtasks.map((s) => ({
          ...s,
          completed: true,
          status: "DONE",
        }));
      } else if (columnId === "TODO" && updatedSubtasks && updatedSubtasks.length > 0) {
        updatedSubtasks = updatedSubtasks.map((s) => ({
          ...s,
          completed: false,
          status: "TODO",
        }));
      }

      await updateDoc(ref, {
        columnId,
        order: newOrder,
        ...(updatedSubtasks ? { subtasks: updatedSubtasks } : {}),
        updatedAt: new Date().toISOString(),
      });
    },
    [user, tasks]
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

  const addSubtask = useCallback(
    async (
      taskId: string,
      input:
        | string
        | {
            title: string;
            status?: TaskColumnStatus;
            priority?: TaskPriority;
            dueDate?: string | null;
          }
    ) => {
      if (!user) throw new Error("Must be logged in");
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return;

      const title = typeof input === "string" ? input.trim() : input.title.trim();
      const status = typeof input === "string" ? "TODO" : input.status || "TODO";
      const priority = typeof input === "string" ? "MEDIUM" : input.priority || "MEDIUM";
      const dueDate = typeof input === "string" ? null : input.dueDate || null;

      const currentSubtasks = target.subtasks || [];
      const newSubtask: Subtask = {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        status,
        priority,
        dueDate,
        completed: status === "DONE",
        createdAt: new Date().toISOString(),
      };

      const updated = [...currentSubtasks, newSubtask];
      const newColumnId = deriveParentTaskStatus(updated, target.columnId);
      await updateTask(taskId, { subtasks: updated, columnId: newColumnId });
    },
    [user, tasks, updateTask]
  );

  const updateSubtask = useCallback(
    async (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
      if (!user) throw new Error("Must be logged in");
      const target = tasks.find((t) => t.id === taskId);
      if (!target || !target.subtasks) return;

      const updated = target.subtasks.map((s) => {
        if (s.id !== subtaskId) return s;
        const merged = { ...s, ...updates };
        if (updates.status !== undefined) {
          merged.completed = updates.status === "DONE";
        } else if (updates.completed !== undefined) {
          merged.status = updates.completed ? "DONE" : "TODO";
        }
        return merged;
      });

      const newColumnId = deriveParentTaskStatus(updated, target.columnId);
      await updateTask(taskId, { subtasks: updated, columnId: newColumnId });
    },
    [user, tasks, updateTask]
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      if (!user) throw new Error("Must be logged in");
      const target = tasks.find((t) => t.id === taskId);
      if (!target || !target.subtasks) return;

      const updated = target.subtasks.map((s) => {
        if (s.id !== subtaskId) return s;
        const newCompleted = !s.completed;
        return {
          ...s,
          completed: newCompleted,
          status: newCompleted ? "DONE" : "TODO",
        };
      });
      const newColumnId = deriveParentTaskStatus(updated, target.columnId);
      await updateTask(taskId, { subtasks: updated, columnId: newColumnId });
    },
    [user, tasks, updateTask]
  );

  const removeSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      if (!user) throw new Error("Must be logged in");
      const target = tasks.find((t) => t.id === taskId);
      if (!target || !target.subtasks) return;

      const updated = target.subtasks.filter((s) => s.id !== subtaskId);
      const newColumnId = deriveParentTaskStatus(updated, target.columnId);
      await updateTask(taskId, { subtasks: updated, columnId: newColumnId });
    },
    [user, tasks, updateTask]
  );

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtask,
    removeSubtask,
  };
}
