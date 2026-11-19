"use client";

import React, { useEffect, useState } from "react";
import { Search, CheckSquare, Kanban, Palette, Settings } from "lucide-react";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function CommandMenu({ isOpen, onClose, onNavigate }: CommandMenuProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: "Go to Tasks", path: "tasks", icon: CheckSquare },
    { label: "Go to Kanban Board", path: "boards", icon: Kanban },
    { label: "Go to Flowchart Canvas", path: "canvas", icon: Palette },
    { label: "Project Settings", path: "settings", icon: Settings },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface-elevated shadow-2xl overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="py-2 max-h-60 overflow-y-auto">
          {filtered.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.path}
                onClick={() => {
                  onNavigate(cmd.path);
                  onClose();
                }}
                className="w-full px-4 py-2 text-left text-xs text-foreground hover:bg-surface-hover flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                  <span>{cmd.label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">Jump</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-xs text-muted-foreground">No commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
