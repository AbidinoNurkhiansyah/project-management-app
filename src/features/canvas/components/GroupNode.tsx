"use client";

import React, { useState, useRef, useEffect } from "react";
import { NodeProps, NodeResizer, useReactFlow } from "@xyflow/react";
import { useCanvasQuickConnect } from "./canvas-quick-connect";

const GROUP_COLORS: Record<string, { border: string; bg: string; label: string; dot: string }> = {
  zinc: {
    border: "border-zinc-700",
    bg: "bg-zinc-900/35",
    label: "text-zinc-400",
    dot: "bg-zinc-500",
  },
  blue: {
    border: "border-blue-500/40",
    bg: "bg-blue-950/20",
    label: "text-blue-400",
    dot: "bg-blue-500",
  },
  emerald: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/20",
    label: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-950/20",
    label: "text-amber-400",
    dot: "bg-amber-500",
  },
  violet: {
    border: "border-violet-500/40",
    bg: "bg-violet-950/20",
    label: "text-violet-400",
    dot: "bg-violet-500",
  },
  rose: {
    border: "border-rose-500/40",
    bg: "bg-rose-950/20",
    label: "text-rose-400",
    dot: "bg-rose-500",
  },
};

export const GroupNode = React.memo(function GroupNode({
  id,
  data,
  selected,
}: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const quickConnect = useCanvasQuickConnect();
  const showColorPicker = selected && !quickConnect?.isMultiSelected;
  const label = (data?.label as string) || "Section";
  const colorKey = (data?.color as string) || "zinc";
  const theme = GROUP_COLORS[colorKey] || GROUP_COLORS.zinc;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(label);
  }, [label]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim() || "Section";
    if (trimmed !== label) {
      updateNodeData(id, { label: trimmed });
    }
  };

  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={140}
        isVisible={selected}
        lineClassName="!border-zinc-400"
        handleClassName="!w-2 !h-2 !bg-zinc-200 !border-zinc-900"
      />
      <div
        className={`w-full h-full min-w-[200px] min-h-[140px] rounded-lg border border-dashed ${theme.border} ${theme.bg} transition-colors`}
      >
        <div
          className="flex items-center justify-between px-3 py-1.5 border-b border-dashed border-zinc-800/80"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setDraft(label);
                  setEditing(false);
                }
              }}
              className="nodrag nopan nowheel bg-zinc-900 text-zinc-100 text-xs font-mono px-1.5 py-0.5 rounded border border-zinc-600 outline-none"
            />
          ) : (
            <span
              className={`text-[11px] font-mono font-semibold uppercase tracking-wider select-none ${theme.label}`}
            >
              {label}
            </span>
          )}

          {showColorPicker && (
            <div
              data-export-ignore="true"
              className="nodrag nopan flex items-center gap-1"
            >
              {Object.entries(GROUP_COLORS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateNodeData(id, { color: key })}
                  className={`w-2.5 h-2.5 rounded-full ${val.dot} ${
                    colorKey === key ? "ring-1 ring-white ring-offset-1 ring-offset-zinc-900" : "opacity-60 hover:opacity-100"
                  }`}
                  title={key}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});
