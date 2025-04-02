import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "live" | "coming-soon";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full",
        status === "live"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        className
      )}
    >
      {status === "live" ? "Live" : "Coming Soon"}
    </span>
  );
} 