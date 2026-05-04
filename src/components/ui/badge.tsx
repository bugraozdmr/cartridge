import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-white/10 text-slate-100 ring-1 ring-inset ring-white/10",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-white/10 bg-transparent text-slate-200",
  soft: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/20",
  success: "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/20",
  danger: "bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-500/20",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", badgeVariants[variant], className)} {...props} />;
}