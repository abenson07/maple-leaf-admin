"use client";

import { useState } from "react";
import { BiCopy, BiCheck } from "react-icons/bi";
import { showToast } from "@/lib/toast";

interface CopyableTextProps {
  text: string;
  className?: string;
  showIcon?: boolean;
}

export function CopyableText({ text, className = "", showIcon = true }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        showToast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      showToast.error("Failed to copy text");
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm">{text}</span>
      {showIcon && (
        <button
          onClick={handleCopy}
          className="flex items-center justify-center rounded p-1 hover:bg-background-secondary transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <BiCheck className="size-4 text-success" />
          ) : (
            <BiCopy className="size-4 text-text-secondary hover:text-text-primary" />
          )}
        </button>
      )}
    </div>
  );
}
