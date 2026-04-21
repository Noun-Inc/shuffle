"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageCredit from "./ImageCredit";
import type { SignalImage } from "@/data/signals";

interface ImageSlideshowProps {
  images: SignalImage[];
}

export default function ImageSlideshow({ images }: ImageSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const timer = setInterval(advance, 4000);
    return () => clearInterval(timer);
  }, [images.length, paused, advance]);

  if (images.length === 0) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-300 select-none">No image</span>
      </div>
    );
  }

  const img = images[current];

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background: zoomed + blurred fill */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-125"
            style={{ filter: "blur(40px)", opacity: 0.6 }}
          />

          {/* Foreground: proportionally scaled with 12px margin */}
          <div className="relative w-full h-full flex items-center justify-center p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={img.url}
              alt={img.alt || ""}
              className="max-w-full max-h-full w-full object-contain rounded"
              crossOrigin={img.url.startsWith("http") ? "anonymous" : undefined}
            />
          </div>

          <ImageCredit
            source={img.source}
            sourceLabel={img.sourceLabel}
            imageRef={imgRef}
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
