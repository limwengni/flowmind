export default function LoginPage() {
  function handleLogin() {
    window.location.href = "http://localhost:8000/auth/login";
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
        </div>
      </div>
    </div>
  );
}
