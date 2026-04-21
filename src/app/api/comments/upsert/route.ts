import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { participantId, signalId, comment } = await req.json();

  if (!participantId || !signalId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: participant } = await supabase
    .from("participants")
    .select("id, session_id, sessions(expires_at)")
    .eq("id", participantId)
    .single();

  if (!participant) {
    return NextResponse.json({ error: "Invalid participant" }, { status: 403 });
  }

  const expiresAt = ((participant.sessions as unknown) as { expires_at: string } | null)?.expires_at;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return NextResponse.json({ error: "Session has expired" }, { status: 410 });
  }

  if (!comment?.trim()) {
    await supabase
      .from("session_comments")
      .delete()
      .eq("participant_id", participantId)
      .eq("signal_id", signalId);
    return NextResponse.json({ deleted: true });
  }

  await supabase.from("session_comments").upsert(
    {
      participant_id: participantId,
      signal_id: signalId,
      session_id: participant.session_id,
      comment: comment.trim(),
    },
    { onConflict: "participant_id,signal_id" }
  );

  return NextResponse.json({ ok: true });
}
