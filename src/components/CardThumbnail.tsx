"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { thumbUrl } from "@/lib/thumbUrl";
import { detectFocalPoint } from "@/lib/focalPoint";
import type { Signal } from "@/data/signals";

interface CardThumbnailProps {
  signal: Signal;
  onClick: () => void;
  isStarred?: boolean;
}

// Coarse, newspaper-like grain
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.4 0.7 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;

/** Sample average brightness of a region in an image (0=black, 255=white) */
function sampleBrightness(
  img: HTMLImageElement,
  xFrac: number,
  yFrac: number,
  sizeFrac: number
): number {
  try {
    const canvas = document.createElement("canvas");
    const size = 16;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 128;

    const sx = img.naturalWidth * xFrac;
    const sy = img.naturalHeight * yFrac;
    const sw = img.naturalWidth * sizeFrac;
    const sh = img.naturalHeight * sizeFrac;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    let total = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Luminance: 0.299R + 0.587G + 0.114B
      total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      count++;
    }
    return count > 0 ? total / count : 128;
  } catch {
    return 128;
  }
}

export default function CardThumbnail({ signal, onClick, isStarred }: CardThumbnailProps) {
  const [hovered, setHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [hashColor, setHashColor] = useState("#ffffff");
  const [numColor, setNumColor] = useState("#ffffff");
  const [focalPoint, setFocalPoint] = useState("center center");
  const [useContain, setUseContain] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const check = () => {
      const noHover = window.matchMedia("(hover: none)").matches;
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const smallScreen = window.innerWidth < 768;
      setIsTouch(noHover || touch || smallScreen);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const analyzeImage = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;

    // Sample top-left for # symbol
    const leftBrightness = sampleBrightness(img, 0, 0, 0.2);
    // Sample top-right for number
    const rightBrightness = sampleBrightness(img, 0.7, 0, 0.25);

    // Threshold: if bright region, use dark text; otherwise white
    const threshold = 140;
    setHashColor(leftBrightness > threshold ? "#3a3a3a" : "#ffffff");
    setNumColor(rightBrightness > threshold ? "#3a3a3a" : "#ffffff");

    // Use manual hint if provided, otherwise auto-detect
    if (signal.focalHint) {
      if (signal.focalHint === "contain") {
        setUseContain(true);
        setFocalPoint("center center");
      } else {
        setFocalPoint(signal.focalHint);
        setUseContain(false);
      }
    } else {
      const result = detectFocalPoint(img);
      setFocalPoint(result.objectPosition);
      setUseContain(result.useContain);
    }
  }, [signal.focalHint]);

  const showTitle = hovered || isTouch;

  return (
    <motion.div
      layout
      layoutId={`card-${signal.id}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer group"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="aspect-[5/7] rounded-xl overflow-hidden bg-gray-300 shadow-sm hover:shadow-md transition-shadow relative">
        {/* B&W high contrast image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={thumbUrl(signal.images[0]?.url)}
          alt={signal.title}
          loading="lazy"
          decoding="async"
          crossOrigin="anonymous"
          onLoad={analyzeImage}
          className={`w-full h-full transition-[filter] duration-500 ease-out ${useContain ? "object-contain" : "object-cover"}`}
          style={{
            filter: hovered
              ? "grayscale(0%) contrast(1.05) brightness(1)"
              : "grayscale(100%) contrast(1.15) brightness(0.95)",
            objectPosition: focalPoint,
          }}
        />

        {/* Grain noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out"
          style={{
            backgroundImage: GRAIN_SVG,
            backgroundSize: "100px 100px",
            mixBlendMode: "multiply",
            opacity: hovered ? 0.15 : 0.85,
            zIndex: 5,
          }}
        />

        {/* # left, number right — Fraunces regular weight */}
        <div className="absolute top-0 inset-x-0 flex items-start justify-between px-2.5 pt-2 z-10">
          <span
            className="text-xl sm:text-2xl leading-none"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              color: hashColor,
              textShadow: hashColor === "#3a3a3a" ? "none" : "0 1px 3px rgba(0,0,0,0.5)",
              transition: "color 0.3s",
            }}
          >
            #
          </span>
          <span
            className="text-3xl sm:text-4xl leading-none"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              color: numColor,
              textShadow: numColor === "#3a3a3a" ? "none" : "0 1px 3px rgba(0,0,0,0.5)",
              transition: "color 0.3s",
            }}
          >
            {signal.number}
          </span>
        </div>

        {/* Star indicator */}
        {isStarred && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <Star size={14} className="text-amber-400 fill-amber-400 drop-shadow" />
          </div>
        )}

        {/* Hover headline overlay */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          initial={false}
          animate={showTitle ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <motion.div
            className="relative px-2.5 pb-2.5 pt-8"
            initial={false}
            animate={showTitle ? { y: 0 } : { y: 6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <p className="font-semibold text-white leading-tight line-clamp-4 drop-shadow-sm text-[0.8125rem] sm:text-[1.015rem]">
              {signal.title}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
