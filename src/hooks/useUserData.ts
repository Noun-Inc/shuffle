"use client";

import { useState, useEffect, useCallback } from "react";

interface UserSignalData {
  starred: Set<number>;
  comments: Record<number, string>; // signalId -> comment text
}

const STORAGE_KEY = "shuffle-user-data";

function loadData(): UserSignalData {
  if (typeof window === "undefined") return { starred: new Set(), comments: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { starred: new Set(), comments: {} };
    const parsed = JSON.parse(raw);
    return {
      starred: new Set(parsed.starred || []),
      comments: parsed.comments || {},
    };
  } catch {
    return { starred: new Set(), comments: {} };
  }
}

function saveData(data: UserSignalData) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        starred: [...data.starred],
        comments: data.comments,
      })
    );
  } catch {
    // storage full or unavailable
  }
}

export function useUserData() {
  const [data, setData] = useState<UserSignalData>({
    starred: new Set(),
    comments: {},
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: UserSignalData) => {
    setData(next);
    saveData(next);
  }, []);

  const toggleStar = useCallback(
    (signalId: number) => {
      setData((prev) => {
        const next = { ...prev, starred: new Set(prev.starred) };
        if (next.starred.has(signalId)) {
          next.starred.delete(signalId);
        } else {
          next.starred.add(signalId);
        }
        saveData(next);
        return next;
      });
    },
    []
  );

  const isStarred = useCallback(
    (signalId: number) => data.starred.has(signalId),
    [data.starred]
  );

  const setComment = useCallback(
    (signalId: number, text: string) => {
      setData((prev) => {
        const next = {
          ...prev,
          comments: { ...prev.comments },
        };
        if (text.trim()) {
          next.comments[signalId] = text.trim();
        } else {
          delete next.comments[signalId];
        }
        saveData(next);
        return next;
      });
    },
    []
  );

  const getComment = useCallback(
    (signalId: number) => data.comments[signalId] || "",
    [data.comments]
  );

  const starredIds = [...data.starred];
  const commentedIds = Object.keys(data.comments).map(Number);

  return {
    loaded,
    toggleStar,
    isStarred,
    setComment,
    getComment,
    starredIds,
    commentedIds,
    starredCount: starredIds.length,
    commentedCount: commentedIds.length,
  };
}
