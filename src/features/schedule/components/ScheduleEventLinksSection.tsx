"use client";

import React from "react";
import { Plus, Trash2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DraftLink } from "../hooks/useScheduleEventForm";

interface ScheduleEventLinksSectionProps {
  links: DraftLink[];
  onAddLink: () => void;
  onUpdateLink: (id: string, field: "label" | "url", value: string) => void;
  onRemoveLink: (id: string) => void;
  onHide: () => void;
}

export function ScheduleEventLinksSection({
  links,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
  onHide,
}: ScheduleEventLinksSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
          Links (Meeting, Docs, Figma, etc.)
        </label>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddLink}
            disabled={links.length >= 10}
            className="h-7 px-2 text-xs gap-1"
          >
            <Plus className="w-3 h-3" />
            Add link
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onHide}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Hide
          </Button>
        </div>
      </div>

      {links.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">
          No links attached. Click &ldquo;Add link&rdquo; to attach Zoom, Google
          Meet, Notion, or reference URLs.
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-2">
              <Input
                placeholder="Label (e.g. Meet)"
                value={link.label}
                onChange={(e) => onUpdateLink(link.id, "label", e.target.value)}
                className="w-36 shrink-0 text-xs"
              />
              <Input
                placeholder="https://meet.google.com/..."
                value={link.url}
                onChange={(e) => onUpdateLink(link.id, "url", e.target.value)}
                className="flex-1 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveLink(link.id)}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-400"
                title="Remove link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
