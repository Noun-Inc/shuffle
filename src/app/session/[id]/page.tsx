"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import CardGrid from "@/components/CardGrid";
import CardDetail from "@/components/CardDetail";
import MobileCardDetail from "@/components/MobileCardDetail";
import FilterSort from "@/components/FilterSort";
import ShuffleOverlay from "@/components/ShuffleOverlay";
import { useShuffle } from "@/hooks/useShuffle";
import { useSessionData } from "@/hooks/useSessionData";
import { getStoredSession, clearSession } from "@/hooks/useSession";
import type { ParticipantSession } from "@/hooks/useSession";
import type { Signal } from "@/data/signals";

export interface DealTarget {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();

  const [session, setSession] = useState<ParticipantSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const stored = getStoredSession();
    if (!stored || stored.sessionId !== sessionId) {
      router.replace(`/?session=${sessionId}`);
      return;
    }
    setSession(stored);
    setSessionChecked(true);
  }, [sessionId, router]);

  const [selectedCard, setSelectedCard] = useState<Signal | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [showCommented, setShowCommented] = useState(false);
  const [dealTargets, setDealTargets] = useState<DealTarget[]>([]);
  const [newCardId, setNewCardId] = useState<string | null>(null);

  useEffect(() => {
    const pendingNewId = sessionStorage.getItem("newSignalId");
    if (pendingNewId) {
      sessionStorage.removeItem("newSignalId");
      setNewCardId(pendingNewId);
    }
  }, []);

  const sessionData = useSessionData(sessionChecked ? session : null);

  const { signals, isShuffling, shuffle, sortByNumber, filterByCategory } =
    useShuffle(sessionData.signals);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    filterByCategory(category);
  };

  const handleShuffle = useCallback(() => {
    const cells = document.querySelectorAll("[data-grid-cell]");
    const targets: DealTarget[] = [];
    cells.forEach((cell) => {
      const rect = cell.getBoundingClientRect();
      targets.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
      });
    });
    setDealTargets(targets);
    shuffle();
  }, [shuffle]);

  const categories = useMemo(
    () =>
      [...new Set(sessionData.signals.map((s) => s.category).filter(Boolean) as string[])].sort(),
    [sessionData.signals]
  );

  const filteredSignals = useMemo(() => {
    let result = signals;
    if (showStarred) {
      result = result.filter((s) => sessionData.myStarredIds.includes(String(s.id)));
    }
    if (showCommented) {
      result = result.filter((s) => sessionData.myCommentedIds.includes(String(s.id)));
    }
    return result;
  }, [signals, showStarred, showCommented, sessionData.myStarredIds, sessionData.myCommentedIds]);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (sessionData.error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{sessionData.error}</p>
          <button
            onClick={() => {
              clearSession();
              router.push("/");
            }}
            className="text-sm text-blue-600 underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Header
        sessionTitle={session?.sessionTitle}
        onShuffle={handleShuffle}
        onToggleFilter={() => setFilterOpen(!filterOpen)}
        isShuffling={isShuffling}
        showStarred={showStarred}
        onToggleStarred={() => {
          setShowStarred((v) => !v);
          if (!showStarred) setShowCommented(false);
        }}
        starredCount={sessionData.myStarredIds.length}
        showCommented={showCommented}
        onToggleCommented={() => {
          setShowCommented((v) => !v);
          if (!showCommented) setShowStarred(false);
        }}
        commentedCount={sessionData.myCommentedIds.length}
        allowAddSignals={session?.allowAddSignals}
        sessionId={sessionId}
      />

      <FilterSort
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSortByNumber={sortByNumber}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      {!sessionData.loaded ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : filteredSignals.length === 0 && (showStarred || showCommented) ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <p className="text-sm">
            {showStarred ? "No starred signals yet." : "No commented signals yet."}
          </p>
        </div>
      ) : (
        <CardGrid
          signals={filteredSignals}
          isShuffling={isShuffling}
          onCardClick={setSelectedCard}
          starredIds={sessionData.myStarredIds}
          newCardId={newCardId}
        />
      )}

      <ShuffleOverlay
        isActive={isShuffling}
        cardImages={signals
          .map((s) => {
            const img = s.images[0];
            if (!img) return "";
            if (img.thumbUrl) return img.thumbUrl;
            const url = img.url;
            if (url.includes("signal-images/full/"))
              return url.replace("/full/", "/thumbs/").replace(/\.(png|webp)$/i, ".jpg");
            return url.replace(/^\/images\//, "/thumbs/").replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg");
          })
          .filter(Boolean)}
        dealTargets={dealTargets}
      />

      <AnimatePresence>
        {selectedCard &&
          (isMobile ? (
            <MobileCardDetail
              key="mobile-detail"
              signal={selectedCard}
              onClose={() => setSelectedCard(null)}
              isStarred={sessionData.isStarred(String(selectedCard.id))}
              onToggleStar={() => sessionData.toggleStar(String(selectedCard.id))}
              totalStars={sessionData.getStarCount(String(selectedCard.id))}
              comment={sessionData.getMyComment(String(selectedCard.id))}
              onCommentChange={(text) =>
                sessionData.setComment(String(selectedCard.id), text)
              }
              allComments={sessionData.getOtherComments(String(selectedCard.id))}
              onDelete={session?.allowAddSignals ? () => {
                sessionData.deleteSignal(String(selectedCard.id));
                setSelectedCard(null);
              } : undefined}
              hasNext={filteredSignals.indexOf(selectedCard) < filteredSignals.length - 1}
              hasPrev={filteredSignals.indexOf(selectedCard) > 0}
              onNext={() => {
                const idx = filteredSignals.indexOf(selectedCard);
                if (idx < filteredSignals.length - 1) setSelectedCard(filteredSignals[idx + 1]);
              }}
              onPrev={() => {
                const idx = filteredSignals.indexOf(selectedCard);
                if (idx > 0) setSelectedCard(filteredSignals[idx - 1]);
              }}
            />
          ) : (
            <CardDetail
              key="desktop-detail"
              signal={selectedCard}
              onClose={() => setSelectedCard(null)}
              isStarred={sessionData.isStarred(String(selectedCard.id))}
              onToggleStar={() => sessionData.toggleStar(String(selectedCard.id))}
              totalStars={sessionData.getStarCount(String(selectedCard.id))}
              comment={sessionData.getMyComment(String(selectedCard.id))}
              onCommentChange={(text) =>
                sessionData.setComment(String(selectedCard.id), text)
              }
              allComments={sessionData.getOtherComments(String(selectedCard.id))}
              onDelete={session?.allowAddSignals ? () => {
                sessionData.deleteSignal(String(selectedCard.id));
                setSelectedCard(null);
              } : undefined}
              hasNext={filteredSignals.indexOf(selectedCard) < filteredSignals.length - 1}
              hasPrev={filteredSignals.indexOf(selectedCard) > 0}
              onNext={() => {
                const idx = filteredSignals.indexOf(selectedCard);
                if (idx < filteredSignals.length - 1) setSelectedCard(filteredSignals[idx + 1]);
              }}
              onPrev={() => {
                const idx = filteredSignals.indexOf(selectedCard);
                if (idx > 0) setSelectedCard(filteredSignals[idx - 1]);
              }}
            />
          ))}
      </AnimatePresence>
    </main>
  );
}
