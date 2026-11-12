"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "./TopNav";
import { AppSidebar } from "./AppSidebar";
import { CommandMenu } from "./CommandMenu";
import { ProjectCreateDialog } from "./ProjectCreateDialog";
import { ProjectDoc } from "@/types/projects";
import { useProjectStore } from "@/store/useProjectStore";
import { useAuth } from "@/context/AuthContext";
import { useProjectsProgress } from "@/hooks/useProjectsProgress";

interface AppShellProps {
  children: React.ReactNode;
  projects?: ProjectDoc[];
  activeProjectId?: string | null;
}

export function AppShell({ children, projects = [], activeProjectId = null }: AppShellProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setActiveProjectId } = useProjectStore();
  const { getProgress } = useProjectsProgress();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const activeProgress = activeProjectId ? getProgress(activeProjectId) : undefined;
  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : undefined;

  useEffect(() => {
    if (activeProjectId) {
      setActiveProjectId(activeProjectId);
    }
  }, [activeProjectId, setActiveProjectId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectProject = (projectId: string) => {
    router.push(`/projects/${projectId}/boards`);
  };

  const handleNavigateCommand = (path: string) => {
    if (activeProjectId) {
      router.push(`/projects/${activeProjectId}/${path}`);
    } else {
      router.push("/projects");
    }
  };

  const handleCreateProject = async (payload: { name: string; description?: string | null; color: string }) => {
    // In actual usage, creates in Firestore or via Server Action
    const mockId = `proj-${Date.now()}`;
    router.push(`/projects/${mockId}/boards`);
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans">
      <TopNav
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProjectClick={() => setIsCreateOpen(true)}
        onOpenCommandMenu={() => setIsCommandOpen(true)}
        userEmail={user?.email}
        onSignOut={logout}
        projectProgress={activeProgress}
      />

      <div className="flex flex-1 overflow-hidden">
        {activeProjectId && (
          <AppSidebar
            projectId={activeProjectId}
            projectProgress={activeProgress}
            projectColor={activeProject?.color}
          />
        )}
        <main className="flex-1 overflow-y-auto bg-surface-base">{children}</main>
      </div>

      <CommandMenu
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={handleNavigateCommand}
      />

      <ProjectCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}

