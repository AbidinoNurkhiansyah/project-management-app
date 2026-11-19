"use client";

import React, { useState, useRef, useEffect } from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { CheckSquare, Link2 } from "lucide-react";
import { NodeQuickHandles } from "./canvas-quick-connect";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-zinc-800 text-zinc-400",
  MEDIUM: "bg-blue-500/15 text-blue-400",
  HIGH: "bg-amber-500/15 text-amber-400",
  URGENT: "bg-rose-500/15 text-rose-400",
};

const STATUS_STYLES: Record<string, string> = {
  TODO: "text-zinc-400",
  IN_PROGRESS: "text-blue-400",
  DONE: "text-emerald-400",
};

export const TaskNode = React.memo(function TaskNode({
  id,
  data,
  selected,
}: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const title = (data?.title as string) || "Untitled Task";
  const priority = (data?.priority as string) || "MEDIUM";
  const taskId = data?.taskId as string | undefined;
  const status = data?.status as string | undefined;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(title);
  }, [title]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitTitle = () => {
    setEditing(false);
    const trimmed = draft.trim() || "Untitled Task";
    if (trimmed !== title) {
      updateNodeData(id, { title: trimmed });
    }
  };

  const cyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = PRIORITIES.indexOf(priority as (typeof PRIORITIES)[number]);
    const next = PRIORITIES[(idx + 1) % PRIORITIES.length];
    updateNodeData(id, { priority: next });
  };

  return (
    <div
      className={`relative min-w-[170px] max-w-[230px] p-2.5 rounded border bg-surface-card text-foreground transition-colors ${
        selected ? "border-white ring-1 ring-white/20" : "border-border"
      }`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      <NodeQuickHandles
        nodeId={id}
        nodeType="taskNode"
        handleClassName="!w-2 !h-2 !bg-zinc-500"
      />

      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground uppercase">
          <CheckSquare className="w-3 h-3 text-blue-400" />
          Task
          {taskId && (
            <Link2
              className="w-2.5 h-2.5 text-emerald-400"
              aria-label="Linked to project task"
            />
          )}
        </span>
        <button
          type="button"
          onClick={cyclePriority}
          title="Click to change priority"
          className={`nodrag nopan text-[9px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
            PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM
          }`}
        >
          {priority}
        </button>
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitTitle();
            if (e.key === "Escape") {
              setDraft(title);
              setEditing(false);
            }
          }}
          className="nodrag nopan nowheel w-full bg-zinc-900 text-xs font-medium text-foreground px-1.5 py-0.5 rounded border border-zinc-500 outline-none"
        />
      ) : (
        <p className="text-xs font-medium leading-snug line-clamp-2 select-none">
          {title}
        </p>
      )}

      {status && (
        <div className="mt-1.5 pt-1 border-t border-border/60 flex items-center justify-between">
          <span
            className={`text-[9px] font-mono uppercase ${
              STATUS_STYLES[status] || "text-zinc-400"
            }`}
          >
            {status.replace("_", " ")}
          </span>
        </div>
      )}
    </div>
  );
});
