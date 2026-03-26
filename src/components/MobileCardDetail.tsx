"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X, Star, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import ImageSlideshow from "./ImageSlideshow";
import type { Signal } from "@/data/signals";

interface MobileCardDetailProps {
  signal: Signal;
  onClose: () => void;
  isStarred?: boolean;
  onToggleStar?: () => void;
  comment?: string;
  onCommentChange?: (text: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function MobileCardDetail({
  signal,
  onClose,
  isStarred = false,
  onToggleStar,
  comment = "",
  onCommentChange,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: MobileCardDetailProps) {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 50;
  const SWIPE_VELOCITY = 300;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    const { offset, velocity } = info;

    // Swipe left → next card
    if (
      (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) &&
      hasNext &&
      onNext
    ) {
      setSwipeDirection("left");
      onNext();
      return;
    }

    // Swipe right → previous card
    if (
      (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) &&
      hasPrev &&
      onPrev
    ) {
      setSwipeDirection("right");
      onPrev();
      return;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={signal.id}
          ref={containerRef}
          className="w-full h-[calc(100dvh-24px)] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{
            x: swipeDirection === "left" ? "100%" : swipeDirection === "right" ? "-100%" : 0,
            opacity: 0.5,
          }}
          animate={{ x: 0, opacity: 1 }}
          exit={{
            x: swipeDirection === "left" ? "-40%" : swipeDirection === "right" ? "40%" : 0,
            opacity: 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ touchAction: "pan-y" }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button onClick={onToggleStar} className="p-1.5">
              <Star
                size={20}
                className={
                  isStarred
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            </button>

            {/* Card position indicators — always centered */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={hasPrev ? onPrev : undefined}
                className={`p-1 -m-1 transition-colors ${hasPrev ? "text-gray-400 active:text-gray-600" : "text-gray-200 cursor-default"}`}
                disabled={!hasPrev}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium text-gray-500 min-w-[2.5rem] text-center">#{signal.number}</span>
              <button
                onClick={hasNext ? onNext : undefined}
                className={`p-1 -m-1 transition-colors ${hasNext ? "text-gray-400 active:text-gray-600" : "text-gray-200 cursor-default"}`}
                disabled={!hasNext}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button onClick={onClose} className="p-1.5">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Image — fixed proportion of card */}
          <div className="shrink-0 bg-gray-100" style={{ height: "35%" }}>
            <ImageSlideshow images={signal.images} />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <span className="text-sm font-semibold text-gray-300 tracking-wide">
              #{signal.number}
            </span>
            <h2 className="mt-1 text-lg font-bold text-gray-900 leading-tight">
              {signal.title}
            </h2>
            {signal.category && (
              <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {signal.category}
              </span>
            )}
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {signal.body}
            </p>
          </div>

          {/* Swipe hint */}
          {isDragging && (
            <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none">
              {hasPrev && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="text-gray-400"
                >
                  <ChevronLeft size={24} />
                </motion.div>
              )}
            </div>
          )}
          {isDragging && (
            <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center pointer-events-none">
              {hasNext && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="text-gray-400"
                >
                  <ChevronRight size={24} />
                </motion.div>
              )}
            </div>
          )}

          {/* Bottom bar — comment input */}
          <div className="border-t border-gray-100 p-3 flex items-center gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => onCommentChange?.(e.target.value)}
              placeholder="コメント"
              className="flex-1 text-sm bg-gray-50 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Pencil size={16} className="text-gray-500" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
