"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Deck } from "@/lib/queries";
import type { User } from "@supabase/supabase-js";

interface SessionRow {
  id: string;
  title: string;
  deckTitle: string | undefined;
  expiresAt: string;
  allowAddSignals: boolean;
  joinPassword: string | null;
  participantCount: number;
  createdAt: string;
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

// ─── Main admin page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"sessions" | "decks">("sessions");

  // ── Sessions state ──
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdSession, setCreatedSession] = useState<{ id: string; title: string; password: string | null } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editAllowAddSignals, setEditAllowAddSignals] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // ── Decks tab state ──
  const [loadingDecks, setLoadingDecks] = useState(false);

  const startEdit = (session: SessionRow) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setEditExpiresAt(new Date(session.expiresAt).toISOString().slice(0, 16));
    setEditAllowAddSignals(session.allowAddSignals);
  };

  const handleSaveEdit = async (id: string) => {
    setEditSaving(true);
    try {
      const res = await adminFetch(`/api/admin/sessions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: editTitle, expiresAt: new Date(editExpiresAt).toISOString(), allowAddSignals: editAllowAddSignals }),
      });
      if (res.ok) {
        setSessions((prev) => prev.map((s) => s.id === id
          ? { ...s, title: editTitle, expiresAt: new Date(editExpiresAt).toISOString(), allowAddSignals: editAllowAddSignals }
          : s));
        setEditingId(null);
      }
    } finally {
      setEditSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const [formTitle, setFormTitle] = useState("");
  const [formDeckId, setFormDeckId] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formAllowAddSignals, setFormAllowAddSignals] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadDecks = useCallback(async () => {
    setLoadingDecks(true);
    try {
      const res = await adminFetch("/api/admin/decks");
      if (res.ok) {
        const data = await res.json();
        setDecks(data);
        setFormDeckId((prev) => prev || (data[0]?.id ?? ""));
      }
    } finally {
      setLoadingDecks(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await adminFetch("/api/admin/sessions");
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const userId = user?.id ?? null;
  useEffect(() => {
    if (userId) {
      loadDecks();
      loadSessions();
    }
  }, [userId, loadDecks, loadSessions]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/admin` } });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDeckId || !formExpiresAt) return;
    setFormSaving(true);
    setFormError(null);
    try {
      const res = await adminFetch("/api/admin/sessions", {
        method: "POST",
        body: JSON.stringify({ title: formTitle, deckId: formDeckId, expiresAt: new Date(formExpiresAt).toISOString(), allowAddSignals: formAllowAddSignals }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create session");
      } else {
        setCreatedSession({ id: data.session.id, title: data.session.title, password: data.session.joinPassword });
        setShowCreateForm(false);
        setFormTitle("");
        setFormExpiresAt("");
        setFormAllowAddSignals(false);
        await loadSessions();
      }
    } catch {
      setFormError("Connection error");
    }
    setFormSaving(false);
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Delete this session? All participant data will be permanently lost.")) return;
    const res = await adminFetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
    if (res.ok) setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold tracking-widest text-gray-900 mb-2">SHUFFLE</h1>
          <p className="text-sm text-gray-400 mb-10">Admin — noun.global accounts only</p>
          <button onClick={handleGoogleLogin}
            className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
          <div className="mt-6">
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Back</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-sm font-bold tracking-wider uppercase text-gray-900">Admin</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(["sessions", "decks"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── SESSIONS TAB ── */}
        {activeTab === "sessions" && (
          <>
            {/* Created session confirmation */}
            <AnimatePresence>
              {createdSession && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-800">Session created: {createdSession.title}</p>
                      <p className="text-xs text-green-600 mt-0.5">Share this with participants</p>
                    </div>
                    <button onClick={() => setCreatedSession(null)} className="text-green-400 hover:text-green-600">✕</button>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Session ID</p>
                      <p className="font-mono text-sm text-gray-900 break-all">{createdSession.id}</p>
                    </div>
                    {createdSession.password && (
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Session Password</p>
                        <p className="font-mono text-2xl font-bold text-gray-900 tracking-widest">{createdSession.password}</p>
                      </div>
                    )}
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Join URL</p>
                      <p className="font-mono text-sm text-gray-900 break-all">
                        {typeof window !== "undefined" ? window.location.origin : ""}/session/{createdSession.id}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Sessions</h2>
              <button onClick={() => setShowCreateForm((v) => !v)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                {showCreateForm ? "Cancel" : "+ New Session"}
              </button>
            </div>

            <AnimatePresence>
              {showCreateForm && (
                <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onSubmit={handleCreateSession}
                  className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                  <h3 className="text-sm font-semibold text-gray-900">New Session</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Title</label>
                    <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Workshop A — Tokyo" required
                      className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Default Deck</label>
                    <select value={formDeckId} onChange={(e) => setFormDeckId(e.target.value)} required
                      className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors bg-white">
                      {decks.map((d) => <option key={d.id} value={d.id}>{d.title} ({d.year})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date & Time</label>
                    <input type="datetime-local" value={formExpiresAt} onChange={(e) => setFormExpiresAt(e.target.value)} required
                      className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formAllowAddSignals} onChange={(e) => setFormAllowAddSignals(e.target.checked)} className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">Allow participants to add signals</span>
                  </label>
                  {formAllowAddSignals && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      A password will be auto-generated. All participants must provide it to join.
                    </p>
                  )}
                  {formError && <p className="text-xs text-red-500">{formError}</p>}
                  <button type="submit" disabled={formSaving}
                    className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50">
                    {formSaving ? "Creating..." : "Create Session"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {loadingSessions ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No sessions yet. Create one to get started.</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const expired = new Date(session.expiresAt) < new Date();
                  return (
                    <div key={session.id}
                      className={`bg-white rounded-2xl border p-5 ${expired ? "border-gray-100 opacity-60" : "border-gray-200"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-gray-900">{session.title}</h3>
                            {expired && <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">Expired</span>}
                            {session.allowAddSignals && <span className="text-[10px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">Signals enabled</span>}
                          </div>
                          <div className="mt-1.5 space-y-0.5">
                            <p className="text-xs text-gray-400">
                              {session.participantCount} participant{session.participantCount !== 1 ? "s" : ""} · {session.deckTitle}
                            </p>
                            <p className="text-xs text-gray-400">Expires {new Date(session.expiresAt).toLocaleString()}</p>
                            {session.joinPassword && (
                              <p className="text-xs text-gray-500">Password: <span className="font-mono font-semibold tracking-widest">{session.joinPassword}</span></p>
                            )}
                            <div className="pt-1 space-y-1">
                              <div className="flex items-center gap-1">
                                <p className="font-mono text-[11px] text-gray-300 break-all">{session.id}</p>
                                <button onClick={() => copyToClipboard(session.id, `id-${session.id}`)}
                                  className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors" aria-label="Copy session ID">
                                  {copiedId === `id-${session.id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <p className="font-mono text-[11px] text-blue-400 break-all">
                                  {typeof window !== "undefined" ? window.location.origin : ""}/session/{session.id}
                                </p>
                                <button onClick={() => copyToClipboard(`${window.location.origin}/session/${session.id}`, `url-${session.id}`)}
                                  className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors" aria-label="Copy session link">
                                  {copiedId === `url-${session.id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <button onClick={() => editingId === session.id ? setEditingId(null) : startEdit(session)}
                            className="text-gray-300 hover:text-gray-600 transition-colors" aria-label="Edit session">
                            {editingId === session.id ? <X size={15} /> : <Pencil size={15} />}
                          </button>
                          <button onClick={() => handleDeleteSession(session.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors" aria-label="Delete session">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {editingId === session.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Title</label>
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-gray-400 transition-colors" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Expiry</label>
                            <input type="datetime-local" value={editExpiresAt} onChange={(e) => setEditExpiresAt(e.target.value)}
                              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-gray-400 transition-colors" />
                          </div>
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input type="checkbox" checked={editAllowAddSignals} onChange={(e) => setEditAllowAddSignals(e.target.checked)} className="w-4 h-4 rounded" />
                            <span className="text-sm text-gray-600">Allow participants to add signals</span>
                          </label>
                          <button onClick={() => handleSaveEdit(session.id)} disabled={editSaving || !editTitle || !editExpiresAt}
                            className="w-full py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
                            {editSaving ? "Saving…" : "Save changes"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── DECKS TAB ── */}
        {activeTab === "decks" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Decks</h2>
              <button onClick={() => router.push("/admin/decks/new")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                + New Deck
              </button>
            </div>

            {loadingDecks ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : decks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No decks yet. Create one to get started.</div>
            ) : (
              <div className="space-y-3">
                {decks.map((deck) => (
                  <div key={deck.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{deck.title}</h3>
                          <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{deck.year}</span>
                        </div>
                        {deck.description && (
                          <p className="mt-1 text-xs text-gray-400 leading-relaxed line-clamp-2">{deck.description}</p>
                        )}
                      </div>
                      <button onClick={() => router.push(`/admin/decks/${deck.id}`)}
                        className="shrink-0 text-gray-300 hover:text-gray-600 transition-colors mt-0.5" aria-label="Edit deck">
                        <Pencil size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

