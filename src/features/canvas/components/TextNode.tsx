"use client";

import React, { useState, useRef, useEffect } from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { useCanvasQuickConnect } from "./canvas-quick-connect";

const SIZE_CLASSES: Record<string, string> = {
  sm: "text-xs font-normal",
  md: "text-sm font-medium",
  lg: "text-lg font-semibold tracking-tight",
};

const SIZES = ["sm", "md", "lg"] as const;

export const TextNode = React.memo(function TextNode({
  id,
  data,
  selected,
}: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const quickConnect = useCanvasQuickConnect();
  const showSizePicker = selected && !quickConnect?.isMultiSelected;
  const text = (data?.text as string) || "Label";
  const size = (data?.size as string) || "md";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim() || "Label";
    if (trimmed !== text) {
      updateNodeData(id, { text: trimmed });
    }
  };

  return (
    <div
      className={`px-2 py-1 rounded border transition-colors ${
        selected ? "border-zinc-500 bg-zinc-900/60" : "border-transparent"
      }`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {showSizePicker && !editing && (
        <div
          data-export-ignore="true"
          className="nodrag nopan absolute -top-6 left-0 flex items-center gap-0.5 bg-zinc-900 border border-zinc-700 rounded px-1 py-0.5"
        >
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateNodeData(id, { size: s })}
              className={`px-1 text-[9px] font-mono uppercase rounded ${
                size === s
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(text);
              setEditing(false);
            }
          }}
          className={`nodrag nopan nowheel bg-zinc-900 text-zinc-100 px-1 rounded border border-zinc-500 outline-none ${
            SIZE_CLASSES[size] || SIZE_CLASSES.md
          }`}
        />
      ) : (
        <span
          className={`text-zinc-200 select-none whitespace-nowrap ${
            SIZE_CLASSES[size] || SIZE_CLASSES.md
          }`}
        >
          {text}
        </span>
      )}
    </div>
  );
});
