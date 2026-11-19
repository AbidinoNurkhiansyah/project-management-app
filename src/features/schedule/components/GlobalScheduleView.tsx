"use client";

import React from "react";
import { AuthGuard } from "@/features/auth";
import { AppShell } from "@/components/layout/AppShell";
import { useProjects } from "@/features/projects";
import { ScheduleView } from "./ScheduleView";

export function GlobalScheduleView() {
  const { projects } = useProjects();

  return (
    <AuthGuard>
      <AppShell projects={projects} activeProjectId={null}>
        <ScheduleView projectId={null} />
      </AppShell>
    </AuthGuard>
  );
}
