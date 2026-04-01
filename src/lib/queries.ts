import { supabase, getDeviceId } from "./supabase";
import type { Signal, SignalImage } from "@/data/signals";

// ============================================================
// DECK QUERIES
// ============================================================

export async function fetchDecks() {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function fetchDeckBySlug(slug: string) {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// SIGNAL QUERIES
// ============================================================

interface DbSignal {
  id: string;
  deck_id: string;
  number: number;
  title: string;
  body: string;
  category: string | null;
  tags: string[];
  year: number;
  reference: string | null;
  focal_hint: string | null;
  status: string;
  sort_order: number;
  signal_images: DbSignalImage[];
}

interface DbSignalImage {
  id: string;
  url: string;
  thumb_url: string | null;
  alt: string | null;
  source: string | null;
  source_label: string | null;
  sort_order: number;
}

/** Transform DB row to app Signal type */
function toSignal(row: DbSignal): Signal {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    body: row.body,
    images: (row.signal_images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(
        (img): SignalImage => ({
          url: img.url,
          thumbUrl: img.thumb_url || undefined,
          alt: img.alt || undefined,
          source: img.source || undefined,
          sourceLabel: img.source_label || undefined,
        })
      ),
    category: row.category || undefined,
    tags: row.tags || [],
    year: row.year,
    reference: row.reference || undefined,
    focalHint: row.focal_hint || undefined,
  };
}

/** Fetch all published signals for a deck, with images */
export async function fetchDeckSignals(
  deckSlug: string
): Promise<{ signals: Signal[]; categories: string[] }> {
  // First get the deck
  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("slug", deckSlug)
    .single();

  if (!deck) return { signals: [], categories: [] };

  // Try with images joined first
  let { data, error } = await supabase
    .from("signals")
    .select("*, signal_images(*)")
    .eq("deck_id", deck.id)
    .eq("status", "published")
    .order("number");

  // If the join fails (e.g. signal_images RLS), fall back to signals only
  if (error) {
    console.warn("fetchDeckSignals: joined query failed, retrying without images:", error.message);
    ({ data, error } = await supabase
      .from("signals")
      .select("*")
      .eq("deck_id", deck.id)
      .eq("status", "published")
      .order("number"));
  }

  if (error) throw error;

  const signals = (data || []).map((row) =>
    toSignal({ ...row, signal_images: row.signal_images ?? [] })
  );
  const categories = [
    ...new Set(signals.map((s) => s.category).filter(Boolean) as string[]),
  ].sort();

  return { signals, categories };
}

/** Fetch drafts for a deck */
export async function fetchDrafts(deckSlug: string): Promise<Signal[]> {
  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("slug", deckSlug)
    .single();

  if (!deck) return [];

  const { data, error } = await supabase
    .from("signals")
    .select("*, signal_images(*)")
    .eq("deck_id", deck.id)
    .eq("status", "draft")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toSignal);
}

/** Get next available signal number for a deck */
export async function getNextNumber(deckSlug: string): Promise<number> {
  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("slug", deckSlug)
    .single();

  if (!deck) return 1;

  const { data } = await supabase
    .from("signals")
    .select("number")
    .eq("deck_id", deck.id)
    .order("number", { ascending: false })
    .limit(1);

  return (data?.[0]?.number || 0) + 1;
}

// ============================================================
// SIGNAL MUTATIONS
// ============================================================

interface SignalInput {
  id?: string;
  deckSlug: string;
  number: number;
  title: string;
  body: string;
  category?: string;
  tags?: string[];
  year: number;
  reference?: string;
  focalHint?: string;
  status: "draft" | "published";
  images: {
    url: string;
    thumbUrl?: string;
    alt?: string;
    source?: string;
    sourceLabel?: string;
  }[];
}

export async function upsertSignal(input: SignalInput): Promise<Signal> {
  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("slug", input.deckSlug)
    .single();

  if (!deck) throw new Error(`Deck not found: ${input.deckSlug}`);

  const signalData = {
    deck_id: deck.id,
    number: input.number,
    title: input.title,
    body: input.body,
    category: input.category || null,
    tags: input.tags || [],
    year: input.year,
    reference: input.reference || null,
    focal_hint: input.focalHint || null,
    status: input.status,
  };

  let signalId: string;

  if (input.id) {
    // Update existing
    const { data, error } = await supabase
      .from("signals")
      .update(signalData)
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw error;
    signalId = data.id;

    // Delete old images and re-insert
    await supabase.from("signal_images").delete().eq("signal_id", signalId);
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("signals")
      .insert(signalData)
      .select()
      .single();

    if (error) throw error;
    signalId = data.id;
  }

  // Insert images
  if (input.images.length > 0) {
    const imageRows = input.images.map((img, i) => ({
      signal_id: signalId,
      url: img.url,
      thumb_url: img.thumbUrl || null,
      alt: img.alt || null,
      source: img.source || null,
      source_label: img.sourceLabel || null,
      sort_order: i,
    }));

    await supabase.from("signal_images").insert(imageRows);
  }

  // Fetch and return the complete signal
  const { data: full } = await supabase
    .from("signals")
    .select("*, signal_images(*)")
    .eq("id", signalId)
    .single();

  return toSignal(full!);
}

export async function deleteSignal(id: string) {
  const { error } = await supabase.from("signals").delete().eq("id", id);
  if (error) throw error;
}

export async function publishSignal(id: string) {
  const { error } = await supabase
    .from("signals")
    .update({ status: "published" })
    .eq("id", id);
  if (error) throw error;
}

// ============================================================
// IMAGE UPLOAD
// ============================================================

export async function uploadSignalImage(
  file: File,
  signalId: string,
  index: number
): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const filename = `${signalId}_${index}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("signal-images")
    .upload(`full/${filename}`, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("signal-images").getPublicUrl(`full/${filename}`);

  return publicUrl;
}

// ============================================================
// DEVICE-BASED STARS & COMMENTS
// ============================================================

export async function fetchStars(): Promise<Set<string>> {
  const deviceId = getDeviceId();
  if (!deviceId) return new Set();

  const { data } = await supabase
    .from("device_stars")
    .select("signal_id")
    .eq("device_id", deviceId);

  return new Set((data || []).map((r) => r.signal_id));
}

export async function toggleStar(signalId: string): Promise<boolean> {
  const deviceId = getDeviceId();

  // Check if already starred
  const { data: existing } = await supabase
    .from("device_stars")
    .select("signal_id")
    .eq("device_id", deviceId)
    .eq("signal_id", signalId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("device_stars")
      .delete()
      .eq("device_id", deviceId)
      .eq("signal_id", signalId);
    return false; // unstarred
  } else {
    await supabase
      .from("device_stars")
      .insert({ device_id: deviceId, signal_id: signalId });
    return true; // starred
  }
}

export async function fetchComments(): Promise<Record<string, string>> {
  const deviceId = getDeviceId();
  if (!deviceId) return {};

  const { data } = await supabase
    .from("device_comments")
    .select("signal_id, comment")
    .eq("device_id", deviceId);

  const comments: Record<string, string> = {};
  for (const row of data || []) {
    comments[row.signal_id] = row.comment;
  }
  return comments;
}

export async function upsertComment(
  signalId: string,
  text: string
): Promise<void> {
  const deviceId = getDeviceId();

  if (!text.trim()) {
    // Delete comment
    await supabase
      .from("device_comments")
      .delete()
      .eq("device_id", deviceId)
      .eq("signal_id", signalId);
    return;
  }

  await supabase.from("device_comments").upsert(
    {
      device_id: deviceId,
      signal_id: signalId,
      comment: text,
    },
    { onConflict: "device_id,signal_id" }
  );
}
