"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Signal } from "@/data/signals";

export function useShuffle(sourceSignals: Signal[]) {
  // Track the source signals and whether the user has shuffled/filtered
  const [customOrder, setCustomOrder] = useState<Signal[] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const prevSourceRef = useRef(sourceSignals);

  // When source signals change (e.g. Supabase load), reset custom order
  useEffect(() => {
    if (prevSourceRef.current !== sourceSignals) {
      prevSourceRef.current = sourceSignals;
      setCustomOrder(null);
    }
  }, [sourceSignals]);

  // Active signals: custom order if set, otherwise source
  const signals = customOrder ?? sourceSignals;

  const shuffle = useCallback(() => {
    if (isShuffling) return;
    setIsShuffling(true);

    const shuffled = [...signals];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setTimeout(() => {
      setCustomOrder(shuffled);
    }, 4100);

    setTimeout(() => {
      setIsShuffling(false);
    }, 4300);
  }, [signals, isShuffling]);

  const sortByNumber = useCallback(() => {
    setCustomOrder((prev) => {
      const arr = prev ?? sourceSignals;
      return [...arr].sort((a, b) => a.number - b.number);
    });
  }, [sourceSignals]);

  const filterByCategory = useCallback(
    (category: string | null) => {
      if (!category) {
        setCustomOrder(null);
      } else {
        setCustomOrder(sourceSignals.filter((s) => s.category === category));
      }
    },
    [sourceSignals]
  );

  return { signals, isShuffling, shuffle, sortByNumber, filterByCategory };
}
