import React from "react";
import toast from "react-hot-toast";

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message, { icon: "ℹ️" }),
  loading: (message: string) => toast.loading(message),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => toast.promise(promise, messages),
  successWithUndo: (message: string, onUndo: () => void, duration: number = 3000) => {
    const toastId = toast.success(
      (t) =>
        React.createElement(
          "div",
          { className: "flex items-center gap-3" },
          React.createElement("span", null, message),
          React.createElement(
            "button",
            {
              onClick: () => {
                onUndo();
                toast.dismiss(t.id);
              },
              className: "text-blue-600 hover:text-blue-800 underline font-medium",
            },
            "Undo"
          )
        ),
      { duration }
    );
    return toastId;
  },
};

export { toast };
