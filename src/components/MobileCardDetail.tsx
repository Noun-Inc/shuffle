"use client";

import { motion } from "framer-motion";
import { X, Star, Pencil } from "lucide-react";
import ImageSlideshow from "./ImageSlideshow";
import type { Signal } from "@/data/signals";

interface MobileCardDetailProps {
  signal: Signal;
  onClose: () => void;
  isStarred?: boolean;
  onToggleStar?: () => void;
  comment?: string;
  onCommentChange?: (text: string) => void;
}

export default function MobileCardDetail({
  signal,
  onClose,
  isStarred = false,
  onToggleStar,
  comment = "",
  onCommentChange,
}: MobileCardDetailProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-white flex flex-col"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={onToggleStar}
          className="p-1.5"
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
        <button onClick={onClose} className="p-1.5">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Image */}
      <div className="h-[45vh] bg-gray-100">
        <ImageSlideshow images={signal.images} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <span className="text-3xl font-light text-gray-300">
          #{signal.number}
        </span>
        <h2 className="mt-2 text-xl font-bold text-gray-900 leading-tight">
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
  );
}
