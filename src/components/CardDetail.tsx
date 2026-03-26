"use client";

import { useState } from "react";
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

  return (
    <motion.div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleStar}
              className="p-1.5 rounded-full hover:bg-yellow-50 transition-colors"
            >
              <Star
                size={20}
                className={
                  isStarred
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            </button>

            {/* Navigation — always centered */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={hasPrev ? onPrev : undefined}
                className={`p-1 rounded-full transition-colors ${hasPrev ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600" : "text-gray-200 cursor-default"}`}
                disabled={!hasPrev}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-medium text-gray-400 min-w-[2.5rem] text-center">#{signal.number}</span>
              <button
                onClick={hasNext ? onNext : undefined}
                className={`p-1 rounded-full transition-colors ${hasNext ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600" : "text-gray-200 cursor-default"}`}
                disabled={!hasNext}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <span className="text-4xl md:text-5xl font-light text-gray-300">
            #{signal.number}
          </span>

          <h2 className="mt-3 text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            {signal.title}
          </h2>

          {signal.category && (
            <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {signal.category}
            </span>
          )}

          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            {signal.body}
          </p>

          {signal.reference && (
            <a
              href={signal.reference}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 text-xs text-blue-600 hover:underline"
            >
              Reference <ExternalLink size={12} />
            </a>
          )}

          {/* Memo section */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={() => setShowMemo(!showMemo)}
              className={`flex items-center gap-2 text-xs transition-colors ${
                comment
                  ? "text-blue-600 hover:text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageSquare size={14} fill={comment ? "currentColor" : "none"} />
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
                  className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  rows={3}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Right: Image slideshow */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
          <ImageSlideshow images={signal.images} />
        </div>
      </motion.div>
    </motion.div>
  );
}
