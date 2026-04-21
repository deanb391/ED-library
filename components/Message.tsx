"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type MessageType = "success" | "error" | "info";

interface MessageProps {
  type?: MessageType;
  title?: string;
  message: string;
  duration?: number; // auto close (ms)
  onClose?: () => void;
}

const styles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    accent: "bg-green-500",
    icon: <CheckCircle size={18} />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    accent: "bg-red-500",
    icon: <XCircle size={18} />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "bg-blue-500",
    icon: <Info size={18} />,
  },
};

export default function Message({
  type = "info",
  title,
  message,
  duration = 3000,
  onClose,
}: MessageProps) {
  const style = styles[type];
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // trigger enter animation
    setVisible(true);

    // auto dismiss
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setLeaving(true);

    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 250); // match exit animation
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed top-5 right-5 z-50 w-[90%] max-w-sm
        transition-all duration-300 ease-out
        ${leaving ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
      `}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border shadow-lg
          ${style.bg} ${style.border}
        `}
      >
        {/* Accent bar */}
        <div className={`absolute left-0 top-0 h-full w-1 ${style.accent}`} />

        {/* Content */}
        <div className="p-4 flex gap-3">
          <div className={`${style.text} mt-0.5`}>
            {style.icon}
          </div>

          <div className="flex-1">
            {title && (
              <p className={`text-sm font-semibold ${style.text}`}>
                {title}
              </p>
            )}
            <p className={`text-sm mt-0.5 ${style.text}`}>
              {message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}