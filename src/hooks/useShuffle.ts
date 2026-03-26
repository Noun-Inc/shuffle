"use client";

import { useState, useCallback } from "react";
import type { Signal } from "@/data/signals";

export function useShuffle(initialSignals: Signal[]) {
  const [signals, setSignals] = useState(initialSignals);
  const [isShuffling, setIsShuffling] = useState(false);

  const shuffle = useCallback(() => {
    if (isShuffling) return;
    setIsShuffling(true);

    // Fisher-Yates shuffle
    const shuffled = [...signals];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Apply new order right as deal lands, so grid appears with new order
    setTimeout(() => {
      setSignals(shuffled);
    }, 4100);

    setTimeout(() => {
      setIsShuffling(false);
    }, 4300);
  }, [signals, isShuffling]);

  const sortByNumber = useCallback(() => {
    setSignals((prev) => [...prev].sort((a, b) => a.number - b.number));
  }, []);

  const filterByCategory = useCallback(
    (category: string | null) => {
      if (!category) {
        setSignals(initialSignals);
      } else {
        setSignals(initialSignals.filter((s) => s.category === category));
      }
    },
    [initialSignals]
  );

  return { signals, isShuffling, shuffle, sortByNumber, filterByCategory };
}
