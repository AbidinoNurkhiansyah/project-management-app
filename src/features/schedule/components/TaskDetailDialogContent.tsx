"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, ExternalLink, Folder, CheckSquare } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarTaskItem } from "@/types/schedule";

interface TaskDetailDialogContentProps {
  item: CalendarTaskItem;
  onClose: () => void;
}

export function TaskDetailDialogContent({
  item,
  onClose,
}: TaskDetailDialogContentProps) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <Badge variant="outline" className="text-[10px] gap-1">
            <CheckSquare className="w-3 h-3" />
            Project Task
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {item.priority}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {item.status}
          </Badge>
        </div>
        <DialogTitle className="text-base">{item.title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Due: {format(item.start, "EEEE, dd MMM yyyy")}</span>
        </div>

        {item.projectName && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Folder className="w-3.5 h-3.5 shrink-0" />
            <span>{item.projectName}</span>
          </div>
        )}

        {item.description && (
          <p className="text-foreground/90 whitespace-pre-wrap rounded-md border border-border bg-surface-card p-3">
            {item.description}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button asChild size="sm" className="gap-1.5">
          <Link href={`/projects/${item.projectId}/tasks/${item.taskId}`}>
            <span>Open Task</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
