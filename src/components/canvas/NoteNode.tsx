import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { StickyNote } from "lucide-react";

export function NoteNode({ data, selected }: NodeProps) {
  const text = (data?.text as string) || "Note";

  return (
    <div
      className={`min-w-[140px] max-w-[200px] p-2.5 rounded border bg-zinc-900 text-zinc-200 shadow-sm ${
        selected ? "border-amber-400" : "border-zinc-800"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-1.5 !h-1.5 !bg-zinc-600"
      />
      <div className="flex items-center gap-1 mb-1">
        <StickyNote className="w-3 h-3 text-amber-400 shrink-0" />
        <span className="text-[10px] font-mono text-zinc-400 uppercase">Note</span>
      </div>
      <p className="text-xs whitespace-pre-wrap leading-relaxed">{text}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-1.5 !h-1.5 !bg-zinc-600"
      />
    </div>
  );
}
