"use client";

import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { SignalImage } from "@/data/signals";
import { signals, categories } from "@/data/signals";
import { useDrafts } from "@/hooks/useDrafts";
import { upsertSignal, uploadSignalImage, getNextNumber as fetchNextNumber } from "@/lib/queries";

interface ImageEntry {
  id: string;
  file: File | null;
  previewUrl: string;
  alt: string;
  isFromInternet: boolean;
  sourceUrl: string;
  sourceLabel: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// Auto-generate next signal number
function getNextNumber() {
  const max = signals.reduce((m, s) => Math.max(m, s.number), 0);
  return max + 1;
}

// Get the year of the current deck being viewed
function getCurrentDeckYear() {
  // Default to current year; in a real app this would come from route/context
  const years = [...new Set(signals.map((s) => s.year))].sort((a, b) => b - a);
  return years[0] || new Date().getFullYear();
}

// Suggest a category based on the title + body using keyword matching
function suggestCategory(title: string, body: string): string {
  const text = (title + " " + body).toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    "Circular Economy": ["circular", "recycle", "reuse", "repair", "waste", "sustainable", "upcycle", "modular"],
    "Health & Wellness": ["health", "wellness", "medical", "therapy", "mental", "fitness", "nutrition", "wearable", "body"],
    "Food & Agriculture": ["food", "agriculture", "farm", "organic", "plant-based", "crop", "soil", "harvest", "meal"],
    "Technology & AI": ["ai", "artificial intelligence", "robot", "machine learning", "algorithm", "tech", "digital", "software", "compute", "autonomous"],
    "Fashion & Retail": ["fashion", "clothing", "apparel", "wear", "textile", "fabric", "retail", "brand", "style", "garment"],
    "Education & Youth": ["education", "school", "student", "learn", "youth", "young", "generation", "university", "teach"],
    "Design & Architecture": ["design", "architecture", "interior", "space", "building", "urban", "city", "construct"],
    "Energy & Environment": ["energy", "solar", "wind", "climate", "carbon", "emission", "renewable", "environment", "green"],
    "Media & Entertainment": ["media", "entertainment", "film", "music", "content", "stream", "game", "social media", "creator"],
    "Mobility & Transport": ["mobility", "transport", "vehicle", "car", "ev", "electric vehicle", "bike", "flight", "travel"],
  };

  let bestMatch = "";
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cat;
    }
  }

  // Also check existing categories
  for (const cat of categories) {
    if (text.includes(cat.toLowerCase())) return cat;
  }

  return bestMatch;
}

export default function AdminPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <AdminPage />
    </Suspense>
  );
}

