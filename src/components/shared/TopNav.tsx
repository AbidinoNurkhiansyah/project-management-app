"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, LogOut, Folder } from "lucide-react";
import { ProjectDoc } from "@/types/projects";
import { ProjectProgressStats } from "@/hooks/useProjectsProgress";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  projects: ProjectDoc[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProjectClick: () => void;
  onOpenCommandMenu: () => void;
  userEmail?: string | null;
  onSignOut?: () => void;
  projectProgress?: ProjectProgressStats;
}

export function TopNav({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProjectClick,
  onOpenCommandMenu,
  userEmail,
  onSignOut,
  projectProgress,
}: TopNavProps) {
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-12 w-full items-center justify-between border-b border-border bg-surface-layout/95 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="Back to all projects"
        >
          <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-zinc-300">
            <Folder className="w-3 h-3 text-zinc-300" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground hidden sm:inline">
            Workspace
          </span>
        </Link>

        <span className="text-border">/</span>

        {activeProjectId ? (
          <ProjectSwitcher
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={onSelectProject}
            onCreateClick={onCreateProjectClick}
          />
        ) : (
          <span className="text-xs font-medium text-foreground">Projects</span>
        )}

        {projectProgress && activeProjectId && (
          <div
            title={`Project Progress: ${projectProgress.percentage}% (${projectProgress.completedTasks}/${projectProgress.totalTasks} completed)`}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-card border border-border text-xs font-mono"
          >
            <div className="w-14 h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border/40">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${projectProgress.percentage}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-foreground">
              {projectProgress.percentage}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandMenu}
          className="flex h-7 items-center gap-2 rounded border border-border bg-surface-card px-2.5 text-xs text-muted-foreground transition-colors hover:border-zinc-700 hover:text-foreground"
        >
          <Search className="w-3 h-3 text-muted-foreground shrink-0" />
          <span>Quick actions</span>
          <kbd className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] font-mono border border-border">
            ⌘K
          </kbd>
        </button>

        {userEmail && (
          <div className="flex items-center gap-2">
            <div
              title={userEmail}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-card text-[11px] font-medium text-foreground select-none"
            >
              {userEmail.charAt(0).toUpperCase()}
            </div>
            {onSignOut && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSignOutConfirmOpen(true)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-red-400 gap-1"
                title="Sign out of workspace"
              >
                <LogOut className="w-3 h-3 shrink-0" />
                <span>Sign out</span>
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isSignOutConfirmOpen}
        onClose={() => setIsSignOutConfirmOpen(false)}
        onConfirm={() => {
          onSignOut?.();
        }}
        title="Sign Out"
        description="Are you sure you want to sign out of your workspace session?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </header>
  );
}
