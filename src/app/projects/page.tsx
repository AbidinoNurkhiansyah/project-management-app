"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { Button } from "@/components/ui/Button";
import { ProjectDoc } from "@/types/projects";
import { ProjectCreateDialog } from "@/components/shared/ProjectCreateDialog";

const INITIAL_PROJECTS: ProjectDoc[] = [
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDoc[]>(INITIAL_PROJECTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (payload: { name: string; description?: string | null; color: string }) => {
    const newProj: ProjectDoc = {
      id: `proj-${Date.now()}`,
      userId: "user-1",
      name: payload.name,
      description: payload.description || null,
      slug: payload.name.toLowerCase().replace(/\s+/g, "-"),
      color: payload.color,
      icon: "folder",
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
  };

  return (
    <AppShell projects={projects} activeProjectId={null}>
      <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Projects</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Select an active workspace or create a new project container.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
            <span>+</span> New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}/boards`}
              className="group p-4 rounded-lg border border-border bg-surface-card hover:border-zinc-700 hover:bg-surface-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: proj.color }}
                  />
                  <span className="text-[11px] font-mono text-muted-foreground">
                    /{proj.slug}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {proj.description || "No description provided."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>View workspace</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>

        <ProjectCreateDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
        />
      </div>
    </AppShell>
  );
}
