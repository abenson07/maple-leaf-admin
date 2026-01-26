"use client";

interface ChartSkeletonProps {
  height?: number;
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  const bars = 12;
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-6 w-1/3 rounded bg-background-secondary" />
      <div
        className="flex items-end justify-between gap-2"
        style={{ height: `${height}px` }}
      >
        {Array.from({ length: bars }).map((_, i) => {
          const barHeight = Math.random() * 0.7 + 0.3; // Random height between 30% and 100%
          return (
            <div
              key={i}
              className="flex-1 rounded-t bg-background-secondary"
              style={{
                height: `${barHeight * 100}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
