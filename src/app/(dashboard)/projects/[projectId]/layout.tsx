import React from "react";
import { ProjectScopedShell } from "@/features/projects";

export default function ProjectScopedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  return (
    <ProjectScopedShell projectId={params.projectId}>
      {children}
    </ProjectScopedShell>
  );
}
