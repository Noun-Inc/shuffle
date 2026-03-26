"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import CardGrid from "@/components/CardGrid";
import CardDetail from "@/components/CardDetail";
import MobileCardDetail from "@/components/MobileCardDetail";
import FilterSort from "@/components/FilterSort";
import ShuffleOverlay from "@/components/ShuffleOverlay";
import { useShuffle } from "@/hooks/useShuffle";
import { useUserData } from "@/hooks/useUserData";
import { useDrafts } from "@/hooks/useDrafts";
import { signals as initialSignals, categories } from "@/data/signals";
import type { Signal } from "@/data/signals";

export interface DealTarget {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function Home() {
  const [selectedCard, setSelectedCard] = useState<Signal | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [showCommented, setShowCommented] = useState(false);
  const [dealTargets, setDealTargets] = useState<DealTarget[]>([]);

  const { signals, isShuffling, shuffle, sortByNumber, filterByCategory } =
    useShuffle(initialSignals);

  const userData = useUserData();
  const { draftCount } = useDrafts();

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

  // Measure actual grid cell positions from the DOM, then trigger shuffle
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

  // Apply starred / commented filters
  const filteredSignals = useMemo(() => {
    let result = signals;
    if (showStarred) {
      result = result.filter((s) => userData.starredIds.includes(s.id));
    }
    if (showCommented) {
      result = result.filter((s) => userData.commentedIds.includes(s.id));
    }
    return result;
  }, [signals, showStarred, showCommented, userData.starredIds, userData.commentedIds]);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <Header
        onShuffle={handleShuffle}
        onToggleFilter={() => setFilterOpen(!filterOpen)}
        isShuffling={isShuffling}
        showStarred={showStarred}
        onToggleStarred={() => {
          setShowStarred((v) => !v);
          if (!showStarred) setShowCommented(false);
        }}
        starredCount={userData.starredCount}
        showCommented={showCommented}
        onToggleCommented={() => {
          setShowCommented((v) => !v);
          if (!showCommented) setShowStarred(false);
        }}
        commentedCount={userData.commentedCount}
        draftCount={draftCount}
      />

      <FilterSort
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSortByNumber={sortByNumber}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      {/* Empty state for filters */}
      {filteredSignals.length === 0 && (showStarred || showCommented) ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <p className="text-sm">
            {showStarred
              ? "No starred signals yet. Tap the star on any card to save it."
              : "No commented signals yet. Add a memo to any card to see it here."}
          </p>
        </div>
      ) : (
        <CardGrid
          signals={filteredSignals}
          isShuffling={isShuffling}
          onCardClick={setSelectedCard}
          starredIds={userData.starredIds}
        />
      )}

      <ShuffleOverlay
        isActive={isShuffling}
        cardImages={signals.map((s) => {
          const url = s.images[0]?.url;
          return url?.replace(/^\/images\//, "/thumbs/").replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg") || "";
        }).filter(Boolean)}
        dealTargets={dealTargets}
      />

      <AnimatePresence>
        {selectedCard &&
          (isMobile ? (
            <MobileCardDetail
              key="mobile-detail"
              signal={selectedCard}
              onClose={() => setSelectedCard(null)}
              isStarred={userData.isStarred(selectedCard.id)}
              onToggleStar={() => userData.toggleStar(selectedCard.id)}
              comment={userData.getComment(selectedCard.id)}
              onCommentChange={(text) => userData.setComment(selectedCard.id, text)}
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
              isStarred={userData.isStarred(selectedCard.id)}
              onToggleStar={() => userData.toggleStar(selectedCard.id)}
              comment={userData.getComment(selectedCard.id)}
              onCommentChange={(text) => userData.setComment(selectedCard.id, text)}
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
