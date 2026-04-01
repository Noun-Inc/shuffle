"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchDrafts, deleteSignal, publishSignal } from "@/lib/queries";
import type { Signal } from "@/data/signals";

export type DraftSignal = Signal & {
  status: "draft" | "published";
  lastEdited?: number;
};

export function useDrafts(deckSlug: string = "2026-signals") {
  const [drafts, setDrafts] = useState<DraftSignal[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadDrafts = useCallback(async () => {
    try {
      const data = await fetchDrafts(deckSlug);
      setDrafts(
        data.map((s) => ({
          ...s,
          status: "draft" as const,
          lastEdited: Date.now(),
        }))
      );
    } catch {
      // Supabase unavailable
    }
    setLoaded(true);
  }, [deckSlug]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const deleteDraft = useCallback(
    async (id: string | number) => {
      try {
        await deleteSignal(String(id));
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        console.error("Delete draft error:", err);
      }
    },
    []
  );

  const publishDraftFn = useCallback(
    async (id: string | number) => {
      try {
        await publishSignal(String(id));
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        console.error("Publish draft error:", err);
      }
    },
    []
  );

  const getDraft = useCallback(
    (id: string | number) => drafts.find((d) => String(d.id) === String(id)) || null,
    [drafts]
  );

  // Keep a saveDraft stub for backward compat with admin page localStorage fallback
  const saveDraft = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_data: Record<string, unknown>) => {
      // No-op — admin page now saves directly via upsertSignal
    },
    []
  );

  return {
    loaded,
    drafts,
    saveDraft,
    deleteDraft,
    publishDraft: publishDraftFn,
    getDraft,
    draftCount: drafts.length,
    reload: loadDrafts,
  };
}
