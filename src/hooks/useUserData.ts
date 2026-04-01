"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchStars,
  toggleStar as dbToggleStar,
  fetchComments,
  upsertComment as dbUpsertComment,
} from "@/lib/queries";

type SignalId = string | number;

interface UserSignalData {
  starred: Set<string>;
  comments: Record<string, string>;
}

const STORAGE_KEY = "shuffle-user-data";

function loadData(): UserSignalData {
  if (typeof window === "undefined") return { starred: new Set(), comments: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { starred: new Set(), comments: {} };
    const parsed = JSON.parse(raw);
    return {
      starred: new Set((parsed.starred || []).map(String)),
      comments: Object.fromEntries(
        Object.entries(parsed.comments || {}).map(([k, v]) => [String(k), v])
      ) as Record<string, string>,
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

  // Load from localStorage immediately, then sync from Supabase
  useEffect(() => {
    const local = loadData();
    setData(local);
    setLoaded(true);

    // Sync from Supabase in background
    Promise.all([fetchStars(), fetchComments()])
      .then(([dbStarred, dbComments]) => {
        setData((prev) => {
          // Merge: Supabase data takes priority, but keep local-only entries
          const mergedStarred = new Set([...prev.starred, ...dbStarred]);
          const mergedComments = { ...prev.comments, ...dbComments };
          const merged = { starred: mergedStarred, comments: mergedComments };
          saveData(merged);
          return merged;
        });
      })
      .catch(() => {
        // Supabase unavailable — continue with localStorage
      });
  }, []);

  const toggleStar = useCallback((signalId: SignalId) => {
    const id = String(signalId);
    setData((prev) => {
      const next = { ...prev, starred: new Set(prev.starred) };
      if (next.starred.has(id)) {
        next.starred.delete(id);
      } else {
        next.starred.add(id);
      }
      saveData(next);
      return next;
    });
    // Sync to Supabase in background
    dbToggleStar(String(signalId)).catch(() => {});
  }, []);

  const isStarred = useCallback(
    (signalId: SignalId) => data.starred.has(String(signalId)),
    [data.starred]
  );

  const setComment = useCallback((signalId: SignalId, text: string) => {
    const id = String(signalId);
    setData((prev) => {
      const next = { ...prev, comments: { ...prev.comments } };
      if (text.trim()) {
        next.comments[id] = text.trim();
      } else {
        delete next.comments[id];
      }
      saveData(next);
      return next;
    });
    // Sync to Supabase in background
    dbUpsertComment(String(signalId), text).catch(() => {});
  }, []);

  const getComment = useCallback(
    (signalId: SignalId) => data.comments[String(signalId)] || "",
    [data.comments]
  );

  const starredIds = [...data.starred];
  const commentedIds = Object.keys(data.comments);

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
