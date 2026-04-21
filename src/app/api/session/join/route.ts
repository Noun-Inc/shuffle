import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { sessionId, password, displayName } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const deviceId = req.headers.get("x-device-id");
  if (!deviceId) {
    return NextResponse.json({ error: "Device ID required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: "Session has expired" }, { status: 410 });
  }

  if (session.allow_add_signals) {
    if (!password || password !== session.join_password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 403 });
    }
  }

  // Return existing participant if this device already joined
  const { data: existing } = await supabase
    .from("participants")
    .select("*")
    .eq("session_id", sessionId)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (existing) {
    if (displayName !== undefined && displayName !== existing.display_name) {
      await supabase
        .from("participants")
        .update({ display_name: displayName || null })
        .eq("id", existing.id);
    }
    return NextResponse.json({
      participantId: existing.id,
      sessionId: session.id,
      sessionTitle: session.title,
      displayName: displayName ?? existing.display_name,
      allowAddSignals: session.allow_add_signals,
      expiresAt: session.expires_at,
    });
  }

  const { data: participant, error: insertError } = await supabase
    .from("participants")
    .insert({
      session_id: sessionId,
      display_name: displayName || null,
      device_id: deviceId,
    })
    .select()
    .single();

  if (insertError || !participant) {
    return NextResponse.json({ error: "Failed to join session" }, { status: 500 });
  }

  return NextResponse.json({
    participantId: participant.id,
    sessionId: session.id,
    sessionTitle: session.title,
    displayName: participant.display_name,
    allowAddSignals: session.allow_add_signals,
    expiresAt: session.expires_at,
  });
}
