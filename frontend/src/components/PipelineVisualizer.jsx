const toneClasses = {
  done: {
    wrapper: "bg-emerald-50 ring-1 ring-emerald-200",
    badge: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
    text: "text-emerald-900",
    connector: "bg-emerald-200",
    marker: "border-emerald-300 bg-emerald-100 text-emerald-800",
  },
  active: {
    wrapper:
      "bg-[linear-gradient(135deg,rgba(219,232,244,0.95),rgba(255,255,255,0.98))] ring-2 ring-sky-300 shadow-[0_0_0_1px_rgba(97,167,214,0.22),0_0_40px_rgba(97,167,214,0.24)] animate-pulse",
    badge: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
    text: "text-sky-900",
    connector: "bg-sky-200",
    marker: "border-sky-300 bg-sky-100 text-sky-800",
  },
  pending: {
    wrapper: "bg-white ring-1 ring-slate-200",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    text: "text-slate-800",
    connector: "bg-slate-200",
    marker: "border-slate-200 bg-white text-slate-500",
  },
};

export default function PipelineVisualizer({ steps, metadata, showMetadata, isProcessing }) {
  const confidenceLabel = metadata.confidence || (isProcessing ? "Analyzing..." : "--");
  const confidenceWidth = metadata.confidence || "0%";

  return (
    <section className="flex h-full flex-col rounded-[26px] border border-white/70 bg-[var(--color-flow-panel)] p-4 shadow-[0_16px_44px_rgba(16,32,51,0.07)] backdrop-blur">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-flow-warm)]">
          Pipeline Visualizer
        </p>
        <h2 className="mt-1.5 text-xl font-semibold text-[var(--color-flow-ink)]">
          Layer-by-layer system progress
        </h2>
      </div>

      {showMetadata ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-white/90 p-3.5 shadow-sm ring-1 ring-[rgba(215,224,234,0.85)]">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-flow-slate)]">
              Document Type
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--color-flow-ink)]">
              {metadata.documentType}
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-3.5 shadow-sm ring-1 ring-[rgba(215,224,234,0.85)]">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-flow-slate)]">
                Confidence
              </p>
              <span className="rounded-full bg-[var(--color-flow-sky)] px-3 py-1 text-sm font-semibold text-sky-900">
                {confidenceLabel}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,#24486b,#61a7d6)]"
                style={{ width: confidenceWidth }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-1 flex-col gap-3.5">
        {steps.map((step, index) => {
          const tone = toneClasses[step.tone];
          const isLast = index === steps.length - 1;

          return (
            <div key={step.layer} className="flex min-w-0 gap-3.5">
              <div className="flex w-10 shrink-0 flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold shadow-sm ${tone.marker}`}
                >
                  {index + 1}
                </div>
                {!isLast ? (
                  <div className="my-1.5 w-0.5 flex-1 rounded-full bg-[var(--color-flow-line)]">
                    <div className={`h-full w-full rounded-full ${tone.connector}`} />
                  </div>
                ) : null}
              </div>

              <div
                className={`min-w-0 flex-1 rounded-[22px] p-4 transition ${tone.wrapper}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-flow-slate)]">
                      Layer {index + 1}
                    </p>
                    <h3 className="mt-1 text-[1.15rem] font-semibold leading-6 text-[var(--color-flow-ink)]">
                      {step.layer}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-[var(--color-flow-slate)]">
                      {step.model}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${tone.badge}`}>
                    {step.status}
                  </span>
                </div>

                <p className={`mt-3.5 max-w-[34ch] text-[15px] leading-6 ${tone.text}`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
