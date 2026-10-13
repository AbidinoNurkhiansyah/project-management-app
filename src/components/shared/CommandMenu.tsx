"use client";

import React, { useEffect, useState } from "react";

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
    { label: "Go to Tasks", path: "tasks" },
    { label: "Go to Kanban Board", path: "boards" },
    { label: "Go to Flowchart Canvas", path: "canvas" },
    { label: "Project Settings", path: "settings" },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface-elevated shadow-2xl overflow-hidden">
        <div className="p-3 border-b border-border">
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
          {filtered.map((cmd) => (
            <button
              key={cmd.path}
              onClick={() => {
                onNavigate(cmd.path);
                onClose();
              }}
              className="w-full px-4 py-2 text-left text-xs text-foreground hover:bg-surface-hover flex items-center justify-between"
            >
              <span>{cmd.label}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Jump</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-xs text-muted-foreground">No commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
