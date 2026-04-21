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

// GET /api/admin/decks/[deckId] — fetch single deck details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deckId } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("decks")
    .select("id, slug, title, year, description, is_active, sort_order")
    .eq("id", deckId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH /api/admin/decks/[deckId] — update deck metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deckId } = await params;
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.year !== undefined) updates.year = Number(body.year);
  if (body.description !== undefined) updates.description = body.description || null;
  updates.updated_at = new Date().toISOString();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("decks")
    .update(updates)
    .eq("id", deckId)
    .select("id, slug, title, year, description")
    .single();

  if (error) return NextResponse.json({ error: "Failed to update deck" }, { status: 500 });
  return NextResponse.json(data);
}
