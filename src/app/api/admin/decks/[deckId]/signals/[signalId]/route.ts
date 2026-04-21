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

// PATCH /api/admin/decks/[deckId]/signals/[signalId] — update a signal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; signalId: string }> }
) {
  const { signalId } = await params;
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body, category, year, reference, images } = await req.json();
  const supabase = createServerClient();

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (body !== undefined) updates.body = body;
  if (category !== undefined) updates.category = category || null;
  if (year !== undefined) updates.year = year;
  if (reference !== undefined) updates.reference = reference || null;

  const { error } = await supabase
    .from("signals")
    .update(updates)
    .eq("id", signalId);

  if (error) return NextResponse.json({ error: "Failed to update signal" }, { status: 500 });

  // Replace images if provided
  if (images !== undefined) {
    await supabase.from("signal_images").delete().eq("signal_id", signalId);
    if (images.length > 0) {
      const imageRows = images.map((img: { url: string; thumbUrl?: string; alt?: string; source?: string; sourceLabel?: string }, i: number) => ({
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
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/decks/[deckId]/signals/[signalId] — delete a signal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string; signalId: string }> }
) {
  const { signalId } = await params;
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();
  const { error } = await supabase.from("signals").delete().eq("id", signalId);
  if (error) return NextResponse.json({ error: "Failed to delete signal" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
