"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  ExternalLink,
  Folder,
  Pencil,
  Trash2,
  Link2,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CalendarItem, ScheduleEventDoc } from "@/types/schedule";
import { TaskDetailDialogContent } from "./TaskDetailDialogContent";

interface ScheduleItemDetailDialogProps {
  item: CalendarItem | null;
  onClose: () => void;
  onEditEvent: (event: ScheduleEventDoc) => void;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export function ScheduleItemDetailDialog({
  item,
  onClose,
  onEditEvent,
  onDeleteEvent,
}: ScheduleItemDetailDialogProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!item) return null;

  if (item.kind === "task") {
    return (
      <Dialog open={Boolean(item)} onOpenChange={(o) => !o && onClose()}>
        <TaskDetailDialogContent item={item} onClose={onClose} />
      </Dialog>
    );
  }

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1500);
    } catch {
      // Clipboard API unavailable
    }
  };

  const { event } = item;
  const sameDay =
    format(item.start, "yyyy-MM-dd") === format(item.end, "yyyy-MM-dd");

  return (
    <>
      <Dialog open={Boolean(item)} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <Badge variant="outline" className="text-[10px]">
                {event.category}
              </Badge>
              {item.projectName ? (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Folder className="w-2.5 h-2.5" />
                  {item.projectName}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted-foreground"
                >
                  Personal
                </Badge>
              )}
            </div>
            <DialogTitle className="text-base">{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              {event.allDay ? (
                <>
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {sameDay
                      ? `${format(item.start, "EEEE, dd MMM yyyy")} (All day)`
                      : `${format(item.start, "dd MMM yyyy")} – ${format(item.end, "dd MMM yyyy")} (All day)`}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {sameDay
                      ? `${format(item.start, "EEEE, dd MMM yyyy")} · ${format(item.start, "HH:mm")} – ${format(item.end, "HH:mm")}`
                      : `${format(item.start, "dd MMM, HH:mm")} – ${format(item.end, "dd MMM, HH:mm")}`}
                  </span>
                </>
              )}
            </div>

            {event.description && (
              <p className="text-foreground/90 whitespace-pre-wrap rounded-md border border-border bg-surface-card p-3">
                {event.description}
              </p>
            )}

            {event.links.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Links ({event.links.length})
                </div>
                <div className="space-y-1.5">
                  {event.links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-card px-2.5 py-1.5"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline truncate min-w-0"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate font-medium">
                          {link.label || link.url}
                        </span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(link.id, link.url)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-hover shrink-0"
                        title="Copy URL"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onEditEvent(event);
                }}
                className="gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          await onDeleteEvent(event.id);
          setConfirmDeleteOpen(false);
          onClose();
        }}
        title="Delete Event"
        description={`Delete "${event.title}" from your schedule? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </>
  );
}
