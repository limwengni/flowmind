import { useEffect, useMemo, useState } from "react";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "bg-slate-100 text-slate-700 ring-slate-200" },
  { id: "inprogress", label: "In Progress", color: "bg-sky-50 text-sky-800 ring-sky-200" },
  { id: "done", label: "Done", color: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
];

const URGENT_KEYWORDS = ["blocker", "blocked", "urgent", "asap", "critical", "immediate", "overdue"];
const MILD_KEYWORDS = ["important", "priority", "soon", "risk", "delay", "confirm", "review"];

function detectUrgency(text) {
  const lower = text.toLowerCase();
  if (URGENT_KEYWORDS.some((k) => lower.includes(k))) return "urgent";
  if (MILD_KEYWORDS.some((k) => lower.includes(k))) return "mild";
  return "normal";
}

const URGENCY_STYLES = {
  urgent: { label: "Urgent", class: "bg-rose-100 text-rose-700 ring-rose-200" },
  mild:   { label: "Mild",   class: "bg-orange-100 text-orange-700 ring-orange-200" },
  normal: { label: "Normal", class: "bg-slate-100 text-slate-500 ring-slate-200" },
};

function parseTask(raw) {
  const ownerMatch = raw.match(/[-–]\s*Owner:\s*([^-–\n]+)/i);
  const deadlineMatch = raw.match(/[-–]\s*Deadline:\s*([^-–\n]+)/i);
  const text = raw
    .replace(/[-–]\s*Owner:[^-–\n]+/gi, "")
    .replace(/[-–]\s*Deadline:[^-–\n]+/gi, "")
    .trim()
    .replace(/\.$/, "");

  const rawOwner = ownerMatch ? ownerMatch[1].trim() : "";
  const rawDeadline = deadlineMatch ? deadlineMatch[1].trim() : "";

  return {
    id: crypto.randomUUID(),
    text,
    owner: rawOwner === "TBD" ? "" : rawOwner,
    deadline: rawDeadline === "TBD" ? "" : rawDeadline,
    urgency: detectUrgency(text),
  };
}

function buildDefaultColumns(tasks) {
  return {
    todo: tasks.map(parseTask),
    inprogress: [],
    done: [],
  };
}

function normalizeStoredColumns(storedColumns) {
  return {
    todo: Array.isArray(storedColumns?.todo) ? storedColumns.todo : [],
    inprogress: Array.isArray(storedColumns?.inprogress) ? storedColumns.inprogress : [],
    done: Array.isArray(storedColumns?.done) ? storedColumns.done : [],
  };
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const cleanDateStr = dateStr.replace(/\s*\(inferred\)\s*/i, "").trim();

  const monthNames = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  const numericDate = cleanDateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const textDate = cleanDateStr.match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{4}))?$/);

  let parsedDate = null;
  if (numericDate) {
    parsedDate = new Date(
      Number(numericDate[1]),
      Number(numericDate[2]) - 1,
      Number(numericDate[3])
    );
  } else if (textDate) {
    const month = monthNames[textDate[2].toLowerCase()];
    if (month !== undefined) {
      parsedDate = new Date(
        textDate[3] ? Number(textDate[3]) : new Date().getFullYear(),
        month,
        Number(textDate[1])
      );
    }
  } else {
    parsedDate = new Date(cleanDateStr);
  }

  if (!parsedDate || isNaN(parsedDate)) return cleanDateStr;

  return parsedDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function isInferred(value) {
  return /\(inferred\)/i.test(value);
}

function TaskCard({ task, colId, isDragging, onDragStart, onDragEnd, onEdit }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task, colId)}
      onDragEnd={onDragEnd}
      className={`group cursor-grab rounded-[16px] bg-white p-3.5 shadow-sm ring-1 ring-[rgba(215,224,234,0.7)] transition duration-200 hover:shadow-md hover:-translate-y-0.5 active:cursor-grabbing ${
        isDragging
          ? "rotate-1 scale-[1.02] shadow-[0_18px_45px_rgba(16,32,51,0.18)] ring-[var(--color-flow-warm)] opacity-80"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-5 text-[var(--color-flow-ink)]">
          {task.text}
        </p>
        <button
          onClick={() => onEdit(task)}
          className="shrink-0 rounded-lg p-1 text-[var(--color-flow-slate)] opacity-0 transition hover:bg-slate-100 group-hover:opacity-100"
          title="Edit card"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
          </svg>
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${URGENCY_STYLES[task.urgency].class}`}>
          {URGENCY_STYLES[task.urgency].label}
        </span>
        {task.owner ? (
          <span className="rounded-full bg-[var(--color-flow-sky)] px-2.5 py-0.5 text-xs font-medium text-sky-900">
            {task.owner}
          </span>
        ) : null}
        {task.deadline ? (
          <span className="rounded-full bg-[var(--color-flow-gold)]/40 px-2.5 py-0.5 text-xs font-medium text-amber-900">
            {formatDate(task.deadline)}
          </span>
        ) : null}
        {task.deadline && isInferred(task.deadline) ? (
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
            Estimated
          </span>
        ) : null}
        {!task.owner && !task.deadline ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-400">
            No owner · No deadline
          </span>
        ) : null}
      </div>
    </div>
  );
}

