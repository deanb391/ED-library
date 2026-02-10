"use client";

import React from "react";
import { X, Trash2 } from "lucide-react";

interface NoUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function NoUserModal({
  isOpen,
  onClose,
  onConfirm,
}: NoUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#15171B] text-white rounded-xl shadow-2xl w-80 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Oops!!!</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-300">
          To view images, signup!!
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all
          active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-600 flex items-center gap-2  transition-all
          active:scale-[0.98]"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
