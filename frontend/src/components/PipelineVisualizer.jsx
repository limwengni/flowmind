const toneClasses = {
  done: {
    wrapper: "bg-emerald-50 ring-1 ring-emerald-200",
    badge: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
    text: "text-emerald-900",
    connector: "bg-emerald-200",
  },
  active: {
    wrapper:
      "bg-[linear-gradient(135deg,rgba(219,232,244,0.95),rgba(255,255,255,0.98))] ring-2 ring-sky-300 shadow-[0_0_0_1px_rgba(97,167,214,0.22),0_0_40px_rgba(97,167,214,0.24)] animate-pulse",
    badge: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
    text: "text-sky-900",
    connector: "bg-sky-200",
  },
  pending: {
    wrapper: "bg-white ring-1 ring-slate-200",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    text: "text-slate-800",
    connector: "bg-slate-200",
  },
};

export default function PipelineVisualizer({ steps, metadata, showMetadata }) {
  return (
    <section className="rounded-[26px] border border-white/70 bg-[var(--color-flow-panel)] p-4 shadow-[0_16px_44px_rgba(16,32,51,0.07)] backdrop-blur">
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
            <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-flow-slate)]">
              Document Type
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-flow-ink)]">
              {metadata.documentType}
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-3.5 shadow-sm ring-1 ring-[rgba(215,224,234,0.85)]">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-flow-slate)]">
                Confidence
              </p>
              <span className="rounded-full bg-[var(--color-flow-sky)] px-3 py-1 text-sm font-semibold text-sky-900">
                {metadata.confidence}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,#24486b,#61a7d6)]"
                style={{ width: metadata.confidence }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2.5 xl:flex-row xl:items-stretch xl:gap-2.5">
        {steps.map((step, index) => {
          const tone = toneClasses[step.tone];

          return (
            <div
              key={step.layer}
              className="flex flex-col gap-3 xl:min-w-0 xl:flex-1 xl:flex-row xl:items-center"
            >
              <div
                className={`min-h-[138px] rounded-[20px] p-3.5 transition xl:flex-1 ${tone.wrapper}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-flow-slate)]">
                      Layer {index + 1}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold text-[var(--color-flow-ink)]">
                      {step.layer}
                    </h3>
                    <p className="mt-1.5 text-sm text-[var(--color-flow-slate)]">
                      {step.model}
                    </p>
                  </div>
                  <span className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${tone.badge}`}>
                    {step.status}
                  </span>
                </div>

                <p className={`mt-4 text-[15px] leading-6 ${tone.text}`}>
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 ? (
                <>
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-flow-line)] bg-white xl:hidden">
                    <div className={`h-4 w-1 rounded-full ${tone.connector}`} />
                  </div>
                  <div className="hidden xl:flex xl:w-7 xl:items-center xl:justify-center">
                    <div className={`h-1 w-full rounded-full ${tone.connector}`} />
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
