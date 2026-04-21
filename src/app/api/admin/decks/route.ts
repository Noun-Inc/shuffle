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

// GET /api/admin/decks — list all decks
export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("decks")
    .select("id, slug, title, year, description, is_active, sort_order")
    .order("sort_order");

  if (error) return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST /api/admin/decks — create a new deck
export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, year, description, slug } = await req.json();
  if (!title?.trim() || !year || !slug?.trim()) {
    return NextResponse.json({ error: "title, year, and slug are required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("decks")
    .insert({ title: title.trim(), year: Number(year), description: description?.trim() || null, slug: slug.trim(), is_active: true })
    .select("id, slug, title, year, description")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create deck" }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
