"use client";

import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDestructive = true,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          {isDestructive && (
            <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
          )}
          <DialogTitle className="text-sm font-semibold text-foreground">
            {title}
          </DialogTitle>
        </div>
      </DialogHeader>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>

      <DialogFooter className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
          {cancelLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleConfirm}
          className={`h-8 text-xs ${
            isDestructive
              ? "bg-rose-600 hover:bg-rose-700 text-white"
              : ""
          }`}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
