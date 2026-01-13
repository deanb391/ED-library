export default function PostActionModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-lg p-4 w-48 space-y-2"
      >
        <button
          onClick={onEdit}
          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 text-sm text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
