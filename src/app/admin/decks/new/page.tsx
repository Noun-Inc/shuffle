"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewDeckPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [slugOverride, setSlugOverride] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = slugOverride || slugify(title);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/decks", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), year, description: description.trim() || null, slug: slug.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create deck"); return; }
      router.push(`/admin/decks/${data.id}`);
    } catch { setError("Connection error"); }
    finally { setSaving(false); }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push("/admin")}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-widest text-gray-900">SHUFFLE</h1>
            <span className="text-[10px] text-gray-400 tracking-wide -mt-0.5 block">New Deck</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-12">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Deck Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSlugOverride(""); }}
              placeholder="Signals 2025"
              required
              className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2000}
              max={2100}
              className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of this deck…"
              rows={3}
              className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors resize-none bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              URL Slug <span className="text-gray-300 font-normal normal-case">(auto-generated)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlugOverride(e.target.value)}
              placeholder="signals-2025"
              className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors font-mono bg-white"
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Deck"}
          </button>
        </form>
      </div>
    </main>
  );
}
