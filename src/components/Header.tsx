"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Shuffle, SlidersHorizontal, Star, MessageSquare, Plus, FileText, FilePlus2 } from "lucide-react";

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
  draftCount?: number;
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
  draftCount = 0,
}: HeaderProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!addMenuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [addMenuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!addMenuOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddMenuOpen(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [addMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-widest text-gray-900">
          SHUFFLE
        </h1>
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

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Add menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setAddMenuOpen((v) => !v)}
              className={`p-2 rounded-full transition-colors relative ${
                addMenuOpen ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
              aria-label="Add signal"
            >
              <Plus size={18} className="text-gray-600" />
              {draftCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-gray-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {draftCount}
                </span>
              )}
            </button>

            {addMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <Link
                  href="/admin"
                  onClick={() => setAddMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FilePlus2 size={16} className="text-gray-400" />
                  New Signal
                </Link>
                <Link
                  href="/admin/drafts"
                  onClick={() => setAddMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50"
                >
                  <FileText size={16} className="text-gray-400" />
                  <span className="flex-1">Drafts</span>
                  {draftCount > 0 && (
                    <span className="min-w-[20px] h-5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full flex items-center justify-center px-1.5">
                      {draftCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
