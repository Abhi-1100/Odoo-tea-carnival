import React from "react";
import clsx from "clsx";

interface SkeletonProps {
  className?: string;
  lines?: number;
  circle?: boolean;
}

export function Skeleton({ className, lines, circle }: SkeletonProps) {
  if (lines) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={clsx("animate-pulse rounded bg-brand-border", i === lines - 1 ? "w-2/3" : "w-full", "h-4")} />
        ))}
      </div>
    );
  }
  return (
    <div className={clsx("animate-pulse bg-brand-border", circle ? "rounded-full" : "rounded-lg", className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton lines={3} />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-brand-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
