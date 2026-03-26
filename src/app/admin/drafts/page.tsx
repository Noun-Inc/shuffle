"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Trash2, Pencil, FileText } from "lucide-react";
import { useDrafts } from "@/hooks/useDrafts";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DraftsPage() {
  const { drafts, deleteDraft, loaded } = useDrafts();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (confirmDeleteId === id) {
      deleteDraft(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-reset confirm after 3s
      setTimeout(() => setConfirmDeleteId((prev) => (prev === id ? null : prev)), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to deck
          </Link>
          <h1 className="text-sm font-bold tracking-wider uppercase text-gray-900">
            Drafts
          </h1>
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            + New
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {!loaded ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-sm text-gray-400 mb-4">No drafts yet</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Start a new signal
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {drafts
                .sort((a, b) => b.lastEdited - a.lastEdited)
                .map((draft) => (
                  <motion.div
                    key={draft.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-4 p-4">
                      {/* Thumbnail */}
                      {draft.images[0]?.url ? (
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={draft.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-20 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                          <FileText size={20} className="text-gray-300" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400">
                            #{draft.number}
                          </span>
                          <span className="text-xs text-gray-300">
                            {timeAgo(draft.lastEdited)}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {draft.title || "Untitled signal"}
                        </h3>
                        {draft.category && (
                          <span className="inline-block mt-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                            {draft.category}
                          </span>
                        )}
                        {draft.body && (
                          <p className="mt-1 text-xs text-gray-400 line-clamp-1">
                            {draft.body}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          href={`/admin?draft=${draft.id}`}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} className="text-gray-400" />
                        </Link>
                        <button
                          onClick={() => handleDelete(draft.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            confirmDeleteId === draft.id
                              ? "bg-red-50 text-red-500"
                              : "hover:bg-gray-100 text-gray-400"
                          }`}
                          title={confirmDeleteId === draft.id ? "Click again to confirm" : "Delete"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Confirm delete bar */}
                    <AnimatePresence>
                      {confirmDeleteId === draft.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-2 bg-red-50 text-xs text-red-600 text-center">
                            Click delete again to confirm
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
