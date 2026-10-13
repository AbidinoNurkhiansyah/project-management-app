"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "./TopNav";
import { AppSidebar } from "./AppSidebar";
import { CommandMenu } from "./CommandMenu";
import { ProjectCreateDialog } from "./ProjectCreateDialog";
import { ProjectDoc } from "@/types/projects";
import { useProjectStore } from "@/store/useProjectStore";

interface AppShellProps {
  children: React.ReactNode;
  projects?: ProjectDoc[];
  activeProjectId?: string | null;
}

export function AppShell({ children, projects = [], activeProjectId = null }: AppShellProps) {
  const router = useRouter();
  const { setActiveProjectId } = useProjectStore();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <TopNav
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProjectClick={() => setIsCreateOpen(true)}
        onOpenCommandMenu={() => setIsCommandOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {activeProjectId && <AppSidebar projectId={activeProjectId} />}
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
