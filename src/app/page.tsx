"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { storeSession, getStoredSession, getDeviceId } from "@/hooks/useSession";

type Step = "session-id" | "checking" | "password" | "name" | "joining";

function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefillSessionId = searchParams.get("session") || "";

  const [step, setStep] = useState<Step>(prefillSessionId ? "checking" : "session-id");
  const [sessionId, setSessionId] = useState(prefillSessionId);
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Redirect if already in an active session
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      router.replace(`/session/${stored.sessionId}`);
    }
  }, [router]);

  const checkSession = useCallback(async (id: string) => {
    setStep("checking");
    setError(null);
    try {
      const res = await fetch(`/api/session/${id}/check`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Session not found");
        setStep("session-id");
        return;
      }
      setSessionId(id);
      setSessionTitle(data.title);
      setRequiresPassword(data.requiresPassword);
      setStep(data.requiresPassword ? "password" : "name");
    } catch {
      setError("Connection error. Please try again.");
      setStep("session-id");
    }
  }, []);

  // Auto-check when session ID is embedded in the URL
  useEffect(() => {
    if (prefillSessionId) {
      checkSession(prefillSessionId);
    }
  }, [prefillSessionId, checkSession]);

  const handleSessionIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = sessionIdInput.trim();
    if (!id) return;
    await checkSession(id);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError(null);
    try {
      const res = await fetch(`/api/session/${sessionId}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid password");
        return;
      }
      setStep("name");
    } catch {
      setError("Connection error. Please try again.");
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("joining");
    setError(null);
    try {
      const res = await fetch("/api/session/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": getDeviceId(),
        },
        body: JSON.stringify({
          sessionId,
          displayName: displayName.trim() || null,
          password: requiresPassword ? password.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join session");
        setStep("name");
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
      setStep("name");
    }
  };

  if (step === "checking" || step === "joining") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-widest text-gray-900 mb-2">SHUFFLE</h1>
          {step === "session-id" && (
            <p className="text-sm text-gray-400">Enter your session ID to begin</p>
          )}
          {step === "password" && (
            <>
              <p className="text-sm font-medium text-gray-700">{sessionTitle}</p>
              <p className="text-sm text-gray-400 mt-1">A password is required to join</p>
            </>
          )}
          {step === "name" && (
            <>
              <p className="text-sm font-medium text-gray-700">{sessionTitle}</p>
              <p className="text-sm text-gray-400 mt-1">What should we call you?</p>
            </>
          )}
        </div>

        {step === "session-id" && (
          <form onSubmit={handleSessionIdSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Session ID
              </label>
              <input
                type="text"
                value={sessionIdInput}
                onChange={(e) => setSessionIdInput(e.target.value)}
                placeholder="9ae95235-f086-4658-..."
                className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors font-mono"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={!sessionIdInput.trim()}
              className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter session password"
                className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Display Name{" "}
                <span className="text-gray-400 normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name, or leave blank to be anonymous"
                className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-gray-400 transition-colors"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              Join Session
            </button>
          </form>
        )}

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
