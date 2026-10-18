"use client";

import React, { useState } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";
import { ProjectDoc } from "@/types/projects";

interface ProjectSwitcherProps {
  projects: ProjectDoc[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateClick: () => void;
}

export function ProjectSwitcher({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateClick,
}: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-8 px-2.5 rounded border border-border bg-surface-card hover:bg-surface-elevated text-xs font-medium text-foreground transition-colors"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: activeProject?.color || "#71717a" }}
        />
        <span className="truncate max-w-[140px]">
          {activeProject?.name ?? "Select Project"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-56 rounded border border-border bg-surface-elevated shadow-xl z-50 py-1 text-xs">
          <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Projects
          </div>
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                onSelectProject(project.id);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-left hover:bg-surface-hover text-foreground"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="truncate flex-1">{project.name}</span>
              {project.id === activeProjectId && (
                <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
            </button>
          ))}
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => {
                onCreateClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-left text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
