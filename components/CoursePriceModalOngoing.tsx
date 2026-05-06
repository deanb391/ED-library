"use client";

import { useState, useEffect } from "react";

interface CoursePriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { price: number; isFree: boolean }) => void;
  isSaving?: boolean;
  initialPrice?: number;
  initialFree?: boolean;
}

export default function CoursePriceModalOngoing({
  isOpen,
  onClose,
  onConfirm,
  isSaving = false,
  initialPrice = 0,
  initialFree = false,
}: CoursePriceModalProps) {
  const SUGGESTED_PRICE = initialPrice || 0;

  const [isFree, setIsFree] = useState(initialFree);
  const [price, setPrice] = useState(initialPrice || 0);

  useEffect(() => {
    setIsFree(initialFree);
    setPrice(initialPrice);
  }, [initialFree, initialPrice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPrice = isFree ? 0 : price;
    onConfirm({ price: normalizedPrice, isFree });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Set course subscription price
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Choose whether this course is free or set the price students will pay.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Free Toggle */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Free course
                </p>
                <p className="text-xs text-gray-500">
                  Students can access this course at no cost.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFree((prev) => !prev)}
                className={`px-4 py-2 rounded-full font-medium transition ${isFree
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {isFree ? "Enabled" : "Off"}
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800" style={{ fontSize: 10, color: "#4A4342" }}>
              Suggested subscription price is based on demand. You can adjust the price
              as you see fit.
            </div>

            {/* Price Control */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subscription Price (NGN)
              </label>

              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[200px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium" style={{ marginRight: 10 }}>₦</span>
                  <input
                    type="number"
                    disabled={isFree}
                    value={isFree ? 0 : price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-gray-900 font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                    style={{ paddingLeft: 30 }}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* <p className="text-xs text-gray-500 text-center">
                Suggested: ₦ {SUGGESTED_PRICE}
              </p> */}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Create course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}