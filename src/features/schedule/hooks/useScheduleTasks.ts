"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { useAuth } from "@/features/auth";
import { TaskDoc } from "@/types/tasks";
import { deriveParentTaskStatus } from "@/features/tasks";

/**
 * Loads tasks with dueDate for either a specific project or across all user projects.
 */
export function useScheduleTasks(projectId: string | null = null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTasks([]);
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

      const q = query(collection(db, "tasks"), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: TaskDoc[] = [];
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data() as Omit<TaskDoc, "id">;
            if (!data.dueDate) continue;
            list.push({
              id: docSnap.id,
              ...data,
              columnId: deriveParentTaskStatus(data.subtasks, data.columnId),
            });
          }
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

  return { tasks, loading, error };
}
