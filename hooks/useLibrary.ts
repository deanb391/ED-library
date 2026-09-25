"use client";

import { useState, useEffect } from "react";
import { fetchLibrary } from "@/lib/api/library";

let globalLibraryCache: Set<string> | null = null;
let globalLibraryPromise: Promise<Set<string>> | null = null;

const listeners: Set<() => void> = new Set();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function useLibrary(userId: string | undefined) {
  const [library, setLibrary] = useState<Set<string>>(globalLibraryCache || new Set());
  const [loading, setLoading] = useState<boolean>(!globalLibraryCache && !!userId);

  useEffect(() => {
    if (!userId) return;

    const handleUpdate = () => {
      if (globalLibraryCache) {
        setLibrary(globalLibraryCache);
        setLoading(false);
      }
    };

    listeners.add(handleUpdate);

    if (globalLibraryCache) {
      handleUpdate();
    } else if (!globalLibraryPromise) {
      setLoading(true);
      globalLibraryPromise = fetchLibrary(userId)
        .then((res) => {
          const newSet = new Set<string>();
          try {
            const subIds = res.wallet?.subscription ? JSON.parse(res.wallet.subscription) : [];
            const oneIds = res.wallet?.oneTime ? JSON.parse(res.wallet.oneTime) : [];
            [...subIds, ...oneIds].forEach((id) => newSet.add(id));
          } catch (err) {
            console.error("Failed to parse library IDs", err);
          }
          globalLibraryCache = newSet;
          notifyListeners();
          return newSet;
        })
        .catch((err) => {
          console.error("Failed to fetch library", err);
          globalLibraryPromise = null;
          return new Set<string>();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      globalLibraryPromise.then(handleUpdate);
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, [userId]);

  const addToLibraryCache = (courseId: string) => {
    if (globalLibraryCache) {
      globalLibraryCache.add(courseId);
      setLibrary(new Set(globalLibraryCache));
      notifyListeners();
    }
  };

  const isInLibrary = (courseId: string) => library.has(courseId);

  return { library, loading, isInLibrary, addToLibraryCache };
}
