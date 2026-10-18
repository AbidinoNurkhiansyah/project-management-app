"use client";

import React from "react";
import { CanvasBoard } from "@/components/canvas/CanvasBoard";
import { useCanvas } from "@/hooks/useCanvas";

export default function CanvasPage({ params }: { params: { projectId: string } }) {
  const { canvasData, loading, saveStatus, saveCanvas } = useCanvas(params.projectId);

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-layout shrink-0">
        <div>
          <h2 className="text-xs font-semibold text-foreground">Flowchart Canvas</h2>
          <p className="text-[11px] text-muted-foreground font-mono">
            React Flow v12 • 800 KB Payload Safeguard
          </p>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-amber-400">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-emerald-400">Saved to Firestore</span>
          )}
          {saveStatus === "error" && (
            <span className="text-rose-400">Payload Limit / Error</span>
          )}
          {saveStatus === "idle" && <span>Auto-saved</span>}
        </div>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Loading canvas whiteboard...
          </div>
        ) : (
          <CanvasBoard initialData={canvasData} onSave={saveCanvas} />
        )}
      </div>
    </div>
  );
}
