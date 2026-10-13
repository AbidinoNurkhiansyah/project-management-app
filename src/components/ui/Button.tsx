import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none";

    const variantStyles = {
      default: "bg-foreground text-background hover:bg-zinc-200 dark:hover:bg-zinc-300",
      secondary: "bg-surface-elevated text-foreground hover:bg-surface-hover border border-border",
      outline: "border border-border bg-transparent hover:bg-surface-hover text-foreground",
      ghost: "hover:bg-surface-hover text-muted-foreground hover:text-foreground",
      destructive: "bg-destructive text-white hover:bg-red-600/90",
    };

    const sizeStyles = {
      default: "h-8 px-3 text-xs",
      sm: "h-7 px-2.5 text-[11px]",
      lg: "h-9 px-4 text-sm",
      icon: "h-8 w-8",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
