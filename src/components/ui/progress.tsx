"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  indicatorColor?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  indicatorColor,
  showLabel = false,
  size = "md",
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round(isNaN(value) ? 0 : value)));
  const heightClass = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-surface-elevated rounded-full overflow-hidden border border-border/40",
          heightClass
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: indicatorColor || "hsl(var(--foreground))",
          }}
        />
      </div>
    </div>
  );
}
