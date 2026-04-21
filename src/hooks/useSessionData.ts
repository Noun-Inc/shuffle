"use client";

import { useState, useEffect, useCallback } from "react";
import type { Signal, SignalComment } from "@/data/signals";
import type { ParticipantSession } from "./useSession";

export interface SessionData {
  signals: Signal[];
  starsBySignal: Record<string, { count: number; myStarred: boolean }>;
  commentsBySignal: Record<string, SignalComment[]>;
  loaded: boolean;
  error: string | null;
}

export function useSessionData(session: ParticipantSession | null) {
  const [data, setData] = useState<SessionData>({
    signals: [],
    starsBySignal: {},
    commentsBySignal: {},
    loaded: false,
    error: null,
  });

  const loadData = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(
        `/api/session/${session.sessionId}/data?participantId=${session.participantId}`
      );
      if (!res.ok) {
        const json = await res.json();
        setData((d) => ({ ...d, loaded: true, error: json.error || "Failed to load" }));
        return;
      }
      const json = await res.json();
      setData({
        signals: json.signals,
        starsBySignal: json.starsBySignal,
        commentsBySignal: json.commentsBySignal,
        loaded: true,
        error: null,
      });
    } catch {
      setData((d) => ({ ...d, loaded: true, error: "Connection error" }));
    }
  }, [session?.sessionId, session?.participantId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleStar = useCallback(
    async (signalId: string) => {
      if (!session) return;
      // Optimistic update
      setData((prev) => {
        const current = prev.starsBySignal[signalId] || { count: 0, myStarred: false };
        const myStarred = !current.myStarred;
        return {
          ...prev,
          starsBySignal: {
            ...prev.starsBySignal,
            [signalId]: { count: current.count + (myStarred ? 1 : -1), myStarred },
          },
        };
      });
      try {
        await fetch("/api/stars/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId: session.participantId, signalId }),
        });
      } catch {
        await loadData();
      }
    },
    [session, loadData]
  );

  const setComment = useCallback(
    async (signalId: string, comment: string) => {
      if (!session) return;
      // Optimistic update
      setData((prev) => {
        const all = prev.commentsBySignal[signalId] || [];
        const withoutMine = all.filter((c) => c.participantId !== session.participantId);
        const updated = comment.trim()
          ? [
              ...withoutMine,
              {
                participantId: session.participantId,
                displayName: session.displayName,
                comment: comment.trim(),
                updatedAt: new Date().toISOString(),
              },
            ]
          : withoutMine;
        return {
          ...prev,
          commentsBySignal: { ...prev.commentsBySignal, [signalId]: updated },
        };
      });
      try {
        await fetch("/api/comments/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId: session.participantId, signalId, comment }),
        });
      } catch {
        await loadData();
      }
    },
    [session, loadData]
  );

  const deleteSignal = useCallback(
    async (signalId: string) => {
      if (!session) return;
      const res = await fetch(
        `/api/signals/${signalId}?participantId=${session.participantId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          signals: prev.signals.filter((s) => String(s.id) !== signalId),
        }));
      }
    },
    [session]
  );

  const getMyComment = useCallback(
    (signalId: string): string => {
      if (!session) return "";
      return (
        data.commentsBySignal[signalId]?.find(
          (c) => c.participantId === session.participantId
        )?.comment || ""
      );
    },
    [data.commentsBySignal, session]
  );

  const isStarred = useCallback(
    (signalId: string): boolean => data.starsBySignal[signalId]?.myStarred || false,
    [data.starsBySignal]
  );

  const getStarCount = useCallback(
    (signalId: string): number => data.starsBySignal[signalId]?.count || 0,
    [data.starsBySignal]
  );

  // Other participants' comments (excludes current user — shown separately in textarea)
  const getOtherComments = useCallback(
    (signalId: string): SignalComment[] =>
      (data.commentsBySignal[signalId] || []).filter(
        (c) => c.participantId !== session?.participantId
      ),
    [data.commentsBySignal, session?.participantId]
  );

  const myStarredIds = Object.entries(data.starsBySignal)
    .filter(([, v]) => v.myStarred)
    .map(([k]) => k);

  const myCommentedIds = Object.entries(data.commentsBySignal)
    .filter(([, comments]) =>
      comments.some((c) => c.participantId === session?.participantId)
    )
    .map(([k]) => k);

  return {
    ...data,
    toggleStar,
    setComment,
    deleteSignal,
    getMyComment,
    isStarred,
    getStarCount,
    getOtherComments,
    myStarredIds,
    myCommentedIds,
    reload: loadData,
  };
}
