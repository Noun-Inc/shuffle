import { supabase } from "./supabase";

// ============================================================
// DECK QUERIES (anon client — master deck content only)
// ============================================================

export interface Deck {
  id: string;
  slug: string;
  title: string;
  year: number;
  description?: string;
}

export async function fetchDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("id, slug, title, year, description")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data || [];
}

// ============================================================
// IMAGE UPLOAD (anon client — Supabase Storage)
// Uploads directly from the browser; the storage bucket allows anon uploads.
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
