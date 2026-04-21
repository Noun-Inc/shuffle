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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();

  const { error } = await supabase.from("sessions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, expiresAt, allowAddSignals } = await req.json();
  const supabase = createServerClient();

  const updates: Record<string, unknown> = {};
  if (title) updates.title = title;
  if (expiresAt) updates.expires_at = expiresAt;
  if (allowAddSignals !== undefined) updates.allow_add_signals = allowAddSignals;

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
