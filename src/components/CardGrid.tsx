"use client";

import { AnimatePresence, motion } from "framer-motion";
import CardThumbnail from "./CardThumbnail";
import type { Signal } from "@/data/signals";

interface CardGridProps {
  signals: Signal[];
  isShuffling: boolean;
  onCardClick: (signal: Signal) => void;
  starredIds?: (string | number)[];
}

export default function CardGrid({
  signals,
  isShuffling,
  onCardClick,
  starredIds = [],
}: CardGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 md:gap-3"
        animate={isShuffling ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {signals.map((signal) => (
            <motion.div
              key={signal.id}
              layout
              data-grid-cell
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <CardThumbnail
                signal={signal}
                onClick={() => onCardClick(signal)}
                isStarred={starredIds.map(String).includes(String(signal.id))}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
