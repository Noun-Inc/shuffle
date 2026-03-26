"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { thumbUrl } from "@/lib/thumbUrl";
import type { Signal } from "@/data/signals";

interface CardThumbnailProps {
  signal: Signal;
  onClick: () => void;
  isStarred?: boolean;
}

export default function CardThumbnail({ signal, onClick, isStarred }: CardThumbnailProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      layoutId={`card-${signal.id}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer group"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Thumbnail card */}
      <div className="aspect-[5/7] rounded-lg overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbUrl(signal.images[0]?.url)}
          alt={signal.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        {/* Number badge */}
        <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 px-1.5 py-0.5 rounded z-10">
          #{signal.number}
        </div>
        {/* Star indicator */}
        {isStarred && (
          <div className="absolute top-1.5 right-1.5 z-10">
            <Star size={12} className="text-amber-400 fill-amber-400 drop-shadow" />
          </div>
        )}

        {/* Hover headline overlay */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          initial={false}
          animate={hovered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Dark gradient fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
          {/* Title text */}
          <motion.div
            className="relative px-2 pb-2 pt-6"
            initial={false}
            animate={hovered ? { y: 0 } : { y: 6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <p className="text-lg sm:text-xl font-semibold text-white leading-tight line-clamp-4 drop-shadow-sm">
              {signal.title}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
