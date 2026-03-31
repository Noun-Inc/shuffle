"use client";

import { useState, useEffect } from "react";

const PASS = "t!nynoun";
const STORAGE_KEY = "shuffle-auth";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASS) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
      setInput("");
    }
  };

  if (checking) return null;
  if (authenticated) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-6 z-[100]">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-lg font-bold tracking-widest text-gray-900 mb-1">
          SHUFFLE
        </h1>
        <p className="text-xs text-gray-400 mb-8">Enter password to continue</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Password"
            autoFocus
            className={`w-full text-center text-sm px-4 py-3 rounded-xl border-2 outline-none transition-colors ${
              error
                ? "border-red-300 bg-red-50"
                : "border-gray-200 focus:border-gray-400"
            }`}
          />
          {error && (
            <p className="text-xs text-red-500 mt-2">Incorrect password</p>
          )}
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
