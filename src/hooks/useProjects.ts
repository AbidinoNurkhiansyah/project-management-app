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
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { ProjectDoc } from "@/types/projects";
import { ProjectCreateInput, ProjectUpdateInput } from "@/schemas/project.schema";
import { deleteProjectCascadeAction } from "@/actions/project-cascade.actions";

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const db = getFirebaseFirestore();
      const q = query(
        collection(db, "projects"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: ProjectDoc[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ProjectDoc, "id">),
          }));
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setProjects(list);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
      setLoading(false);
    }
  }, [user]);

  const createProject = useCallback(
    async (input: ProjectCreateInput): Promise<string> => {
      if (!user) throw new Error("Must be logged in to create a project");
      const db = getFirebaseFirestore();
      const now = new Date().toISOString();
      const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const docRef = await addDoc(collection(db, "projects"), {
        userId: user.uid,
        name: input.name,
        description: input.description ?? null,
        slug: slug || "project",
        color: input.color || "#3b82f6",
        icon: input.icon ?? "folder",
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    },
    [user]
  );

  const updateProject = useCallback(
    async (projectId: string, input: ProjectUpdateInput) => {
      if (!user) throw new Error("Must be logged in to update a project");
      const db = getFirebaseFirestore();
      const ref = doc(db, "projects", projectId);
      await updateDoc(ref, {
        ...input,
        updatedAt: new Date().toISOString(),
      });
    },
    [user]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!user) throw new Error("Must be logged in to delete a project");
      const token = await user.getIdToken();
      await deleteProjectCascadeAction(projectId, token);
    },
    [user]
  );

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  };
}
