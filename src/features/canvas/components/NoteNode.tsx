"use client";

import React, { useState, useRef, useEffect } from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { StickyNote } from "lucide-react";
import { NodeQuickHandles, useCanvasQuickConnect } from "./canvas-quick-connect";

const NOTE_COLORS: Record<string, { box: string; icon: string; dot: string }> = {
  amber: {
    box: "bg-amber-950/40 border-amber-500/40 text-amber-50",
    icon: "text-amber-400",
    dot: "bg-amber-400",
  },
  zinc: {
    box: "bg-zinc-900 border-zinc-800 text-zinc-200",
    icon: "text-zinc-400",
    dot: "bg-zinc-500",
  },
  blue: {
    box: "bg-blue-950/40 border-blue-500/40 text-blue-50",
    icon: "text-blue-400",
    dot: "bg-blue-400",
  },
  emerald: {
    box: "bg-emerald-950/40 border-emerald-500/40 text-emerald-50",
    icon: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  violet: {
    box: "bg-violet-950/40 border-violet-500/40 text-violet-50",
    icon: "text-violet-400",
    dot: "bg-violet-400",
  },
  rose: {
    box: "bg-rose-950/40 border-rose-500/40 text-rose-50",
    icon: "text-rose-400",
    dot: "bg-rose-400",
  },
};

export const NoteNode = React.memo(function NoteNode({
  id,
  data,
  selected,
}: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const quickConnect = useCanvasQuickConnect();
  const showColorPicker = selected && !quickConnect?.isMultiSelected;
  const text = (data?.text as string) || "Note";
  const colorKey = (data?.color as string) || "zinc";
  const theme = NOTE_COLORS[colorKey] || NOTE_COLORS.zinc;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim() || "Note";
    if (trimmed !== text) {
      updateNodeData(id, { text: trimmed });
    }
  };

  return (
    <div
      className={`relative min-w-[150px] max-w-[220px] p-2.5 rounded border transition-colors ${theme.box} ${
        selected ? "!border-amber-400 ring-1 ring-amber-400/20" : ""
      }`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      <NodeQuickHandles
        nodeId={id}
        nodeType="noteNode"
        handleClassName="!w-1.5 !h-1.5 !bg-zinc-500"
      />

      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1">
          <StickyNote className={`w-3 h-3 shrink-0 ${theme.icon}`} />
          <span className="text-[10px] font-mono text-zinc-400 uppercase">
            Note
          </span>
        </div>

        {showColorPicker && (
          <div
            data-export-ignore="true"
            className="nodrag nopan flex items-center gap-1"
          >
            {Object.entries(NOTE_COLORS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateNodeData(id, { color: key })}
                className={`w-2.5 h-2.5 rounded-full ${val.dot} ${
                  colorKey === key
                    ? "ring-1 ring-white ring-offset-1 ring-offset-zinc-900"
                    : "opacity-60 hover:opacity-100"
                }`}
                title={key}
              />
            ))}
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          ref={textareaRef}
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(text);
              setEditing(false);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              commit();
            }
          }}
          className="nodrag nopan nowheel w-full bg-zinc-950/70 text-xs text-zinc-100 p-1 rounded border border-zinc-600 outline-none resize-none leading-relaxed"
        />
      ) : (
        <p className="text-xs whitespace-pre-wrap leading-relaxed select-none">
          {text}
        </p>
      )}
    </div>
  );
});
