import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground", className)} {...props} />;
}
