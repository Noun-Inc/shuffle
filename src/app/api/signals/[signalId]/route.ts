import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ signalId: string }> }
) {
  const { signalId } = await params;
  const participantId = req.nextUrl.searchParams.get("participantId");

  if (!participantId) {
    return NextResponse.json({ error: "Participant ID required" }, { status: 400 });
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

  // Verify the signal belongs to the participant's session
  const { data: signal } = await supabase
    .from("signals")
    .select("id, session_id")
    .eq("id", signalId)
    .single();

  if (!signal || signal.session_id !== participant.session_id) {
    return NextResponse.json(
      { error: "Signal not found in your session" },
      { status: 404 }
    );
  }

  const { error } = await supabase.from("signals").delete().eq("id", signalId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete signal" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
