"use client";

import React from "react";
import { Plus, CheckSquare, StickyNote } from "lucide-react";

interface CanvasToolbarProps {
  onAddNode: (type: "taskNode" | "noteNode") => void;
}

export function CanvasToolbar({ onAddNode }: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-md border border-border bg-surface-elevated/90 backdrop-blur shadow-lg">
      <button
        onClick={() => onAddNode("taskNode")}
        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
      >
        <Plus className="w-3 h-3 text-muted-foreground" />
        <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
        <span>+ Task</span>
      </button>
      <button
        onClick={() => onAddNode("noteNode")}
        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
      >
        <Plus className="w-3 h-3 text-muted-foreground" />
        <StickyNote className="w-3.5 h-3.5 text-amber-400" />
        <span>+ Note</span>
      </button>
    </div>
  );
}
