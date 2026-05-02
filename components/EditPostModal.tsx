"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, RefreshCw, Plus } from "lucide-react";
import { uploadImage } from "@/lib/courses";

type ImageItem = {
  id: string;
  url: string;
  uploading?: boolean;
};

type Mode = "replace" | "add";

export default function EditPostModal({
  isOpen,
  initialValue,
  initialImages = [],
  onClose,
  onSave,
  loading,
}: {
  isOpen: boolean;
  initialValue?: string;
  initialImages?: string[];
  loading: boolean;
  onClose: () => void;
  onSave: (data: { description: string; images: string[] }) => void;
}) {
  const [value, setValue] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const indexRef = useRef<number | null>(null);
  const modeRef = useRef<Mode>("replace");

  useEffect(() => {
    setValue(initialValue || "");
    setImages(
      (initialImages || []).map((url, i) => ({
        id: `${url}-${i}`,
        url,
        uploading: false,
      }))
    );
  }, [initialValue, initialImages]);

  if (!isOpen) return null;

  const openPicker = (mode: Mode, index: number | null = null) => {
    modeRef.current = mode;
    indexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mode = modeRef.current;
    const index = indexRef.current;

    try {
      if (mode === "replace" && index !== null) {
        setImages((prev) =>
          prev.map((img, i) =>
            i === index ? { ...img, uploading: true } : img
          )
        );

        const url = await uploadImage(file);

        setImages((prev) =>
          prev.map((img, i) =>
            i === index ? { ...img, url, uploading: false } : img
          )
        );
      }

      if (mode === "add") {
        const tempId = `temp-${Date.now()}`;

        setImages((prev) => [
          ...prev,
          { id: tempId, url: URL.createObjectURL(file), uploading: true },
        ]);

        const url = await uploadImage(file);

        setImages((prev) =>
          prev.map((img) =>
            img.id === tempId ? { ...img, url, uploading: false } : img
          )
        );
      }
    } catch (err) {
      console.error("UPLOAD FAILED:", err);

      setImages((prev) =>
        prev.map((img) => ({ ...img, uploading: false }))
      );
    } finally {
      indexRef.current = null;
      modeRef.current = "replace";
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      description: value,
      images: images.map((img) => img.url),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5">
      <div className="bg-white rounded-xl w-full max-w-md p-5">

        <h3 className="font-semibold mb-3">Edit Post</h3>

        {/* IMAGE STRIP */}
        <div className="overflow-x-auto mb-4">
          <div className="flex gap-3 w-max">

            {images.map((img, index) => (
              <div key={img.id} className="w-24 shrink-0" style={{width: 100, height: 200}}>

                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border">

                  <img
                    src={img.url}
                    className="w-full h-full object-cover"
                  />

                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-1 text-xs">
                  <button
                    onClick={() => openPicker("replace", index)}
                    className="text-blue-600"
                  >
                    Replace
                  </button>

                  <button
                    onClick={() => handleRemove(index)}
                    className="text-red-500 flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            ))}

            {/* ADD BUTTON */}
            <button
              onClick={() => openPicker("add")}
              className="w-24 h-24 shrink-0 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600"
              style={{width: 100, height: 100}}
            >
              <Plus size={20} />
            </button>

          </div>
        </div>

        {/* hidden input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* DESCRIPTION */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm min-h-[100px]"
          placeholder="Edit description..."
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}