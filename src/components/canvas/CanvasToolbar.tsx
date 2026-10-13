"use client";

import React from "react";

interface CanvasToolbarProps {
  onAddNode: (type: "taskNode" | "noteNode") => void;
}

export function CanvasToolbar({ onAddNode }: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-md border border-border bg-surface-elevated/90 backdrop-blur shadow-lg">
      <button
        onClick={() => onAddNode("taskNode")}
        className="px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
      >
        + Task
      </button>
      <button
        onClick={() => onAddNode("noteNode")}
        className="px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
      >
        + Note
      </button>
    </div>
  );
}
