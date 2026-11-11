"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { TaskDoc } from "@/types/tasks";
import {
  calculateProjectProgress,
  ProjectProgressResult,
  deriveParentTaskStatus,
} from "@/lib/progress";

export interface ProjectProgressStats extends ProjectProgressResult {
  done: number; // alias for completedTasks
  total: number; // alias for totalTasks
}

const DEFAULT_STATS: ProjectProgressStats = {
  percentage: 0,
  totalTasks: 0,
  total: 0,
  completedTasks: 0,
  done: 0,
  effectiveCompleted: 0,
  inProgressTasks: 0,
  todoTasks: 0,
  weightPerTask: 0,
};

export function useProjectsProgress() {
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

    try {
      const db = getFirebaseFirestore();
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: TaskDoc[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Omit<TaskDoc, "id">;
            const effectiveColumnId = deriveParentTaskStatus(data.subtasks, data.columnId);
            return {
              id: docSnap.id,
              ...data,
              columnId: effectiveColumnId,
            };
          });
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
      setError(err instanceof Error ? err.message : "Failed to load project progress");
      setLoading(false);
    }
  }, [user]);

  const progressByProject = useMemo(() => {
    const tasksByProject: Record<string, TaskDoc[]> = {};

    for (const task of tasks) {
      if (!task.projectId) continue;
      if (!tasksByProject[task.projectId]) {
        tasksByProject[task.projectId] = [];
      }
      tasksByProject[task.projectId].push(task);
    }

    const stats: Record<string, ProjectProgressStats> = {};
    for (const pid in tasksByProject) {
      const projectTasks = tasksByProject[pid];
      const result = calculateProjectProgress(projectTasks);
      stats[pid] = {
        ...result,
        total: result.totalTasks,
        done: result.completedTasks,
      };
    }

    return stats;
  }, [tasks]);

  const getProgress = (projectId: string): ProjectProgressStats => {
    return progressByProject[projectId] || DEFAULT_STATS;
  };

  return {
    progressByProject,
    getProgress,
    loading,
    error,
  };
}
