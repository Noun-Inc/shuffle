"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getStoredSession } from "@/hooks/useSession";
import { uploadSignalImage } from "@/lib/queries";

interface ImageEntry {
  id: string;
  file: File | null;
  previewUrl: string;
  alt: string;
  isFromInternet: boolean;
  sourceUrl: string;
  sourceLabel: string;
}

const KNOWN_CATEGORIES = [
  "Circular Economy",
  "Health & Wellness",
  "Food & Agriculture",
  "Technology & AI",
  "Fashion & Retail",
  "Education & Youth",
  "Design & Architecture",
  "Energy & Environment",
  "Media & Entertainment",
  "Mobility & Transport",
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

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
    if (score > bestScore) { bestScore = score; bestMatch = cat; }
  }
  return bestMatch;
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function AddSignalPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (!session || session.sessionId !== sessionId) {
      router.replace(`/?session=${sessionId}`);
      return;
    }
    if (!session.allowAddSignals) {
      router.replace(`/session/${sessionId}`);
      return;
    }
    setParticipantId(session.participantId);
    setAllowed(true);
  }, [sessionId, router]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [reference, setReference] = useState("");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);

  const addImageFromFile = useCallback((file: File) => {
    setImages((prev) => [
      ...prev,
      {
        id: generateId(),
        file,
        previewUrl: URL.createObjectURL(file),
        alt: file.name.replace(/\.[^.]+$/, ""),
        isFromInternet: false,
        sourceUrl: "",
        sourceLabel: "",
      },
    ]);
  }, []);

  const updateImage = (id: string, updates: Partial<ImageEntry>) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...updates } : img)));
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleFileDrop = (id: string, file: File) => {
    updateImage(id, { file, previewUrl: URL.createObjectURL(file), alt: file.name.replace(/\.[^.]+$/, "") });
  };

  const updateSuggestion = (t: string, b: string, r: string) => {
    if (!category && !customCategory) {
      setSuggestedCategory(suggestCategory(t, b + " " + r));
    }
  };

  const resolvedCategory = customCategory || category;

  const handlePublish = async () => {
    if (!participantId) return;
    setSaving(true);
    setPublishError(null);

    try {
      const uploadedImages = [];
      const tempId = `new-${Date.now()}`;
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        let url = img.previewUrl || "";
        if (img.file) {
          url = await uploadSignalImage(img.file, tempId, i);
        }
        uploadedImages.push({
          url,
          alt: img.alt,
          source: img.isFromInternet ? img.sourceUrl : undefined,
          sourceLabel: img.isFromInternet ? img.sourceLabel : undefined,
        });
      }

      const res = await fetch("/api/signals/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          title,
          body,
          category: resolvedCategory || suggestedCategory || undefined,
          year: new Date().getFullYear(),
          reference: reference || undefined,
          images: uploadedImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.error || "Publish failed");
        setSaving(false);
        return;
      }

      sessionStorage.setItem("newSignalId", data.signalId);
      router.push(`/session/${sessionId}`);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  };

  if (!allowed) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-[var(--bg)] relative"
      onDragOver={(e) => { e.preventDefault(); setIsDraggingGlobal(true); }}
      onDragLeave={(e) => {
        if (e.relatedTarget === null || !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
          setIsDraggingGlobal(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingGlobal(false);
        Array.from(e.dataTransfer.files)
          .filter((f) => f.type.startsWith("image/"))
          .forEach(addImageFromFile);
      }}
    >
      <AnimatePresence>
        {isDraggingGlobal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-4 border-dashed border-blue-400 rounded-3xl m-4 flex items-center justify-center pointer-events-none"
          >
            <p className="text-lg font-semibold text-blue-600">Drop images here</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/session/${sessionId}`}
            className="w-10 text-gray-500 hover:text-gray-900 transition-colors flex items-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-sm font-bold tracking-wider uppercase text-gray-900">Add Signal</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <Field label="Headline" required>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); updateSuggestion(e.target.value, body, reference); }}
            placeholder="Enter signal headline..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors text-sm bg-white"
          />
        </Field>

        <Field label="Description" required>
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); updateSuggestion(title, e.target.value, reference); }}
            placeholder="Describe this signal..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors text-sm bg-white resize-none"
          />
        </Field>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Images</label>
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
                  <div className="relative">
                    {img.previewUrl ? (
                      <div className="relative aspect-video bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.previewUrl} alt={img.alt} className="w-full h-full object-contain" />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label
                        className="flex flex-col items-center justify-center min-h-[200px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-t-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          const file = e.dataTransfer.files[0];
                          if (file?.type.startsWith("image/")) handleFileDrop(img.id, file);
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileDrop(img.id, f); }}
                        />
                        <span className="text-sm text-gray-400">Drag & drop or click to upload</span>
                      </label>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => updateImage(img.id, { alt: e.target.value })}
                      placeholder="Alt text / description"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors text-sm bg-white"
                    />
                    <button
                      onClick={() => updateImage(img.id, { isFromInternet: !img.isFromInternet })}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${img.isFromInternet ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-gray-100 text-gray-500"}`}
                    >
                      {img.isFromInternet ? "From internet" : "Not from internet"}
                    </button>
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
                            onChange={(e) => updateImage(img.id, { sourceUrl: e.target.value })}
                            placeholder="Source URL"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors text-sm bg-white"
                          />
                          <input
                            type="text"
                            value={img.sourceLabel}
                            onChange={(e) => updateImage(img.id, { sourceLabel: e.target.value })}
                            placeholder="Credit label"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors text-sm bg-white"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <label
            className="mt-3 w-full min-h-[100px] border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault(); e.stopPropagation();
              Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")).forEach(addImageFromFile);
            }}
          >
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { Array.from(e.target.files || []).forEach(addImageFromFile); e.target.value = ""; }} />
            + Add Image
          </label>
        </div>

        <Field label="Reference URL">
          <input
            type="url"
            value={reference}
            onChange={(e) => { setReference(e.target.value); updateSuggestion(title, body, e.target.value); }}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors text-sm bg-white"
          />
        </Field>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          {resolvedCategory || suggestedCategory ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium">
                {resolvedCategory || suggestedCategory}
              </span>
              {!resolvedCategory && <span className="text-xs text-gray-400">Auto-detected</span>}
              <button onClick={() => { setCategory(""); setCustomCategory(""); setSuggestedCategory(""); }} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Auto-generated from your headline and description</p>
          )}
          <details className="mt-2">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Override category</summary>
            <div className="mt-2 flex gap-2">
              <select value={category} onChange={(e) => { setCategory(e.target.value); setCustomCategory(""); setSuggestedCategory(""); }} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors text-sm bg-white">
                <option value="">Select category...</option>
                {KNOWN_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <span className="text-sm text-gray-400 self-center">or</span>
              <input type="text" value={customCategory} onChange={(e) => { setCustomCategory(e.target.value); setCategory(""); setSuggestedCategory(""); }} placeholder="New category" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors text-sm bg-white" />
            </div>
          </details>
        </div>

        <AnimatePresence>
          {publishError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {publishError}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pb-8">
          <button
            onClick={handlePublish}
            disabled={saving || !title.trim() || !body.trim()}
            className="w-full py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-700 transition-colors disabled:opacity-40 text-sm"
          >
            {saving ? "Publishing..." : "Publish Signal"}
          </button>
        </div>
      </div>
    </main>
  );
}
