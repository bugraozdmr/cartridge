import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground outline-none transition placeholder:text-slate-500 focus:border-primary/60 focus:bg-white/10 focus:ring-2 focus:ring-primary/20", className)} {...props} />;
}