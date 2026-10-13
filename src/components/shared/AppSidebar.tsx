"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  projectId: string;
}

export function AppSidebar({ projectId }: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Kanban Board",
      href: `/projects/${projectId}/boards`,
      icon: "📋",
    },
    {
      label: "Canvas Whiteboard",
      href: `/projects/${projectId}/canvas`,
      icon: "🎨",
    },
    {
      label: "Task List",
      href: `/projects/${projectId}/tasks`,
      icon: "✓",
    },
    {
      label: "Project Settings",
      href: `/projects/${projectId}/settings`,
      icon: "⚙️",
    },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface-layout/60 p-3 hidden md:flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </div>

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-surface-elevated text-foreground border border-border"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground px-2">
        <p className="font-mono text-[10px]">Zero-Egress Workspace</p>
      </div>
    </aside>
  );
}
