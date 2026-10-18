"use client";

import React, { useEffect } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStore } from "@/store/useProjectStore";

export default function ProjectScopedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const { projects } = useProjects();
  const { setActiveProjectId, addRecentProject } = useProjectStore();

  useEffect(() => {
    if (params.projectId) {
      setActiveProjectId(params.projectId);
      addRecentProject(params.projectId);
    }
  }, [params.projectId, setActiveProjectId, addRecentProject]);

  return (
    <AuthGuard>
      <AppShell projects={projects} activeProjectId={params.projectId}>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
