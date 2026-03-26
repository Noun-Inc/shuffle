"use client";

import { useEffect, useRef, useState } from "react";

interface ImageCreditProps {
  source?: string;
  sourceLabel?: string;
  imageRef?: React.RefObject<HTMLImageElement | null>;
}

export default function ImageCredit({
  source,
  sourceLabel,
  imageRef,
}: ImageCreditProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (!imageRef?.current) return;
    const img = imageRef.current;

    const analyze = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Sample bottom-right corner where credit appears
        const sampleSize = 60;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(
          img,
          img.naturalWidth - sampleSize,
          img.naturalHeight - sampleSize,
          sampleSize,
          sampleSize,
          0,
          0,
          sampleSize,
          sampleSize
        );

        const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        let totalBrightness = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
        }
        const avgBrightness = totalBrightness / pixels;
        setIsDark(avgBrightness < 128);
      } catch {
        // Cross-origin images can't be analyzed; default to white text
        setIsDark(true);
      }
    };

    if (img.complete) {
      analyze();
    } else {
      img.addEventListener("load", analyze);
      return () => img.removeEventListener("load", analyze);
    }
  }, [imageRef]);

  if (!source && !sourceLabel) return null;

  const label = sourceLabel || source;

  return (
    <span
      className={`absolute bottom-2 right-2 text-[9px] leading-tight max-w-[60%] truncate px-1 py-0.5 rounded ${
        isDark
          ? "text-white/70 bg-black/20"
          : "text-black/60 bg-white/30"
      }`}
      style={{ backdropFilter: "blur(2px)" }}
    >
      {label}
    </span>
  );
}
