"use client";

import React from "react";

interface GCalConnectCardProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function GCalConnectCard({
  isConnected,
  onConnect,
  onDisconnect,
}: GCalConnectCardProps) {
  return (
    <div className="p-4 rounded-md border border-border bg-surface-card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-surface-elevated border border-border flex items-center justify-center text-sm">
          📅
        </div>
        <div>
          <h4 className="text-xs font-medium text-foreground">
            Google Calendar
          </h4>
          <p className="text-[11px] text-muted-foreground">
            {isConnected
              ? "Tasks with deadlines automatically sync"
              : "Sync deadlines directly to your calendar"}
          </p>
        </div>
      </div>
      <div>
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="px-2.5 py-1 rounded text-xs border border-border hover:bg-surface-hover text-muted-foreground hover:text-foreground"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="px-2.5 py-1 rounded text-xs bg-white text-black font-medium hover:bg-zinc-200"
          >
            Connect Calendar
          </button>
        )}
      </div>
    </div>
  );
}
