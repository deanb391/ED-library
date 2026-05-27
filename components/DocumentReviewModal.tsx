import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (complaint: string) => Promise<void>;
}

export default function DocumentReviewModal({ isOpen, onClose, onSubmit }: DocumentReviewModalProps) {
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      setError('Please provide a reason for the review request.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(complaint);
      setComplaint('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-lg">Request Human Review</h3>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            If you believe your document was incorrectly rejected by our automated system, please tell us more about the file so a human moderator can review it.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tell us more about the file</label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              rows={4}
              placeholder="e.g. This is a study guide I created based on the lecture notes, it does not contain copyrighted material."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              disabled={loading}
            ></textarea>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !complaint.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={18} /> Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
