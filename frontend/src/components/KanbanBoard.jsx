import { useState } from "react";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "bg-slate-100 text-slate-700 ring-slate-200" },
  { id: "inprogress", label: "In Progress", color: "bg-sky-50 text-sky-800 ring-sky-200" },
  { id: "done", label: "Done", color: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
];

function parseTask(raw) {
  const ownerMatch = raw.match(/[-–]\s*Owner:\s*([^-–\n]+)/i);
  const deadlineMatch = raw.match(/[-–]\s*Deadline:\s*([^-–\n]+)/i);
  const text = raw
    .replace(/[-–]\s*Owner:[^-–\n]+/gi, "")
    .replace(/[-–]\s*Deadline:[^-–\n]+/gi, "")
    .trim()
    .replace(/\.$/, "");
  return {
    id: raw,
    text,
    owner: ownerMatch ? ownerMatch[1].trim() : null,
    deadline: deadlineMatch ? deadlineMatch[1].trim() : null,
  };
}

export default function KanbanBoard({ tasks }) {
  const [columns, setColumns] = useState(() => ({
    todo: tasks.map(parseTask),
    inprogress: [],
    done: [],
  }));
  const [dragging, setDragging] = useState(null); // { task, fromCol }
  const [dragOverCol, setDragOverCol] = useState(null);

  function onDragStart(task, fromCol) {
    setDragging({ task, fromCol });
  }

  function onDragOver(e, colId) {
    e.preventDefault();
    setDragOverCol(colId);
  }

  function onDrop(toCol) {
    if (!dragging || dragging.fromCol === toCol) {
      setDragging(null);
      setDragOverCol(null);
      return;
    }
    setColumns((prev) => {
      const from = prev[dragging.fromCol].filter((t) => t.id !== dragging.task.id);
      const to = [...prev[toCol], dragging.task];
      return { ...prev, [dragging.fromCol]: from, [toCol]: to };
    });
    setDragging(null);
    setDragOverCol(null);
  }

  return (
    <section className="rounded-[28px] border border-white/70 bg-[var(--color-flow-panel)] p-5 shadow-[0_16px_44px_rgba(16,32,51,0.07)] backdrop-blur">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-flow-warm)]">
          Kanban Board
        </p>
        <h2 className="mt-1.5 text-xl font-semibold text-[var(--color-flow-ink)]">
          AI-generated task board
        </h2>
        <p className="mt-1 text-sm text-[var(--color-flow-slate)]">
          Drag tasks across columns to track progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`rounded-[22px] p-4 transition-all ${
              dragOverCol === col.id
                ? "ring-2 ring-[var(--color-flow-warm)] bg-orange-50/60"
                : "bg-white/60 ring-1 ring-[var(--color-flow-line)]"
            }`}
            onDragOver={(e) => onDragOver(e, col.id)}
            onDrop={() => onDrop(col.id)}
            onDragLeave={() => setDragOverCol(null)}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ring-1 ${col.color}`}>
                {col.label}
              </span>
              <span className="text-sm font-semibold text-[var(--color-flow-slate)]">
                {columns[col.id].length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 min-h-[80px]">
              {columns[col.id].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => onDragStart(task, col.id)}
                  className="cursor-grab rounded-[16px] bg-white p-3.5 shadow-sm ring-1 ring-[rgba(215,224,234,0.7)] transition hover:shadow-md hover:-translate-y-0.5 active:cursor-grabbing"
                >
                  <p className="text-sm font-medium leading-5 text-[var(--color-flow-ink)]">
                    {task.text}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {task.owner && task.owner !== "TBD" && (
                      <span className="rounded-full bg-[var(--color-flow-sky)] px-2.5 py-0.5 text-xs font-medium text-sky-900">
                        {task.owner}
                      </span>
                    )}
                    {task.deadline && task.deadline !== "TBD" && (
                      <span className="rounded-full bg-[var(--color-flow-gold)]/40 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                        {task.deadline}
                      </span>
                    )}
                    {(!task.owner || task.owner === "TBD") && (!task.deadline || task.deadline === "TBD") && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                        No owner · No deadline
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {columns[col.id].length === 0 && (
                <div className="flex items-center justify-center rounded-[14px] border-2 border-dashed border-[var(--color-flow-line)] py-6">
                  <p className="text-xs text-[var(--color-flow-slate)]">Drop here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
