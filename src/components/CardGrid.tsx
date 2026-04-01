"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import CardThumbnail from "./CardThumbnail";
import type { Signal } from "@/data/signals";

interface CardGridProps {
  signals: Signal[];
  isShuffling: boolean;
  onCardClick: (signal: Signal) => void;
  starredIds?: (string | number)[];
  newCardId?: string | null;
}

export default function CardGrid({
  signals,
  isShuffling,
  onCardClick,
  starredIds = [],
  newCardId = null,
}: CardGridProps) {
  const newCardRef = useRef<HTMLDivElement>(null);

  // Scroll to new card before the flip animation plays
  useEffect(() => {
    if (newCardId && newCardRef.current) {
      newCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [newCardId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 md:gap-3"
        animate={isShuffling ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {signals.map((signal) => {
          const isNew = newCardId && String(signal.id) === String(newCardId);
          return (
            <motion.div
              key={signal.id}
              ref={isNew ? newCardRef : undefined}
              layout
              data-grid-cell
              initial={
                isNew
                  ? { opacity: 0, rotateY: 90, scale: 0.85 }
                  : { opacity: 0, scale: 0.8 }
              }
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              transition={
                isNew
                  ? {
                      type: "spring",
                      stiffness: 70,
                      damping: 16,
                      delay: 0.25,
                    }
                  : { type: "spring", stiffness: 300, damping: 25 }
              }
              style={isNew ? { transformPerspective: 700 } : undefined}
              className="relative"
            >
              <CardThumbnail
                signal={signal}
                onClick={() => onCardClick(signal)}
                isStarred={starredIds.map(String).includes(String(signal.id))}
              />
              {isNew && (
                <motion.div
                  className="absolute inset-0 rounded-lg ring-2 ring-blue-400 pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 1.2, duration: 1.2 }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
