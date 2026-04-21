import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { User } from "@supabase/supabase-js";

async function verifyAdmin(req: NextRequest): Promise<User | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const supabase = createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!user.email?.endsWith("@noun.global")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServerClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, decks(title)")
    .order("created_at", { ascending: false });

  const sessionIds = (sessions || []).map((s) => s.id);
  const { data: participantRows } = await supabase
    .from("participants")
    .select("session_id")
    .in("session_id", sessionIds);

  const countBySession: Record<string, number> = {};
  for (const p of participantRows || []) {
    countBySession[p.session_id] = (countBySession[p.session_id] || 0) + 1;
  }

  return NextResponse.json(
    (sessions || []).map((s) => ({
      id: s.id,
      title: s.title,
      deckTitle: (s.decks as { title: string } | null)?.title,
      expiresAt: s.expires_at,
      allowAddSignals: s.allow_add_signals,
      joinPassword: s.join_password,
      participantCount: countBySession[s.id] || 0,
      createdAt: s.created_at,
    }))
  );
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!user.email?.endsWith("@noun.global")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, expiresAt, deckId, allowAddSignals } = await req.json();

  if (!title || !expiresAt || !deckId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const joinPassword = allowAddSignals
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()
    : null;

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      title,
      deck_id: deckId,
      expires_at: expiresAt,
      allow_add_signals: allowAddSignals,
      join_password: joinPassword,
    })
    .select()
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  return NextResponse.json(
    {
      session: {
        id: session.id,
        title: session.title,
        expiresAt: session.expires_at,
        allowAddSignals: session.allow_add_signals,
        joinPassword: session.join_password,
      },
    },
    { status: 201 }
  );
}
