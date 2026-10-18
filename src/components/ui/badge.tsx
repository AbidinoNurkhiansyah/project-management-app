import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border uppercase tracking-wider transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-zinc-800/60 text-zinc-300 border-zinc-700/40",
        secondary: "bg-surface-elevated text-muted-foreground border-border",
        destructive: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        outline: "border-border text-foreground bg-transparent",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
