"use client";

import { useState, useEffect, useCallback } from "react";
import type { SignalImage } from "@/data/signals";

export interface DraftSignal {
  id: number;
  number: number;
  title: string;
  body: string;
  images: SignalImage[];
  category?: string;
  tags?: string[];
  year: number;
  reference?: string;
  status: "draft" | "published";
  lastEdited: number; // timestamp
}

const STORAGE_KEY = "shuffle-drafts";

function loadDrafts(): DraftSignal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DraftSignal[];
  } catch {
    return [];
  }
}

function saveDraftsToStorage(drafts: DraftSignal[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // storage full or unavailable
  }
}

export function useDrafts() {
  const [drafts, setDrafts] = useState<DraftSignal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDrafts(loadDrafts());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: DraftSignal[]) => {
    setDrafts(next);
    saveDraftsToStorage(next);
  }, []);

  const saveDraft = useCallback(
    (draft: Omit<DraftSignal, "status" | "lastEdited"> & { id?: number }) => {
      setDrafts((prev) => {
        const existing = prev.find((d) => d.id === draft.id);
        let next: DraftSignal[];
        if (existing) {
          // Update existing draft
          next = prev.map((d) =>
            d.id === draft.id
              ? { ...d, ...draft, status: "draft" as const, lastEdited: Date.now() }
              : d
          );
        } else {
          // New draft
          const newDraft: DraftSignal = {
            ...draft,
            id: draft.id || Date.now(),
            status: "draft",
            lastEdited: Date.now(),
          };
          next = [...prev, newDraft];
        }
        saveDraftsToStorage(next);
        return next;
      });
    },
    []
  );

  const updateDraft = useCallback(
    (id: number, updates: Partial<DraftSignal>) => {
      setDrafts((prev) => {
        const next = prev.map((d) =>
          d.id === id ? { ...d, ...updates, lastEdited: Date.now() } : d
        );
        saveDraftsToStorage(next);
        return next;
      });
    },
    []
  );

  const deleteDraft = useCallback((id: number) => {
    setDrafts((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDraftsToStorage(next);
      return next;
    });
  }, []);

  const publishDraft = useCallback((id: number) => {
    setDrafts((prev) => {
      const next = prev.map((d) =>
        d.id === id ? { ...d, status: "published" as const, lastEdited: Date.now() } : d
      );
      saveDraftsToStorage(next);
      return next;
    });
  }, []);

  const getDraft = useCallback(
    (id: number) => drafts.find((d) => d.id === id) || null,
    [drafts]
  );

  const draftOnly = drafts.filter((d) => d.status === "draft");

  return {
    loaded,
    drafts: draftOnly,
    allDrafts: drafts,
    saveDraft,
    updateDraft,
    deleteDraft,
    publishDraft,
    getDraft,
    draftCount: draftOnly.length,
  };
}
