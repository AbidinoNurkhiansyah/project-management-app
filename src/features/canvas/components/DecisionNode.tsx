"use client";

import React, { useState, useRef, useEffect } from "react";
import { NodeProps, useReactFlow } from "@xyflow/react";
import {
  NodeQuickHandles,
  SHAPE_COLORS,
  ShapeQuickSwitcher,
  useCanvasQuickConnect,
} from "./canvas-quick-connect";

export const DecisionNode = React.memo(function DecisionNode({
  id,
  data,
  selected,
}: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const quickConnect = useCanvasQuickConnect();
  const showShapePicker = selected && !quickConnect?.isMultiSelected;
  const label = (data?.label as string) || "Condition?";
  const colorKey = (data?.color as string) || "violet";
  const theme = SHAPE_COLORS[colorKey] || SHAPE_COLORS.violet;
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
    const trimmed = draft.trim() || "Condition?";
    if (trimmed !== label) {
      updateNodeData(id, { label: trimmed });
    }
  };

  return (
    <div
      className="relative w-[140px] h-[96px] flex items-center justify-center"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {showShapePicker && !editing && (
        <div
          data-export-ignore="true"
          className="nodrag nopan absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded-full px-2 py-1 z-20 whitespace-nowrap shadow-lg"
        >
          <ShapeQuickSwitcher nodeId={id} currentShape="decision" />
          <div className="w-px h-3.5 bg-zinc-700" />
          <div className="flex items-center gap-1">
            {Object.entries(SHAPE_COLORS).map(([key, val]) => (
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
        </div>
      )}

      <svg
        viewBox="0 0 140 96"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <polygon
          points="70,2 138,48 70,94 2,48"
          fill={theme.fill}
          stroke={selected ? theme.selectedStroke : theme.stroke}
          strokeWidth={selected ? 2 : 1.5}
        />
      </svg>

      <NodeQuickHandles
        nodeId={id}
        nodeType="decisionNode"
        handleClassName="!w-2 !h-2 !bg-violet-400"
      />

      <div className="relative z-10 px-4 text-center w-full">
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
            className="nodrag nopan nowheel w-full bg-zinc-800 text-zinc-100 text-[11px] text-center px-1 py-0.5 rounded border border-violet-400 outline-none"
          />
        ) : (
          <span className="text-[11px] font-medium text-zinc-100 leading-tight line-clamp-2 select-none">
            {label}
          </span>
        )}
      </div>
    </div>
  );
});
