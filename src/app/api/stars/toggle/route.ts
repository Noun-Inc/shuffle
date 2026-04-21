import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { participantId, signalId } = await req.json();

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

  const sessionId = participant.session_id;

  const { data: existing } = await supabase
    .from("session_stars")
    .select("participant_id")
    .eq("participant_id", participantId)
    .eq("signal_id", signalId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("session_stars")
      .delete()
      .eq("participant_id", participantId)
      .eq("signal_id", signalId);
    return NextResponse.json({ starred: false });
  } else {
    await supabase.from("session_stars").insert({
      participant_id: participantId,
      signal_id: signalId,
      session_id: sessionId,
    });
    return NextResponse.json({ starred: true });
  }
}
