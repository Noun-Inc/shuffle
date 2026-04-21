import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || !user.email?.endsWith("@noun.global")) return null;
  return user;
}

// GET /api/admin/decks/[deckId]/signals — list all signals in a deck
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const { deckId } = await params;
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("signals")
    .select("*, signal_images(*)")
    .eq("deck_id", deckId)
    .order("number");

  if (error) return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });

  const signals = (data || []).map((row) => ({
    id: row.id,
    number: row.number,
    title: row.title,
    body: row.body,
    category: row.category,
    year: row.year,
    reference: row.reference,
    status: row.status,
    focalHint: row.focal_hint,
    images: ((row.signal_images as Array<{
      id: string; url: string; thumb_url: string | null; alt: string | null;
      source: string | null; source_label: string | null; sort_order: number;
    }>) || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        thumbUrl: img.thumb_url,
        alt: img.alt,
        source: img.source,
        sourceLabel: img.source_label,
        sortOrder: img.sort_order,
      })),
  }));

  return NextResponse.json(signals);
}

// POST /api/admin/decks/[deckId]/signals — create a new signal in this deck
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const { deckId } = await params;
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body, category, year, reference, images } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Get next number for this deck
  const { data: maxRow } = await supabase
    .from("signals")
    .select("number")
    .eq("deck_id", deckId)
    .order("number", { ascending: false })
    .limit(1)
    .single();

  const nextNumber = (maxRow?.number ?? 0) + 1;

  const { data: signal, error: signalError } = await supabase
    .from("signals")
    .insert({
      deck_id: deckId,
      session_id: null,
      number: nextNumber,
      title,
      body,
      category: category || null,
      year: year || new Date().getFullYear(),
      reference: reference || null,
      status: "published",
    })
    .select()
    .single();

  if (signalError || !signal) {
    return NextResponse.json({ error: "Failed to create signal" }, { status: 500 });
  }

  // Insert images
  if (images && images.length > 0) {
    const imageRows = images.map((img: { url: string; alt?: string; source?: string; sourceLabel?: string }, i: number) => ({
      signal_id: signal.id,
      url: img.url,
      alt: img.alt || null,
      source: img.source || null,
      source_label: img.sourceLabel || null,
      sort_order: i,
    }));
    await supabase.from("signal_images").insert(imageRows);
  }

  return NextResponse.json({ signalId: signal.id }, { status: 201 });
}
