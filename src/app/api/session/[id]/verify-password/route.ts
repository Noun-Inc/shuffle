import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  checkPasswordRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  getRequestIdentifier,
} from "@/lib/rateLimiter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { password } = await req.json();

  const supabase = createServerClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("expires_at, allow_add_signals, join_password")
    .eq("id", id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: "Session has expired" }, { status: 410 });
  }

  if (!session.allow_add_signals) {
    return NextResponse.json({ valid: true });
  }

  const identifier = getRequestIdentifier(req);

  const { locked, remainingSeconds } = await checkPasswordRateLimit(id, identifier);
  if (locked) {
    const minutes = Math.ceil(remainingSeconds! / 60);
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` },
      { status: 429 }
    );
  }

  if (!password || password !== session.join_password) {
    const { attemptsLeft } = await recordFailedAttempt(id, identifier);
    const message = attemptsLeft > 0
      ? `Invalid password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`
      : "Invalid password. You have been locked out for 15 minutes.";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  await clearFailedAttempts(id, identifier);
  return NextResponse.json({ valid: true });
}
