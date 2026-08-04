import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default function LoginPage() {
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState("");

  function handleLogin() {
    window.location.href = `${API_BASE}/auth/login`;
  }

  async function handleGuest() {
    setIsGuestLoading(true);
    setGuestError("");
    try {
      const response = await fetch(`${API_BASE}/auth/guest`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || "Demo mode is unavailable right now.");
      }
      window.location.reload();
    } catch (error) {
      setGuestError(error instanceof Error ? error.message : "Demo mode is unavailable right now.");
      setIsGuestLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,252,0.82))] p-10 shadow-[0_22px_60px_rgba(16,32,51,0.08)] flex flex-col items-center gap-6 text-center">
          <p className="text-4xl font-semibold tracking-tight text-[var(--color-flow-ink)]">
            FlowMind
          </p>
          <p className="text-base font-medium leading-7 text-[var(--color-flow-slate)]">
            Sign in to turn your messy notes into execution-ready output.
          </p>
          <button
            onClick={handleLogin}
            className="mt-2 w-full rounded-2xl bg-[var(--color-flow-ink)] px-6 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            Sign in with Chutes
          </button>
          <div className="flex w-full items-center gap-3 text-xs text-[var(--color-flow-slate)]">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <button
            onClick={handleGuest}
            disabled={isGuestLoading}
            className="w-full rounded-2xl border border-[var(--color-flow-ink)]/15 bg-white/70 px-6 py-3 text-base font-semibold text-[var(--color-flow-ink)] transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
          >
            {isGuestLoading ? "Starting demo…" : "Continue as guest"}
          </button>
          {guestError ? <p className="text-sm text-rose-700">{guestError}</p> : null}
          <p className="text-xs leading-5 text-[var(--color-flow-slate)]">
            Try FlowMind with sample AI output. Your work is not saved.
          </p>
        </div>
      </div>
    </div>
  );
}
