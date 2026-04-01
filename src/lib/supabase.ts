import { createClient } from "@supabase/supabase-js";

// The anon key is a PUBLIC key — it's safe to commit.
// RLS policies protect the data, not this key.
// Hardcoded as fallback so deploys work even if env vars aren't set.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://eowgaerqzwxvyyqzqgvo.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvd2dhZXJxend4dnl5cXpxZ3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMTkzOTksImV4cCI6MjA5MDU5NTM5OX0.um7OHk-HVKJoyadjgl4vi-bsye_KZ0Ja4ZB7FG99OhY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Device ID for pre-auth user data (stars/comments)
const DEVICE_ID_KEY = "shuffle-device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
