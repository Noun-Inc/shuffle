"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { storeSession, getStoredSession, getDeviceId } from "@/hooks/useSession";

function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefillSessionId = searchParams.get("session") || "";

  const [sessionId, setSessionId] = useState(prefillSessionId);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already in an active session
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      router.replace(`/session/${stored.sessionId}`);
    }
  }, [router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/session/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": getDeviceId(),
        },
        body: JSON.stringify({
          sessionId: sessionId.trim(),
          displayName: displayName.trim() || null,
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && !requiresPassword) {
          setRequiresPassword(true);
          setError("This session requires a password.");
        } else {
          setError(data.error || "Failed to join session");
        }
        setLoading(false);
        return;
      }

      storeSession({
        participantId: data.participantId,
        sessionId: data.sessionId,
        sessionTitle: data.sessionTitle,
        displayName: data.displayName,
        allowAddSignals: data.allowAddSignals,
        expiresAt: data.expiresAt,
      });

      router.push(`/session/${data.sessionId}`);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-widest text-gray-900 mb-2">
            SHUFFLE
          </h1>
          <p className="text-sm text-gray-400">Enter your session ID to begin</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Session ID
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="9ae95235-f086-4658-..."
              className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors font-mono"
              autoFocus={!prefillSessionId}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Display Name{" "}
              <span className="text-gray-400 normal-case font-normal">
                (optional — leave blank to be anonymous)
              </span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {requiresPassword && (
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Session Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !sessionId.trim()}
            className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Session"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/admin")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Admin Login →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <LoginPage />
    </Suspense>
  );
}
