"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
};

function TermsModal({ open, onClose, onSubmit, loading = false }: Props) {
  const [agreed, setAgreed] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Terms & Conditions
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto text-sm text-gray-600 space-y-4 leading-relaxed">
          <p>
            By using this platform, you agree to follow all guidelines related to
            content uploads, academic integrity, and community standards.
          </p>

          <p>
            Uploaded materials must be original or properly licensed. Any form of
            plagiarism, spam, or misleading content may result in removal or
            account restrictions.
          </p>

          <p>
            You retain ownership of your content, but grant us permission to
            display and distribute it within the platform for educational purposes.
          </p>

          <p>
            We may update these terms at any time. Continued use of the platform
            implies acceptance of any changes.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed((p) => !p)}
              className="w-4 h-4 accent-blue-600"
            />
            <span>I agree to the terms and conditions</span>
          </label>

          <button
            onClick={onSubmit}
            disabled={!agreed || loading}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.90] ${
              agreed && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            style={{marginTop: 20}}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;