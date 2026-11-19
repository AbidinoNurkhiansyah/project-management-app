"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useCanvas } from "../hooks/useCanvas";

const CanvasBoard = dynamic(
  () => import("./CanvasBoard").then((mod) => mod.CanvasBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
        Loading canvas...
      </div>
    ),
  }
);

interface CanvasViewProps {
  projectId: string;
}

export function CanvasView({ projectId }: CanvasViewProps) {
  const { canvasData, loading, saveStatus, saveCanvas } = useCanvas(projectId);
  const { tasks } = useTasks(projectId);

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-layout shrink-0">
        <div>
          <h2 className="text-xs font-semibold text-foreground">Canvas</h2>
          <p className="text-[11px] text-muted-foreground">
            Flowchart & visual workspace
          </p>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-amber-400">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-emerald-400">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-rose-400">Save failed</span>
          )}
          {saveStatus === "idle" && <span>Auto-saved</span>}
        </div>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Loading canvas...
          </div>
        ) : (
          <CanvasBoard
            initialData={canvasData}
            onSave={saveCanvas}
            projectTasks={tasks}
          />
        )}
      </div>
    </div>
  );
}
