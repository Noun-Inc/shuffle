"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FilterSortProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onSortByNumber: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSort({
  categories,
  activeCategory,
  onCategoryChange,
  onSortByNumber,
  isOpen,
  onClose,
}: FilterSortProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden bg-white border-b border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filter by category
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onCategoryChange(null);
                }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  !activeCategory
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    onCategoryChange(activeCategory === cat ? null : cat)
                  }
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
              <button
                onClick={onSortByNumber}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Sort by #
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
