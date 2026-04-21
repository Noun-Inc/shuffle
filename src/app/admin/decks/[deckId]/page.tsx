"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadSignalImage } from "@/lib/queries";
import CardGrid from "@/components/CardGrid";
import type { Signal } from "@/data/signals";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminSignal {
  id: string;
  number: number;
  title: string;
  body: string;
  category: string | null;
  year: number;
  reference: string | null;
  status: string;
  images: Array<{
    id: string;
    url: string;
    thumbUrl: string | null;
    alt: string | null;
    source: string | null;
    sourceLabel: string | null;
    sortOrder: number;
  }>;
}

interface ImageEntry {
  id: string;
  file: File | null;
  previewUrl: string;
  alt: string;
  isFromInternet: boolean;
  sourceUrl: string;
  sourceLabel: string;
}

type SignalPayload = {
  title: string; body: string; category: string; year: number;
  reference: string; images: Array<{ url: string; alt?: string; source?: string; sourceLabel?: string }>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KNOWN_CATEGORIES = [
  "Circular Economy", "Health & Wellness", "Food & Agriculture",
  "Technology & AI", "Fashion & Retail", "Education & Youth",
  "Design & Architecture", "Energy & Environment", "Media & Entertainment",
  "Mobility & Transport",
];

function genId() { return Math.random().toString(36).slice(2, 10); }

function suggestCategory(title: string, body: string): string {
  const text = (title + " " + body).toLowerCase();
  const map: Record<string, string[]> = {
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
  let best = ""; let bestScore = 0;
  for (const [cat, kws] of Object.entries(map)) {
    const score = kws.filter((k) => text.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best;
}

function adminSignalToSignal(s: AdminSignal): Signal {
  return {
    id: s.id, number: s.number, title: s.title, body: s.body,
    category: s.category ?? undefined, year: s.year, reference: s.reference ?? undefined,
    images: s.images.map((img) => ({
      url: img.url, thumbUrl: img.thumbUrl ?? undefined,
      alt: img.alt ?? undefined, source: img.source ?? undefined, sourceLabel: img.sourceLabel ?? undefined,
    })),
  };
}

async function adminFetch(path: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

// ─── SignalForm ───────────────────────────────────────────────────────────────

function SignalForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial?: AdminSignal;
  onSave: (payload: SignalPayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [category, setCategory] = useState(
    initial?.category && KNOWN_CATEGORIES.includes(initial.category) ? initial.category : ""
  );
  const [customCategory, setCustomCategory] = useState(
    initial?.category && !KNOWN_CATEGORIES.includes(initial.category) ? initial.category : ""
  );
  const [reference, setReference] = useState(initial?.reference ?? "");
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear());
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [images, setImages] = useState<ImageEntry[]>(
    (initial?.images ?? []).map((img) => ({
      id: genId(), file: null, previewUrl: img.url, alt: img.alt ?? "",
      isFromInternet: !!(img.source), sourceUrl: img.source ?? "", sourceLabel: img.sourceLabel ?? "",
    }))
  );
  const [isDragging, setIsDragging] = useState(false);

  const addFile = useCallback((file: File) => {
    setImages((prev) => [
      ...prev,
      { id: genId(), file, previewUrl: URL.createObjectURL(file), alt: file.name.replace(/\.[^.]+$/, ""), isFromInternet: false, sourceUrl: "", sourceLabel: "" },
    ]);
  }, []);

  const updateImage = (id: string, updates: Partial<ImageEntry>) =>
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...updates } : img)));

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((img) => img.id !== id));

  const updateSuggestion = (t: string, b: string) => {
    if (!category && !customCategory) setSuggestedCategory(suggestCategory(t, b));
  };

  const resolvedCategory = customCategory || category;

  const handleSubmit = async () => {
    const tempId = `admin-${Date.now()}`;
    const uploaded = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      let url = img.previewUrl;
      if (img.file) url = await uploadSignalImage(img.file, tempId, i);
      uploaded.push({ url, alt: img.alt || undefined, source: img.isFromInternet ? img.sourceUrl : undefined, sourceLabel: img.isFromInternet ? img.sourceLabel : undefined });
    }
    await onSave({ title, body, category: resolvedCategory || suggestedCategory || "", year, reference, images: uploaded });
  };

  return (
    <div
      className="space-y-6"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")).forEach(addFile); }}
    >
      {isDragging && (
        <div className="fixed inset-0 z-[60] bg-blue-500/10 backdrop-blur-sm border-4 border-dashed border-blue-400 rounded-3xl m-4 flex items-center justify-center pointer-events-none">
          <p className="text-lg font-semibold text-blue-600">Drop images here</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Headline <span className="text-red-400">*</span></label>
        <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); updateSuggestion(e.target.value, body); }}
          placeholder="Signal headline..."
          className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Description <span className="text-red-400">*</span></label>
        <textarea value={body} onChange={(e) => { setBody(e.target.value); updateSuggestion(title, e.target.value); }}
          placeholder="Describe this signal..." rows={5}
          className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors resize-none bg-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Images</label>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {images.map((img) => (
              <motion.div key={img.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                {img.previewUrl ? (
                  <div className="relative aspect-video bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.previewUrl} alt={img.alt} className="w-full h-full object-contain" />
                    <button onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm">&times;</button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center min-h-[160px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-t-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) updateImage(img.id, { file: f, previewUrl: URL.createObjectURL(f), alt: f.name.replace(/\.[^.]+$/, "") }); }}>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) updateImage(img.id, { file: f, previewUrl: URL.createObjectURL(f), alt: f.name.replace(/\.[^.]+$/, "") }); }} />
                    <span className="text-sm text-gray-400">Drag & drop or click to upload</span>
                  </label>
                )}
                <div className="p-3 space-y-2">
                  <input type="text" value={img.alt} onChange={(e) => updateImage(img.id, { alt: e.target.value })} placeholder="Alt text"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white" />
                  <button onClick={() => updateImage(img.id, { isFromInternet: !img.isFromInternet })}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${img.isFromInternet ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-gray-100 text-gray-500"}`}>
                    {img.isFromInternet ? "From internet" : "Not from internet"}
                  </button>
                  <AnimatePresence>
                    {img.isFromInternet && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                        <input type="url" value={img.sourceUrl} onChange={(e) => updateImage(img.id, { sourceUrl: e.target.value })} placeholder="Source URL"
                          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white" />
                        <input type="text" value={img.sourceLabel} onChange={(e) => updateImage(img.id, { sourceLabel: e.target.value })} placeholder="Credit label"
                          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <label
          className="mt-3 w-full min-h-[80px] border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")).forEach(addFile); }}>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { Array.from(e.target.files || []).forEach(addFile); e.target.value = ""; }} />
          + Add Image
        </label>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Reference URL</label>
        <input type="url" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="https://..."
          className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Year</label>
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2000} max={2100}
          className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
        {resolvedCategory || suggestedCategory ? (
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium">{resolvedCategory || suggestedCategory}</span>
            {!resolvedCategory && <span className="text-xs text-gray-400">Auto-detected</span>}
            <button onClick={() => { setCategory(""); setCustomCategory(""); setSuggestedCategory(""); }} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic mb-2">Auto-generated from headline and description</p>
        )}
        <details>
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Override category</summary>
          <div className="mt-2 flex gap-2">
            <select value={category} onChange={(e) => { setCategory(e.target.value); setCustomCategory(""); setSuggestedCategory(""); }}
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white">
              <option value="">Select category...</option>
              {KNOWN_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <span className="text-sm text-gray-400 self-center">or</span>
            <input type="text" value={customCategory} onChange={(e) => { setCustomCategory(e.target.value); setCategory(""); setSuggestedCategory(""); }} placeholder="New category"
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white" />
          </div>
        </details>
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving || !title.trim() || !body.trim()}
          className="flex-1 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40">
          {saving ? "Saving..." : initial ? "Save changes" : "Add Signal"}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminDeckPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deckTitle, setDeckTitle] = useState("");
  const [signals, setSignals] = useState<AdminSignal[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingSignal, setEditingSignal] = useState<AdminSignal | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email ?? "";
      const ok = email.endsWith("@noun.global");
      setIsAdmin(ok);
      setAuthChecked(true);
      if (!ok) router.replace("/admin");
    });
  }, [router]);

  const loadDeck = useCallback(async () => {
    const [deckRes, sigsRes] = await Promise.all([
      adminFetch(`/api/admin/decks/${deckId}`),
      adminFetch(`/api/admin/decks/${deckId}/signals`),
    ]);
    if (deckRes.ok) { const d = await deckRes.json(); setDeckTitle(d.title); }
    if (sigsRes.ok) setSignals(await sigsRes.json());
    setLoading(false);
  }, [deckId]);

  useEffect(() => { if (isAdmin) loadDeck(); }, [isAdmin, loadDeck]);

  const handleAdd = async (payload: SignalPayload) => {
    setAddSaving(true); setAddError(null);
    try {
      const res = await adminFetch(`/api/admin/decks/${deckId}/signals`, { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || "Failed to add signal"); return; }
      setShowAdd(false);
      await loadDeck();
    } catch { setAddError("Connection error"); }
    finally { setAddSaving(false); }
  };

  const handleEdit = async (payload: SignalPayload) => {
    if (!editingSignal) return;
    setEditSaving(true); setEditError(null);
    try {
      const res = await adminFetch(`/api/admin/decks/${deckId}/signals/${editingSignal.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error || "Failed to save"); return; }
      setEditingSignal(null);
      await loadDeck();
    } catch { setEditError("Connection error"); }
    finally { setEditSaving(false); }
  };

  const handleCardClick = (signal: Signal) => {
    const adminSig = signals.find((s) => s.id === signal.id);
    if (adminSig) { setEditingSignal(adminSig); setEditError(null); }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const gridSignals = signals.map(adminSignalToSignal);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Header — same sticky style as session page, but only + button */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/admin")}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Back">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-widest text-gray-900">SHUFFLE</h1>
              {deckTitle && <span className="text-[10px] text-gray-400 tracking-wide -mt-0.5 block">{deckTitle}</span>}
            </div>
          </div>
          <button
            onClick={() => { setShowAdd(true); setEditingSignal(null); setAddError(null); }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Add signal"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : gridSignals.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
          <p className="text-sm">No signals yet.</p>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:border-gray-400 transition-colors">
            <Plus size={15} /> Add first signal
          </button>
        </div>
      ) : (
        <CardGrid
          signals={gridSignals}
          isShuffling={false}
          onCardClick={handleCardClick}
        />
      )}

      {/* Add signal modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-900">New Signal</h3>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              <SignalForm onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={addSaving} error={addError} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit signal modal */}
      <AnimatePresence>
        {editingSignal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setEditingSignal(null)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-900">Edit Signal #{editingSignal.number}</h3>
                <button onClick={() => setEditingSignal(null)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
              <SignalForm initial={editingSignal} onSave={handleEdit} onCancel={() => setEditingSignal(null)} saving={editSaving} error={editError} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
