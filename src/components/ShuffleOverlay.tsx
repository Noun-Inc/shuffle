"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DealTarget } from "@/app/page";

interface ShuffleOverlayProps {
  isActive: boolean;
  cardImages: string[];
  dealTargets: DealTarget[];
}

const DECK_SIZE = 24;
const CARD_W = 100;
const CARD_H = 140;

type Phase = "start" | "gather" | "split" | "arc" | "restack" | "deal" | "done";

function getCardVariants(
  index: number,
  total: number,
  half: number,
  seed: { angle: number; radius: number },
  deal: { dx: number; dy: number; scaleX: number; scaleY: number } | null
) {
  const isLeft = index < half;
  const localIdx = isLeft ? index : index - half;
  const halfLen = isLeft ? half : total - half;
  const t = localIdx / (halfLen - 1 || 1);

  return {
    start: {
      x: Math.cos(seed.angle) * seed.radius,
      y: Math.sin(seed.angle) * seed.radius,
      rotate: ((index * 137.5) % 360) - 180,
      scaleX: 0.45,
      scaleY: 0.45,
      opacity: 0,
      transition: { duration: 0 },
    },
    gather: {
      x: (index - total / 2) * 0.3,
      y: -index * 0.9,
      rotate: (index - total / 2) * 0.5,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 70,
        damping: 16,
        mass: 0.7,
        delay: index * 0.018,
        opacity: { duration: 0.3, delay: index * 0.012 },
      },
    },
    split: {
      x: isLeft ? -65 + localIdx * 0.2 : 65 + localIdx * 0.2,
      y: -localIdx * 0.9,
      rotate: isLeft ? -4 + localIdx * 0.3 : 4 + localIdx * 0.3,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
        delay: index * 0.008,
      },
    },
    arc: {
      x: isLeft ? t * 50 - 10 : -t * 50 + 10,
      y: isLeft
        ? -130 - Math.sin(t * Math.PI) * 60
        : -110 - Math.sin(t * Math.PI) * 50,
      rotate: isLeft ? 8 + t * 8 : -8 - t * 8,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 1.0,
        delay: isLeft ? localIdx * 0.04 : localIdx * 0.04 + 0.05,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
    restack: {
      x: 0,
      y: -index * 0.7,
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
        delay: index * 0.01,
      },
    },
    deal: deal
      ? {
          x: deal.dx,
          y: deal.dy,
          rotate: 0,
          scaleX: deal.scaleX,
          scaleY: deal.scaleY,
          opacity: 1,
          transition: {
            duration: 0.4,
            delay: index * 0.03,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          },
        }
      : {
          x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, opacity: 0,
          transition: { duration: 0.2 },
        },
    done: deal
      ? {
          x: deal.dx,
          y: deal.dy,
          rotate: 0,
          scaleX: deal.scaleX,
          scaleY: deal.scaleY,
          opacity: 1,
          transition: { duration: 0 },
        }
      : {
          x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, opacity: 0,
          transition: { duration: 0 },
        },
  };
}

export default function ShuffleOverlay({
  isActive,
  cardImages,
  dealTargets,
}: ShuffleOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("start");

  const deckSize = Math.min(DECK_SIZE, cardImages.length);
  const step = Math.max(1, Math.floor(cardImages.length / deckSize));
  const half = Math.ceil(deckSize / 2);

  const seeds = useMemo(
    () =>
      Array.from({ length: deckSize }, (_, i) => ({
        angle: (i / deckSize) * Math.PI * 2 + (i % 3) * 0.4,
        radius: 450 + (i % 5) * 50,
      })),
    [deckSize]
  );

  // Convert deal targets from viewport coords to offsets from overlay center
  const dealPositions = useMemo(() => {
    if (typeof window === "undefined") return [];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    return Array.from({ length: deckSize }, (_, i) => {
      const target = dealTargets[i];
      if (!target) return null;
      return {
        dx: target.x - cx,
        dy: target.y - cy,
        scaleX: target.w / CARD_W,
        scaleY: target.h / CARD_H,
      };
    });
  }, [dealTargets, deckSize]);

  const cards = useMemo(
    () =>
      Array.from({ length: deckSize }, (_, i) => ({
        id: i,
        img: cardImages[Math.min(i * step, cardImages.length - 1)],
        variants: getCardVariants(
          i, deckSize, half, seeds[i], dealPositions[i]
        ),
      })),
    [cardImages, deckSize, step, half, seeds, dealPositions]
  );

  const prevActive = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Only trigger on rising edge (false → true)
    if (isActive && !prevActive.current) {
      // Clear any lingering timers
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      setPhase("start");
      setVisible(true);

      const timers: ReturnType<typeof setTimeout>[] = [];
      const at = (ms: number, p: Phase) =>
        timers.push(setTimeout(() => setPhase(p), ms));

      at(50, "gather");
      at(800, "split");
      at(1300, "arc");
      at(2400, "restack");
      at(2900, "deal");
      at(4100, "done");
      timers.push(setTimeout(() => setVisible(false), 4200));

      timersRef.current = timers;
    }
    prevActive.current = isActive;
  }, [isActive]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          {/* Solid white background — hides grid during shuffle */}
          <motion.div
            className="absolute inset-0 bg-[var(--bg,#f3f4f6)]"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "done" ? 0 : 1,
            }}
            transition={{
              duration: phase === "done" ? 0.15 : 0.3,
            }}
          />

          <div className="relative" style={{ width: CARD_W, height: CARD_H }}>
            {cards.map((card, i) => {
              const isLeft = i < half;
              return (
                <motion.div
                  key={card.id}
                  className="absolute top-0 left-0 rounded-lg overflow-hidden bg-white"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transformOrigin: "center center",
                    zIndex:
                      phase === "arc" && !isLeft
                        ? i + 30
                        : phase === "deal" || phase === "done"
                        ? deckSize - i
                        : i,
                    willChange: "transform, opacity",
                  }}
                  variants={card.variants}
                  initial="start"
                  animate={phase}
                >
                  <div className="relative w-full h-full shadow-lg rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.img}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ filter: "grayscale(100%) contrast(1.5) brightness(0.9)" }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.4 0.7 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
                        backgroundSize: "100px 100px",
                        mixBlendMode: "multiply" as const,
                        opacity: 0.7,
                      }}
                    />
                    <div className="absolute inset-0 rounded-lg ring-1 ring-black/10" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
