"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kanban, Palette, CheckSquare, Settings, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress";
import { ProjectProgressStats } from "@/hooks/useProjectsProgress";

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
    <aside className="w-56 shrink-0 border-r border-border bg-surface-layout/60 p-3 hidden md:flex flex-col justify-between">
      <div className="space-y-1">
        <Link
          href="/projects"
          className="flex h-7 items-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors mb-2"
          title="Back to all projects"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>All Projects</span>
        </Link>

        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </div>

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-surface-elevated text-foreground border border-border"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="space-y-3 pt-3 border-t border-border/50">
        {projectProgress && (
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
        )}
      </div>
    </aside>
  );
}
