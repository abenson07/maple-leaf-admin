"use client";

interface CardSkeletonProps {
  lines?: number;
}

export function CardSkeleton({ lines = 3 }: CardSkeletonProps) {
  return (
    <div className="animate-pulse rounded-lg border border-border-primary p-6">
      <div className="mb-4 h-6 w-3/4 rounded bg-background-secondary" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="mb-2 h-4 rounded bg-background-secondary"
          style={{
            width: i === lines - 1 ? "60%" : "100%",
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}
