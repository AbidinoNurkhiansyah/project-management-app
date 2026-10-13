"use client";

import React from "react";
import { ProjectDoc } from "@/types/projects";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { Button } from "@/components/ui/Button";

interface TopNavProps {
  projects: ProjectDoc[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProjectClick: () => void;
  onOpenCommandMenu: () => void;
  userEmail?: string | null;
}

export function TopNav({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProjectClick,
  onOpenCommandMenu,
  userEmail,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 flex h-12 w-full items-center justify-between border-b border-border bg-surface-layout/95 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-zinc-300">
            P
          </div>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase hidden sm:inline">
            Workspace
          </span>
        </div>

        <span className="text-border">/</span>

        <ProjectSwitcher
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={onSelectProject}
          onCreateClick={onCreateProjectClick}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandMenu}
          className="flex h-7 items-center gap-2 rounded border border-border bg-surface-card px-2.5 text-xs text-muted-foreground transition-colors hover:border-zinc-700 hover:text-foreground"
        >
          <span>Quick actions</span>
          <kbd className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] font-mono border border-border">
            ⌘K
          </kbd>
        </button>

        {userEmail && (
          <div
            title={userEmail}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-card text-[11px] font-medium text-foreground"
          >
            {userEmail.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
