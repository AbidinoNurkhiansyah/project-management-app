import React from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ProjectDoc } from "@/types/projects";

const SAMPLE_PROJECTS: ProjectDoc[] = [
  {
    id: "proj-1",
    userId: "user-1",
    name: "Core Platform V2",
    description: "Cloudflare R2 zero-egress object storage & project workspace",
    slug: "core-platform-v2",
    color: "#3b82f6",
    icon: "layout",
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-2",
    userId: "user-1",
    name: "Mobile App MVP",
    description: "React Native client with offline-first synchronization",
    slug: "mobile-app-mvp",
    color: "#10b981",
    icon: "smartphone",
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ProjectScopedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  return (
    <AppShell projects={SAMPLE_PROJECTS} activeProjectId={params.projectId}>
      {children}
    </AppShell>
  );
}
