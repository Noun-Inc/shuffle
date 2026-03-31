"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Star, MessageSquare, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import ImageSlideshow from "./ImageSlideshow";
import type { Signal } from "@/data/signals";

interface CardDetailProps {
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

export default function CardDetail({
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
}: CardDetailProps) {
  const [showMemo, setShowMemo] = useState(!!comment);
  const [isLandscape, setIsLandscape] = useState(true);
  const ready = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => { ready.current = true; });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth >= 768 && window.innerWidth > window.innerHeight * 0.9);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => { if (ready.current) onClose(); }}
    >
      <motion.div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex ${
          isLandscape
            ? "flex-row w-full max-w-4xl max-h-[90vh]"
            : "flex-col w-full max-w-md max-h-[90vh]"
        }`}
        style={{ height: isLandscape ? "min(85vh, 600px)" : "min(90vh, 700px)" }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content section */}
        <div className={`flex-1 flex flex-col min-h-0 ${
          isLandscape ? "w-1/2" : "order-2"
        }`}>
          {/* Fixed header */}
          <div className="shrink-0 px-5 pt-5 pb-2">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onToggleStar}
                className="p-1.5 rounded-full hover:bg-yellow-50 transition-colors"
              >
                <Star
                  size={18}
                  className={
                    isStarred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>

              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={hasPrev ? onPrev : undefined}
                  className={`p-1 rounded-full transition-colors ${hasPrev ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600" : "text-gray-200 cursor-default"}`}
                  disabled={!hasPrev}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-medium text-gray-400 min-w-[2rem] text-center text-xs">#{signal.number}</span>
                <button
                  onClick={hasNext ? onNext : undefined}
                  className={`p-1 rounded-full transition-colors ${hasNext ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600" : "text-gray-200 cursor-default"}`}
                  disabled={!hasNext}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <span className="text-3xl font-light text-gray-200">
              #{signal.number}
            </span>

            <h2 className="mt-1 text-lg font-bold text-gray-900 leading-tight">
              {signal.title}
            </h2>

            {signal.category && (
              <span className="inline-block mt-1.5 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {signal.category}
              </span>
            )}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {signal.body}
            </p>

            {signal.reference && (
              <a
                href={signal.reference}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 hover:underline"
              >
                Reference <ExternalLink size={11} />
              </a>
            )}

            {/* Memo section */}
            <div className="mt-4 border-t border-gray-100 pt-3">
              <button
                onClick={() => setShowMemo(!showMemo)}
                className={`flex items-center gap-2 text-xs transition-colors ${
                  comment
                    ? "text-blue-600 hover:text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MessageSquare size={13} fill={comment ? "currentColor" : "none"} />
                {comment ? "View memo" : "Add memo"}
              </button>
              {showMemo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-2"
                >
                  <textarea
                    value={comment}
                    onChange={(e) => onCommentChange?.(e.target.value)}
                    placeholder="Write a note about this signal..."
                    className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    rows={2}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Image section */}
        <div className={`bg-gray-100 ${
          isLandscape
            ? "w-1/2 h-full"
            : "order-1 w-full shrink-0"
        }`} style={!isLandscape ? { height: "40%" } : undefined}>
          <ImageSlideshow images={signal.images} />
        </div>
      </motion.div>
    </motion.div>
  );
}
