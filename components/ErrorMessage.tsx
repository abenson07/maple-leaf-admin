"use client";

import { Button } from "@relume_io/relume-ui";
import { BiErrorCircle, BiRefresh } from "react-icons/bi";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-lg border border-error/20 bg-error/10 p-8 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <BiErrorCircle className="size-12 text-error" />
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold text-error">{title}</h3>
        <p className="text-text-secondary">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <BiRefresh className="mr-2 size-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