function AdminPage() {
  const nextNum = useRef(getNextNumber());
  const deckYear = useRef(getCurrentDeckYear());
  const searchParams = useSearchParams();
  const router = useRouter();
  const draftId = searchParams.get("draft");
  const { saveDraft, getDraft, publishDraft } = useDrafts();

  const [editingDraftId, setEditingDraftId] = useState<string | number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [reference, setReference] = useState("");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAs, setSavedAs] = useState<"draft" | "published" | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);

  // Load draft if ?draft=ID is in URL
  useEffect(() => {
    if (!draftId) return;
    const draft = getDraft(Number(draftId));
    if (!draft) return;
    setEditingDraftId(draft.id);
    setTitle(draft.title);
    setBody(draft.body);
    setCategory(draft.category || "");
    setReference(draft.reference || "");
    nextNum.current = draft.number;
    // Convert draft images to ImageEntry format
    setImages(
      draft.images.map((img) => ({
        id: generateId(),
        file: null,
        previewUrl: img.url,
        alt: img.alt || "",
        isFromInternet: !!img.source,
        sourceUrl: img.source || "",
        sourceLabel: img.sourceLabel || "",
      }))
    );
  }, [draftId, getDraft]);

  const addImage = () => {
    const entry: ImageEntry = {
      id: generateId(),
      file: null,
      previewUrl: "",
      alt: "",
      isFromInternet: false,
      sourceUrl: "",
      sourceLabel: "",
    };
    setImages((prev) => [...prev, entry]);
  };

  const addImageFromFile = useCallback((file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const entry: ImageEntry = {
      id: generateId(),
      file,
      previewUrl,
      alt: file.name.replace(/\.[^.]+$/, ""),
      isFromInternet: false,
      sourceUrl: "",
      sourceLabel: "",
    };
    setImages((prev) => [...prev, entry]);
  }, []);

  const updateImage = (id: string, updates: Partial<ImageEntry>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleFileDrop = (id: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    updateImage(id, { file, previewUrl, alt: file.name.replace(/\.[^.]+$/, "") });
  };

  // Auto-suggest category when title/body changes
  const updateSuggestion = (t: string, b: string, r: string) => {
    if (!category && !customCategory) {
      const suggested = suggestCategory(t, b + " " + r);
      setSuggestedCategory(suggested);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    updateSuggestion(val, body, reference);
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    updateSuggestion(title, val, reference);
  };

  const handleReferenceChange = (val: string) => {
    setReference(val);
    updateSuggestion(title, body, val);
  };

  const acceptSuggestion = () => {
    if (suggestedCategory) {
      if (categories.includes(suggestedCategory)) {
        setCategory(suggestedCategory);
      } else {
        setCustomCategory(suggestedCategory);
      }
      setSuggestedCategory("");
    }
  };

  const buildSignalData = () => ({
    id: editingDraftId || Date.now(),
    number: nextNum.current,
    title,
    body,
    images: images.map((img) => ({
      url: img.previewUrl || "",
      alt: img.alt,
      source: img.isFromInternet ? img.sourceUrl : undefined,
      sourceLabel: img.isFromInternet ? img.sourceLabel : undefined,
    })) as SignalImage[],
    category: customCategory || category || suggestedCategory || undefined,
    year: deckYear.current,
    reference: reference || undefined,
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const imgData = images.map((img) => ({
        url: img.previewUrl || "",
        alt: img.alt,
        source: img.isFromInternet ? img.sourceUrl : undefined,
        sourceLabel: img.isFromInternet ? img.sourceLabel : undefined,
      }));

      const saved = await upsertSignal({
        id: typeof editingDraftId === "string" ? editingDraftId : undefined,
        deckSlug: "2026-signals",
        number: nextNum.current,
        title,
        body,
        category: customCategory || category || suggestedCategory || undefined,
        year: deckYear.current,
        reference: reference || undefined,
        status: "draft",
        images: imgData,
      });
      setEditingDraftId(saved.id as string);
    } catch (err) {
      console.error("Save draft error:", err);
      // Fallback to localStorage
      const data = buildSignalData();
      saveDraft(data);
      setEditingDraftId(data.id);
    }
    setSaving(false);
    setSavedAs("draft");
    setTimeout(() => setSavedAs(null), 3000);
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // Upload images to Supabase Storage if they are local files
      const uploadedImages = [];
      const tempSignalId = editingDraftId || `new-${Date.now()}`;
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        let url = img.previewUrl || "";

        // If it's a blob/local file, upload to Supabase Storage
        if (img.file) {
          url = await uploadSignalImage(img.file, String(tempSignalId), i);
        }

        uploadedImages.push({
          url,
          alt: img.alt,
          source: img.isFromInternet ? img.sourceUrl : undefined,
          sourceLabel: img.isFromInternet ? img.sourceLabel : undefined,
        });
      }

      const saved = await upsertSignal({
        id: typeof editingDraftId === "string" ? editingDraftId : undefined,
        deckSlug: "2026-signals",
        number: nextNum.current,
        title,
        body,
        category: customCategory || category || suggestedCategory || undefined,
        year: deckYear.current,
        reference: reference || undefined,
        status: "published",
        images: uploadedImages,
      });

      // Store new signal ID so home page can animate it in
      sessionStorage.setItem("newSignalId", String(saved.id));
      router.push("/");
      return;
    } catch (err) {
      console.error("Publish error:", err);
    }
    setSaving(false);
    setSavedAs("published");
    setTimeout(() => setSavedAs(null), 3000);
  };

  const resolvedCategory = customCategory || category;

  // Global drag & drop for images anywhere on the page
  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGlobal(true);
  };
  const handleGlobalDragLeave = (e: React.DragEvent) => {
    // Only trigger if leaving the page entirely
    if (e.relatedTarget === null || !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDraggingGlobal(false);
    }
  };
  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGlobal(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    files.forEach(addImageFromFile);
  };

  return (
    <main
      className="min-h-screen bg-[var(--bg)] relative"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* Global drop overlay */}
      <AnimatePresence>
        {isDraggingGlobal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-4 border-dashed border-blue-400 rounded-3xl m-4 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <svg className="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="text-lg font-semibold text-blue-600">Drop images here</p>
              <p className="text-sm text-blue-400 mt-1">They&apos;ll be added to this signal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="w-10 text-gray-500 hover:text-gray-900 transition-colors flex items-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-sm font-bold tracking-wider uppercase text-gray-900">
            Add Signal
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Auto-generated number & deck year */}
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Signal</span>
            <span className="text-2xl font-bold text-gray-900">#{nextNum.current}</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Deck Year</span>
            <span className="text-2xl font-bold text-gray-900">{deckYear.current}</span>
          </div>
        </div>

        {/* Title */}
        <Field label="Headline" required>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter signal headline..."
            className="input-field"
          />
        </Field>

        {/* Body */}
        <Field label="Description">
          <textarea
            value={body}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder="What's significant about this signal? What shift is being observed?"
            rows={4}
            className="input-field resize-none"
          />
        </Field>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Images
          </label>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                >
                  {/* Image preview / upload zone */}
                  <div className="relative">
                    {img.previewUrl ? (
                      <div className="relative aspect-video bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={img.alt}
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label
                        className="flex flex-col items-center justify-center min-h-[240px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-t-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors group"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files[0];
                          if (file?.type.startsWith("image/")) handleFileDrop(img.id, file);
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileDrop(img.id, file);
                          }}
                        />
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-blue-400 transition-colors">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                        <span className="mt-3 text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                          Drag &amp; drop image here
                        </span>
                        <span className="mt-1.5 text-xs text-gray-300 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          or click to browse files
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Image fields */}
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => updateImage(img.id, { alt: e.target.value })}
                      placeholder="Alt text / description"
                      className="input-field text-sm"
                    />

                    {/* Source toggle */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateImage(img.id, {
                            isFromInternet: !img.isFromInternet,
                          })
                        }
                        className={`
                          relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                          ${
                            img.isFromInternet
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-150"
                          }
                        `}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                        </svg>
                        {img.isFromInternet ? "From internet" : "Not from internet"}
                      </button>
                      {!img.isFromInternet && (
                        <span className="text-xs text-gray-400">
                          Your own image — no credit needed
                        </span>
                      )}
                    </div>

                    {/* Source fields (conditional) */}
                    <AnimatePresence>
                      {img.isFromInternet && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <input
                            type="url"
                            value={img.sourceUrl}
                            onChange={(e) =>
                              updateImage(img.id, { sourceUrl: e.target.value })
                            }
                            placeholder="Paste source URL..."
                            className="input-field text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={img.sourceLabel}
                              onChange={(e) =>
                                updateImage(img.id, {
                                  sourceLabel: e.target.value,
                                })
                              }
                              placeholder="Credit label (auto-generated if empty)"
                              className="input-field text-sm flex-1"
                            />
                            <button
                              onClick={() => {
                                if (img.sourceUrl) {
                                  try {
                                    const hostname = new URL(img.sourceUrl).hostname.replace("www.", "");
                                    updateImage(img.id, {
                                      sourceLabel: `Source: ${hostname}`,
                                    });
                                  } catch {
                                    updateImage(img.id, {
                                      sourceLabel: "Source: " + img.sourceUrl,
                                    });
                                  }
                                }
                              }}
                              className="shrink-0 px-3 py-2 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Auto-credit
                            </button>
                          </div>
                          {img.sourceLabel && (
                            <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-2">
                              <span className="text-[10px] text-white/70 font-mono">
                                {img.sourceLabel}
                              </span>
                              <span className="text-[9px] text-white/40 ml-auto">
                                Preview of credit overlay
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add image button — drag & drop or click */}
          <label
            className="mt-3 w-full min-h-[120px] border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
              files.forEach(addImageFromFile);
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(addImageFromFile);
                e.target.value = "";
              }}
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-blue-500 transition-colors">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">
              Drop or click to upload
            </span>
          </label>
        </div>

        {/* Reference URL — moved below Images */}
        <Field label="Reference URL">
          <input
            type="url"
            value={reference}
            onChange={(e) => handleReferenceChange(e.target.value)}
            placeholder="https://..."
            className="input-field"
          />
        </Field>

        {/* Category — auto-generated, at the bottom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          {(resolvedCategory || suggestedCategory) ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                {resolvedCategory || suggestedCategory}
              </span>
              {!resolvedCategory && suggestedCategory && (
                <span className="text-xs text-gray-400">Auto-detected</span>
              )}
              <button
                onClick={() => {
                  setCategory("");
                  setCustomCategory("");
                  setSuggestedCategory("");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Will be auto-generated from your headline, description, and source
            </p>
          )}
          {/* Override */}
          <details className="mt-2">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
              Override category
            </summary>
            <div className="mt-2 flex gap-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCustomCategory("");
                  setSuggestedCategory("");
                }}
                className="input-field flex-1 text-sm"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-400 self-center">or</span>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setCategory("");
                  setSuggestedCategory("");
                }}
                placeholder="New category"
                className="input-field flex-1 text-sm"
              />
            </div>
          </details>
        </div>

        {/* Save buttons */}
        <div className="pt-4 pb-12 flex gap-3">
          {/* Save as Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={!title || saving}
            className={`
              flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all border-2
              ${
                !title
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : saving
                  ? "border-gray-300 text-gray-400 cursor-wait"
                  : "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 active:scale-[0.98]"
              }
            `}
          >
            {savedAs === "draft" ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Draft saved
              </span>
            ) : (
              "Save as Draft"
            )}
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={!title || saving}
            className={`
              flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all
              ${
                !title
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : saving
                  ? "bg-blue-500 text-white cursor-wait"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-600/20"
              }
            `}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Publishing...
              </span>
            ) : savedAs === "published" ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Published!
              </span>
            ) : (
              "Publish to Deck"
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.9375rem;
          color: #111827;
          background: white;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .input-field::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
