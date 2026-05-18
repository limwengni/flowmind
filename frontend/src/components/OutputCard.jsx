export default function OutputCard({ data }) {
  return (
    <section className="rounded-[28px] border border-[rgba(16,32,51,0.08)] bg-white p-5 shadow-[0_18px_60px_rgba(16,32,51,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--color-flow-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-flow-warm)]">
            Output Card
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-flow-ink)]">
            FlowMind Output Card
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-[var(--color-flow-sky)] px-4 py-2 text-sm font-semibold text-sky-900">
            Confidence: {data.confidence}
          </span>
          <span className="rounded-full bg-[var(--color-flow-mint)] px-4 py-2 text-sm font-semibold text-emerald-900">
            Input Type: {data.inputType}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <article className="rounded-[24px] bg-slate-50/80 p-6 shadow-sm ring-1 ring-[rgba(215,224,234,0.7)]">
          <h3 className="text-lg font-semibold text-[var(--color-flow-ink)]">Summary</h3>
          <p className="mt-3 text-base leading-7 text-[var(--color-flow-slate)]">
            {data.summary}
          </p>
        </article>

        <article className="rounded-[24px] bg-slate-50/60 p-5 shadow-sm ring-1 ring-[rgba(215,224,234,0.6)]">
          <h3 className="text-lg font-semibold text-[var(--color-flow-ink)]">Next Action</h3>
          <p className="mt-3 rounded-2xl bg-[linear-gradient(135deg,#102033,#284d74)] px-4 py-4 text-base leading-7 text-white shadow-[0_18px_40px_rgba(16,32,51,0.20)]">
            {data.nextAction}
          </p>
        </article>

        <article className="rounded-[24px] bg-slate-50/60 p-5 shadow-sm ring-1 ring-[rgba(215,224,234,0.6)]">
          <h3 className="text-lg font-semibold text-[var(--color-flow-ink)]">Tasks</h3>
          <ul className="mt-3 grid gap-3 text-base text-[var(--color-flow-slate)]">
            {data.tasks.map((task) => (
              <li
                className="rounded-2xl bg-white px-4 py-3 leading-6 shadow-sm"
                key={task}
              >
                {task}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[24px] bg-slate-50/60 p-5 shadow-sm ring-1 ring-[rgba(215,224,234,0.6)]">
          <h3 className="text-lg font-semibold text-[var(--color-flow-ink)]">Timeline</h3>
          <ul className="mt-3 grid gap-3 text-base text-[var(--color-flow-slate)]">
            {data.timeline.map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--color-flow-warm)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[24px] bg-slate-50/50 p-5 shadow-sm ring-1 ring-[rgba(215,224,234,0.55)] lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--color-flow-ink)]">Risks</h3>
          <ul className="mt-3 grid gap-2 text-base text-[var(--color-flow-slate)]">
            {data.risks.map((risk) => (
              <li className="flex items-start gap-3" key={risk}>
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
