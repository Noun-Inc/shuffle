import { createServerClient } from "@/lib/supabase-server";
import type { NextRequest } from "next/server";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export function getRequestIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

/** Returns locked=true with remaining seconds if the identifier is currently locked out. */
export async function checkPasswordRateLimit(
  sessionId: string,
  identifier: string
): Promise<{ locked: boolean; remainingSeconds?: number }> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("password_attempts")
    .select("locked_until")
    .eq("session_id", sessionId)
    .eq("identifier", identifier)
    .maybeSingle();

  if (!data?.locked_until) return { locked: false };

  const lockedUntil = new Date(data.locked_until);
  if (lockedUntil <= new Date()) return { locked: false };

  const remainingSeconds = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
  return { locked: true, remainingSeconds };
}

/**
 * Records a failed password attempt and applies a lockout after MAX_ATTEMPTS.
 * Returns the number of attempts remaining before lockout, or 0 if now locked.
 */
export async function recordFailedAttempt(
  sessionId: string,
  identifier: string
): Promise<{ nowLocked: boolean; attemptsLeft: number }> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("password_attempts")
    .select("failed_attempts, locked_until")
    .eq("session_id", sessionId)
    .eq("identifier", identifier)
    .maybeSingle();

  // Reset count if this is a fresh start or a previously expired lockout
  const lockoutExpired = data?.locked_until && new Date(data.locked_until) <= new Date();
  const newAttempts = data && !lockoutExpired ? data.failed_attempts + 1 : 1;

  const nowLocked = newAttempts >= MAX_ATTEMPTS;
  const lockedUntil = nowLocked
    ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
    : null;

  await supabase.from("password_attempts").upsert(
    {
      session_id: sessionId,
      identifier,
      failed_attempts: newAttempts,
      locked_until: lockedUntil,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,identifier" }
  );

  return { nowLocked, attemptsLeft: Math.max(0, MAX_ATTEMPTS - newAttempts) };
}

/** Clears the attempt counter after a successful login. */
export async function clearFailedAttempts(
  sessionId: string,
  identifier: string
): Promise<void> {
  const supabase = createServerClient();
  await supabase
    .from("password_attempts")
    .delete()
    .eq("session_id", sessionId)
    .eq("identifier", identifier);
}
