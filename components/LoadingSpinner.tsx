"use client";

import { CgSpinner } from "react-icons/cg";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-16 w-16",
};

export function LoadingSpinner({ size = "md", text, className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <CgSpinner className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-text-secondary">{text}</p>}
    </div>
  );
}
