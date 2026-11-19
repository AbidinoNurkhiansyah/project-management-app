"use client";

import React, { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/features/auth";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useProjectStore } from "@/stores/useProjectStore";

interface ProjectScopedShellProps {
  projectId: string;
  children: React.ReactNode;
}

export function ProjectScopedShell({
  projectId,
  children,
}: ProjectScopedShellProps) {
  const { projects } = useProjects();
  const { setActiveProjectId, addRecentProject } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      setActiveProjectId(projectId);
      addRecentProject(projectId);
    }
  }, [projectId, setActiveProjectId, addRecentProject]);

  return (
    <AuthGuard>
      <AppShell projects={projects} activeProjectId={projectId}>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
