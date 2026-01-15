import { useEffect, useState } from "react";

export default function EditPostModal({
  isOpen,
  initialValue,
  onClose,
  onSave,
  loading,
}: {
  isOpen: boolean;
  initialValue?: string;
  loading: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue || "");

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5">
      <div className="bg-white rounded-xl w-full max-w-md p-5">
        <h3 className="font-semibold mb-3">Edit Description</h3>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm min-h-[120px]"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={() => onSave(value)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
