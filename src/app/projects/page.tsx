"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { Button } from "@/components/ui/button";
import { ProjectCreateDialog } from "@/components/shared/ProjectCreateDialog";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const { projects, loading, createProject } = useProjects();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (payload: { name: string; description?: string | null; color: string }) => {
    await createProject({
      name: payload.name,
      description: payload.description || null,
      color: payload.color,
    });
  };

  return (
    <AuthGuard>
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
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>New Project</span>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-lg border border-border bg-surface-card animate-pulse"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg bg-surface-card/50">
              <h3 className="text-sm font-medium text-foreground">No projects found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Get started by creating your first project workspace container.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="mt-4"
              >
                + Create Project
              </Button>
            </div>
          ) : (
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
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <ProjectCreateDialog
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreate}
          />
        </div>
      </AppShell>
    </AuthGuard>
  );
}
