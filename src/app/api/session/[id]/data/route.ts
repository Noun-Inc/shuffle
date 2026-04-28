import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const participantId = req.nextUrl.searchParams.get("participantId");

  if (!participantId) {
    return NextResponse.json({ error: "Participant ID required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verify participant belongs to this session
  const { data: participant } = await supabase
    .from("participants")
    .select("id, session_id")
    .eq("id", participantId)
    .eq("session_id", sessionId)
    .single();

  if (!participant) {
    return NextResponse.json({ error: "Invalid participant" }, { status: 403 });
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id, title, expires_at, allow_add_signals")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: "Session has expired" }, { status: 410 });
  }

  // All signals for this session (deck copies + participant-added)
  const { data: allSignalRows } = await supabase
    .from("signals")
    .select("*, signal_images(*)")
    .eq("session_id", sessionId)
    .eq("status", "published");

  const rows = allSignalRows || [];
  // Deck copies keep their original numbers; participant-added signals get numbers assigned below
  const deckRows = rows
    .filter((r) => !r.is_participant_added)
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
  const participantRows = rows
    .filter((r) => r.is_participant_added)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const deckMaxNumber = deckRows.reduce((max, r) => Math.max(max, r.number ?? 0), 0);
  const numberedParticipantRows = participantRows.map((r, i) => ({ ...r, number: deckMaxNumber + i + 1 }));

  const signalRows = [...deckRows, ...numberedParticipantRows];

  // Fetch all stars for this session
  const { data: stars } = await supabase
    .from("session_stars")
    .select("participant_id, signal_id")
    .eq("session_id", sessionId);

  // Fetch all comments with participant display names
  const { data: comments } = await supabase
    .from("session_comments")
    .select("participant_id, signal_id, comment, updated_at, participants(display_name)")
    .eq("session_id", sessionId);

  // Build starsBySignal
  const starsBySignal: Record<string, { count: number; myStarred: boolean }> = {};
  for (const star of stars || []) {
    if (!starsBySignal[star.signal_id]) {
      starsBySignal[star.signal_id] = { count: 0, myStarred: false };
    }
    starsBySignal[star.signal_id].count++;
    if (star.participant_id === participantId) {
      starsBySignal[star.signal_id].myStarred = true;
    }
  }

  // Build commentsBySignal
  const commentsBySignal: Record<
    string,
    Array<{ participantId: string; displayName: string | null; comment: string; updatedAt: string }>
  > = {};
  for (const c of comments || []) {
    if (!commentsBySignal[c.signal_id]) commentsBySignal[c.signal_id] = [];
    commentsBySignal[c.signal_id].push({
      participantId: c.participant_id,
      displayName: ((c.participants as unknown) as { display_name: string | null } | null)?.display_name ?? null,
      comment: c.comment,
      updatedAt: c.updated_at,
    });
  }

  // Transform signals
  const signals = signalRows.map((row) => ({
    id: row.id,
    number: row.number,
    title: row.title,
    body: row.body,
    category: row.category || undefined,
    tags: row.tags || [],
    year: row.year,
    reference: row.reference || undefined,
    focalHint: row.focal_hint || undefined,
    isParticipantSignal: row.is_participant_added,
    images: ((row.signal_images as Array<{
      url: string; thumb_url: string | null; alt: string | null;
      source: string | null; source_label: string | null; sort_order: number;
    }>) || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        url: img.url,
        thumbUrl: img.thumb_url || undefined,
        alt: img.alt || undefined,
        source: img.source || undefined,
        sourceLabel: img.source_label || undefined,
      })),
  }));

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      expiresAt: session.expires_at,
      allowAddSignals: session.allow_add_signals,
    },
    signals,
    starsBySignal,
    commentsBySignal,
  });
}
