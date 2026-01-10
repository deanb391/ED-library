"use client";

import React from "react";
import { X, Trash2 } from "lucide-react";

interface ConfirmFileDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName?: string;
}

export default function ConfirmFileDelete({
  isOpen,
  onClose,
  onConfirm,
  fileName = "this file",
}: ConfirmFileDeleteProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#15171B] text-white rounded-xl shadow-2xl w-80 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Delete File</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-300">
          Are you sure you want to delete <span className="font-semibold">{fileName}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
