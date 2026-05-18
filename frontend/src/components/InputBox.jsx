export default function InputBox({ value, onChange, onProcess }) {
  return (
    <section className="rounded-[26px] border border-white/70 bg-[var(--color-flow-panel)] p-5 shadow-[0_16px_44px_rgba(16,32,51,0.07)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-flow-warm)]">
            Input
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--color-flow-ink)]">
            Source Material
          </h2>
        </div>
        <div className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[var(--color-flow-slate)] shadow-sm">
          Step 1
        </div>
      </div>

      <p className="mt-3 max-w-2xl text-base leading-6 text-[var(--color-flow-slate)]">
        Drop in raw meeting notes, project briefs, or other messy text.
      </p>

      <textarea
        className="mt-5 min-h-[260px] w-full rounded-[22px] bg-white px-5 py-4 text-base leading-7 text-[var(--color-flow-ink)] shadow-[inset_0_0_0_1px_rgba(215,224,234,0.85)] outline-none transition focus:shadow-[inset_0_0_0_1px_var(--color-flow-warm)]"
        placeholder="Paste meeting notes / messy text here"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      <div className="mt-5 flex justify-end">
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(135deg,#d37231,#b64e22)] px-6 py-3 text-base font-semibold text-white shadow-[0_14px_30px_rgba(201,106,44,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_36px_rgba(201,106,44,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-flow-warm)] focus-visible:ring-offset-2 active:translate-y-0"
          type="button"
          onClick={onProcess}
        >
          Process
        </button>
      </div>
    </section>
  );
}
