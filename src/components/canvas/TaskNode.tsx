import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

export function TaskNode({ data, selected }: NodeProps) {
  const title = (data?.title as string) || "Untitled Task";
  const priority = (data?.priority as string) || "MEDIUM";

  return (
    <div
      className={`min-w-[160px] max-w-[220px] p-2.5 rounded border bg-surface-card text-foreground transition-all shadow-md ${
        selected ? "border-white ring-1 ring-white/20" : "border-border"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-zinc-500"
      />
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          Task
        </span>
        <span className="text-[9px] font-mono px-1 rounded bg-surface-elevated text-zinc-300">
          {priority}
        </span>
      </div>
      <p className="text-xs font-medium leading-snug line-clamp-2">{title}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-zinc-500"
      />
    </div>
  );
}