function EditModal({ task, onSave, onClose }) {
  const [owner, setOwner] = useState(task.owner || "");
  const [deadline, setDeadline] = useState(task.deadline || "");
  const [urgency, setUrgency] = useState(task.urgency || "mild");

  function handleSave() {
    onSave({ ...task, owner: owner.trim(), deadline, urgency });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-[0_22px_60px_rgba(16,32,51,0.18)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-flow-warm)]">
          Edit Card
        </p>
        <p className="mt-1.5 text-base font-semibold text-[var(--color-flow-ink)]">
          {task.text}
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-flow-slate)]">
              Owner
            </label>
            <input
              type="text"
              placeholder="e.g. WN"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="mt-1.5 w-full rounded-[14px] bg-slate-50 px-4 py-2.5 text-sm text-[var(--color-flow-ink)] shadow-[inset_0_0_0_1px_rgba(215,224,234,0.9)] outline-none transition focus:shadow-[inset_0_0_0_1.5px_var(--color-flow-warm)]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-flow-slate)]">
              Urgency
            </label>
            <div className="mt-1.5 flex gap-2">
              {Object.entries(URGENCY_STYLES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setUrgency(key)}
                  className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition ${val.class} ${urgency === key ? "opacity-100 shadow-sm" : "opacity-40"}`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-flow-slate)]">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1.5 w-full rounded-[14px] bg-slate-50 px-4 py-2.5 text-sm text-[var(--color-flow-ink)] shadow-[inset_0_0_0_1px_rgba(215,224,234,0.9)] outline-none transition focus:shadow-[inset_0_0_0_1.5px_var(--color-flow-warm)]"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 rounded-full bg-[linear-gradient(135deg,#d37231,#b64e22)] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks }) {
  const storageKey = "flowmind.kanban.columns";
  const sourceKey = useMemo(() => tasks.join("||"), [tasks]);
  const [columns, setColumns] = useState(() => buildDefaultColumns(tasks));
  const [dragging, setDragging] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setColumns(buildDefaultColumns(tasks));
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.sourceKey !== sourceKey) {
        setColumns(buildDefaultColumns(tasks));
        return;
      }
      setColumns(normalizeStoredColumns(parsed.columns));
    } catch {
      setColumns(buildDefaultColumns(tasks));
    }
  }, [sourceKey, tasks]);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        sourceKey,
        columns,
      })
    );
  }, [columns, sourceKey]);

  function onDragStart(task, fromCol) {
    setDragging({ task, fromCol });
  }

  function onDragEnd() {
    setDragging(null);
    setDragOverCol(null);
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
    setColumns((prev) => ({
      ...prev,
      [dragging.fromCol]: prev[dragging.fromCol].filter((t) => t.id !== dragging.task.id),
      [toCol]: [...prev[toCol], dragging.task],
    }));
    setDragging(null);
    setDragOverCol(null);
  }

  function handleSaveEdit(updated) {
    setColumns((prev) => {
      const next = { ...prev };
      for (const col of Object.keys(next)) {
        next[col] = next[col].map((t) => (t.id === updated.id ? updated : t));
      }
      return next;
    });
  }

  return (
    <>
      {editingTask ? (
        <EditModal
          task={editingTask}
          onSave={handleSaveEdit}
          onClose={() => setEditingTask(null)}
        />
      ) : null}

      <section className="rounded-[28px] border border-white/70 bg-[var(--color-flow-panel)] p-5 shadow-[0_16px_44px_rgba(16,32,51,0.07)] backdrop-blur">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-flow-warm)]">
            Kanban Board
          </p>
          <h2 className="mt-1.5 text-xl font-semibold text-[var(--color-flow-ink)]">
            AI-generated task board
          </h2>
          <p className="mt-1 text-sm text-[var(--color-flow-slate)]">
            Drag tasks across columns · click the pencil to assign owner and deadline.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={`rounded-[22px] p-4 transition-all ${
                dragOverCol === col.id
                  ? "scale-[1.01] ring-2 ring-[var(--color-flow-warm)] bg-orange-50/60 shadow-[0_14px_35px_rgba(211,114,49,0.12)]"
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

              <div className="flex min-h-[80px] flex-col gap-2.5">
                {columns[col.id].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    colId={col.id}
                    isDragging={dragging?.task.id === task.id}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onEdit={setEditingTask}
                  />
                ))}
                {columns[col.id].length === 0 && (
                  <div className={`flex items-center justify-center rounded-[14px] border-2 border-dashed py-6 transition-colors ${
                    dragOverCol === col.id
                      ? "border-[var(--color-flow-warm)] bg-orange-50 text-[var(--color-flow-warm)]"
                      : "border-[var(--color-flow-line)] text-[var(--color-flow-slate)]"
                  }`}>
                    <p className="text-xs font-medium">
                      {dragOverCol === col.id ? "Release to drop card here" : "Drop here"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
