"use client";

const SESSION_KEY = "shuffle-session";
const DEVICE_ID_KEY = "shuffle-device-id";

export interface ParticipantSession {
  participantId: string;
  sessionId: string;
  sessionTitle: string;
  displayName: string | null;
  allowAddSignals: boolean;
  expiresAt: string;
}

export function getStoredSession(): ParticipantSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as ParticipantSession;
    if (new Date(s.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function storeSession(session: ParticipantSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
