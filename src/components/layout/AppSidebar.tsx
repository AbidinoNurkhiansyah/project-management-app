"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Kanban,
  Palette,
  CheckSquare,
  Settings,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress";
import { ProjectProgressStats } from "@/features/projects/hooks/useProjectsProgress";

const SIDEBAR_STORAGE_KEY = "pm-app-sidebar-collapsed";

interface AppSidebarProps {
  projectId: string;
  projectProgress?: ProjectProgressStats;
  projectColor?: string;
}

export function AppSidebar({
  projectId,
  projectProgress,
  projectColor,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage access errors
      }
      return next;
    });
  };

  const navItems = [
    {
      label: "Kanban Board",
      href: `/projects/${projectId}/boards`,
      icon: Kanban,
    },
    {
      label: "Canvas Whiteboard",
      href: `/projects/${projectId}/canvas`,
      icon: Palette,
    },
    {
      label: "Task List",
      href: `/projects/${projectId}/tasks`,
      icon: CheckSquare,
    },
    {
      label: "Project Settings",
      href: `/projects/${projectId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-surface-layout/60 hidden md:flex flex-col justify-between transition-all duration-200 ease-in-out",
        isCollapsed ? "w-14 p-2" : "w-56 p-3",
      )}
    >
      <div className="space-y-1">
        <div
          className={cn(
            "flex items-center mb-2",
            isCollapsed ? "flex-col gap-1" : "justify-between gap-1",
          )}
        >
          <Link
            href="/projects"
            className={cn(
              "flex h-7 items-center rounded-md text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors",
              isCollapsed ? "w-8 justify-center px-0" : "gap-2 px-2 flex-1 min-w-0",
            )}
            title="Back to all projects"
            aria-label="Back to all projects"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="truncate">All Projects</span>}
          </Link>

          <button
            type="button"
            onClick={toggleCollapse}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {isCollapsed ? (
          <div className="border-t border-border/50 my-2" />
        ) : (
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </div>
        )}

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
              className={cn(
                "flex h-8 items-center rounded-md text-xs font-medium transition-colors",
                isCollapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
                isActive
                  ? "bg-surface-elevated text-foreground border border-border"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="space-y-3 pt-3 border-t border-border/50">
        {projectProgress &&
          (isCollapsed ? (
            <div
              className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg border border-border bg-surface-card/60"
              title={`Project Goal: ${projectProgress.percentage}% (${
                projectProgress.totalTasks === 0
                  ? "No tasks yet"
                  : `${projectProgress.completedTasks}/${projectProgress.totalTasks} Done`
              })`}
            >
              <span className="text-[10px] font-mono font-semibold text-foreground">
                {projectProgress.percentage}%
              </span>
              <div className="w-full px-0.5">
                <ProgressBar
                  value={projectProgress.percentage}
                  indicatorColor={projectColor || "hsl(var(--foreground))"}
                  size="sm"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-border bg-surface-card/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  Project Goal
                </span>
                <span className="text-foreground font-semibold">
                  {projectProgress.percentage}%
                </span>
              </div>

              <ProgressBar
                value={projectProgress.percentage}
                indicatorColor={projectColor || "hsl(var(--foreground))"}
                size="sm"
              />

              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/30">
                <span>
                  {projectProgress.totalTasks === 0
                    ? "No tasks yet"
                    : `${projectProgress.completedTasks}/${projectProgress.totalTasks} Done`}
                </span>
                {projectProgress.totalTasks > 0 && (
                  <span title="Weight per task">
                    {projectProgress.weightPerTask}% / task
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </aside>
  );
}
