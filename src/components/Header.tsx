"use client";

import Link from "next/link";
import { Shuffle, SlidersHorizontal, Star, MessageSquare, Plus } from "lucide-react";

interface HeaderProps {
  onShuffle: () => void;
  onToggleFilter: () => void;
  isShuffling: boolean;
  showStarred?: boolean;
  onToggleStarred?: () => void;
  starredCount?: number;
  showCommented?: boolean;
  onToggleCommented?: () => void;
  commentedCount?: number;
  sessionTitle?: string;
  allowAddSignals?: boolean;
  sessionId?: string;
}

export default function Header({
  onShuffle,
  onToggleFilter,
  isShuffling,
  showStarred,
  onToggleStarred,
  starredCount = 0,
  showCommented,
  onToggleCommented,
  commentedCount = 0,
  sessionTitle,
  allowAddSignals,
  sessionId,
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-widest text-gray-900">SHUFFLE</h1>
          {sessionTitle && (
            <span className="text-[10px] text-gray-400 tracking-wide -mt-0.5">{sessionTitle}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Starred filter */}
          {onToggleStarred && (
            <button
              onClick={onToggleStarred}
              className={`p-2 rounded-full transition-colors relative ${
                showStarred
                  ? "bg-amber-50 text-amber-500"
                  : "hover:bg-gray-100 text-gray-400"
              }`}
              aria-label="Show starred"
            >
              <Star size={18} fill={showStarred ? "currentColor" : "none"} />
              {starredCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {starredCount}
                </span>
              )}
            </button>
          )}

          {/* Comments filter */}
          {onToggleCommented && (
            <button
              onClick={onToggleCommented}
              className={`p-2 rounded-full transition-colors relative ${
                showCommented
                  ? "bg-blue-50 text-blue-500"
                  : "hover:bg-gray-100 text-gray-400"
              }`}
              aria-label="Show commented"
            >
              <MessageSquare size={18} fill={showCommented ? "currentColor" : "none"} />
              {commentedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {commentedCount}
                </span>
              )}
            </button>
          )}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={onToggleFilter}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Filter & Sort"
          >
            <SlidersHorizontal size={18} className="text-gray-600" />
          </button>
          <button
            onClick={onShuffle}
            disabled={isShuffling}
            className="p-2 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
            aria-label="Shuffle cards"
          >
            <Shuffle
              size={18}
              className={`text-blue-600 ${isShuffling ? "animate-spin" : ""}`}
            />
          </button>

          {allowAddSignals && sessionId && (
            <>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <Link
                href={`/session/${sessionId}/add`}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Add signal"
              >
                <Plus size={18} className="text-gray-600" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
