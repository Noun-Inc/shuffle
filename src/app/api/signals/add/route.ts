import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { participantId, title, body, category, year, reference, images } =
    await req.json();

  if (!participantId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: participant } = await supabase
    .from("participants")
    .select("id, session_id, sessions(expires_at, allow_add_signals)")
    .eq("id", participantId)
    .single();

  if (!participant) {
    return NextResponse.json({ error: "Invalid participant" }, { status: 403 });
  }

  const sess = (participant.sessions as unknown) as {
    expires_at: string;
    allow_add_signals: boolean;
  } | null;

  if (sess?.expires_at && new Date(sess.expires_at) < new Date()) {
    return NextResponse.json({ error: "Session has expired" }, { status: 410 });
  }

  if (!sess?.allow_add_signals) {
    return NextResponse.json(
      { error: "This session does not allow adding signals" },
      { status: 403 }
    );
  }

  const sessionId = participant.session_id;

  const { data: signal, error } = await supabase
    .from("signals")
    .insert({
      session_id: sessionId,
      deck_id: null,
      number: null, // assigned at display time, after deck signal numbers
      title,
      body: body || "",
      category: category || null,
      year: year || new Date().getFullYear(),
      reference: reference || null,
      status: "published",
      is_participant_added: true,
    })
    .select()
    .single();

  if (error || !signal) {
    return NextResponse.json({ error: "Failed to create signal", detail: error?.message }, { status: 500 });
  }

  if (images?.length > 0) {
    await supabase.from("signal_images").insert(
      images.map(
        (
          img: {
            url: string;
            thumbUrl?: string;
            alt?: string;
            source?: string;
            sourceLabel?: string;
          },
          i: number
        ) => ({
          signal_id: signal.id,
          url: img.url,
          thumb_url: img.thumbUrl || null,
          alt: img.alt || null,
          source: img.source || null,
          source_label: img.sourceLabel || null,
          sort_order: i,
        })
      )
    );
  }

  return NextResponse.json({ signalId: signal.id }, { status: 201 });
}
