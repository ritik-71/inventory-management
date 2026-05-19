"use client";

import { useEffect } from "react";
import "../styles/toast.css";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`} style={{ pointerEvents: 'auto' }}>
      <span style={{ fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} className="toast-close">
        &times;
      </button>
    </div>
  );
}
