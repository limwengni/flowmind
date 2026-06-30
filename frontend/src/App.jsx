import { useEffect, useRef, useState } from "react";
import InputBox from "./components/InputBox";
import KanbanBoard from "./components/KanbanBoard";
import LoginPage from "./components/LoginPage";
import OutputCard from "./components/OutputCard";
import PipelineVisualizer from "./components/PipelineVisualizer";

const pipelineBlueprint = [
  {
    layer: "Understanding",
    model: "Qwen 3.6 27B",
    description: "Classifies document type and selects the analysis path.",
  },
  {
    layer: "Processing",
    model: "Qwen 3.6 27B",
    description: "Extracts structured information across summary, tasks, and risks.",
  },
  {
    layer: "Synthesis",
    model: "Qwen 3.6 27B",
    description: "Combines extracted outputs into one unified structure.",
  },
  {
    layer: "Schema Validation",
    model: "Deterministic formatter",
    description: "Validates schema shape and prepares the final response.",
  },
];

function buildPipelineState({ activeLayer, completedLayers, hasOutput }) {
  return pipelineBlueprint.map((step, index) => {
    if (hasOutput) return { ...step, status: "Done", tone: "done" };
    if (activeLayer === -1) return { ...step, status: "Pending", tone: "pending" };
    if (completedLayers.includes(index)) return { ...step, status: "Done", tone: "done" };
    if (index < activeLayer) return { ...step, status: "Done", tone: "done" };
    if (index === activeLayer) return { ...step, status: "Running", tone: "active" };
    return { ...step, status: "Pending", tone: "pending" };
  });
}

function normalizeOutput(response) {
  return {
    inputType: response.input_type || "General Notes",
    confidence: response.confidence || null,
    summary: response.summary || "",
    tasks: response.tasks || [],
    timeline: response.timeline || [],
    risks: response.risks || [],
    nextAction: response.next_action || "",
  };
}

const previewOutputData = normalizeOutput({
  input_type: "Team Sync Notes",
  confidence: "High",
  summary:
    "The team needs to tighten launch scope, assign ownership for blockers, and confirm the stakeholder review timeline before execution can move cleanly.",
  tasks: [
    "Clean up launch scope - Owner: TBD - Deadline: 2026-05-28",
    "Assign owners for blockers - Owner: TBD - Deadline: 2026-05-27",
    "Confirm stakeholder review timeline - Owner: TBD - Deadline: 2026-05-30",
  ],
  timeline: [
    "2026-05-27: blocker owners assigned",
    "2026-05-28: launch scope finalized",
    "2026-05-30: stakeholder review timeline confirmed",
  ],
  risks: [
    "Launch scope may keep shifting without a final decision owner.",
    "Blockers can stall execution if ownership stays unclear.",
    "Stakeholder review timing may delay downstream work.",
  ],
  next_action: "Lock the final launch scope and assign one owner to each blocker today.",
});

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const debugPreviewEnabled = import.meta.env.VITE_DEBUG_PREVIEW === "true";

async function readErrorMessage(response, fallbackMessage) {
  try {
    const payload = await response.json();
    if (typeof payload?.detail === "string") {
      return payload.detail;
    }
  } catch {
    // Ignore parse failures and use the fallback.
  }
  return fallbackMessage;
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [inputValue, setInputValue] = useState(
    "Team sync notes:\n- launch scope needs cleanup\n- assign owners for blockers\n- confirm timeline for stakeholder review"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeLayer, setActiveLayer] = useState(-1); // -1 = idle
  const [completedLayers, setCompletedLayers] = useState([]);
  const [showOutput, setShowOutput] = useState(debugPreviewEnabled);
  const [processError, setProcessError] = useState("");
  const [processErrorType, setProcessErrorType] = useState("");
  const [workflowMetadata, setWorkflowMetadata] = useState(
    debugPreviewEnabled
      ? {
          documentType: previewOutputData.inputType,
          confidence: previewOutputData.confidence,
        }
      : {
          documentType: "Awaiting analysis",
          confidence: null,
        }
  );
  const [outputData, setOutputData] = useState(
    debugPreviewEnabled ? previewOutputData : null
  );
  const layerTimers = useRef([]);
  const outputSectionRef = useRef(null);
  const didScrollToOutputRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);
    let ignore = false;

    fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!ignore) {
          setUser(data);
        }
      })
      .catch((error) => {
        if (ignore || error?.name === "AbortError") {
          return;
        }
        setUser(null);
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      ignore = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (user === null) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [user]);

  useEffect(() => {
    if (showOutput && outputData && !didScrollToOutputRef.current) {
      didScrollToOutputRef.current = true;
      const frameId = window.requestAnimationFrame(() => {
        outputSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return () => window.cancelAnimationFrame(frameId);
    }
  }, [showOutput, outputData]);

  async function handleLogout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,252,0.82))] p-8 text-center shadow-[0_22px_60px_rgba(16,32,51,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-flow-warm)]">
              FlowMind
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-flow-ink)]">
              Reconnecting your workspace
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--color-flow-slate)]">
              We’re checking your Chutes session and bringing the pipeline back into view.
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-2 w-1/2 animate-pulse rounded-full bg-[linear-gradient(90deg,#24486b,#61a7d6)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (user === null) return <LoginPage />;

  async function handleProcess() {
    let understandingCompleted = false;

    setIsProcessing(true);
    setProcessError("");
    setProcessErrorType("");
    setShowOutput(false);
    setCompletedLayers([]);
    setOutputData(null);
    setActiveLayer(0);
    setWorkflowMetadata({
      documentType: "Analyzing input",
      confidence: null,
    });
    didScrollToOutputRef.current = false;

    try {
      const understandingResponse = await fetch(`${API_BASE}/understand`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_input: inputValue }),
      });

      if (!understandingResponse.ok) {
        const errorMessage = await readErrorMessage(
          understandingResponse,
          "FlowMind could not start the Chutes analysis right now."
        );
        const error = new Error(errorMessage);
        error.status = understandingResponse.status;
        throw error;
      }

      const understandingPayload = await understandingResponse.json();
      understandingCompleted = true;
      setWorkflowMetadata({
        documentType: understandingPayload.input_type || "General Notes",
        confidence: understandingPayload.confidence || null,
      });
      setCompletedLayers([0]);
      setActiveLayer(1);

      layerTimers.current.forEach(clearTimeout);
      layerTimers.current = [
        setTimeout(() => setCompletedLayers((current) => Array.from(new Set([...current, 1]))), 1200),
        setTimeout(() => setActiveLayer(2), 1200),
        setTimeout(() => setCompletedLayers((current) => Array.from(new Set([...current, 1, 2]))), 2400),
        setTimeout(() => setActiveLayer(3), 2400),
      ];

      const response = await fetch(`${API_BASE}/process-from-understanding`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_input: inputValue,
          input_type: understandingPayload.input_type,
          confidence: understandingPayload.confidence,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "FlowMind could not finish the Chutes pipeline right now."
        );
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      const payload = await response.json();
      const normalized = normalizeOutput(payload);

      setWorkflowMetadata({
        documentType: normalized.inputType,
        confidence: normalized.confidence,
      });
      setCompletedLayers([0, 1, 2, 3]);
      setOutputData(normalized);
      setShowOutput(true);
    } catch (error) {
      setProcessError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again in a moment."
      );
      if (error && typeof error === "object" && "status" in error) {
        const status = error.status;
        setProcessErrorType(status === 402 ? "credits" : "request");
      } else {
        setProcessErrorType("request");
      }
      if (!understandingCompleted) {
        setActiveLayer(-1);
      }
    } finally {
      layerTimers.current.forEach(clearTimeout);
      layerTimers.current = [];
      setIsProcessing(false);
    }
  }

  const pipelineSteps = buildPipelineState({
    activeLayer,
    completedLayers,
    hasOutput: showOutput && Boolean(outputData),
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <header className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,252,0.82))] p-6 shadow-[0_22px_60px_rgba(16,32,51,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-4xl">
              <p className="text-4xl font-semibold tracking-tight text-[var(--color-flow-ink)] sm:text-5xl lg:text-6xl">
                FlowMind
              </p>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[var(--color-flow-slate)] sm:text-lg">
                Structured AI pipeline for turning messy notes into execution-ready output.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
              <p className="text-sm font-medium text-[var(--color-flow-slate)]">
                {user.username ?? user.name ?? user.email}
              </p>
              {user.chutes_quotas?.[0]?.quota != null && (
                <span className="rounded-full bg-[var(--color-flow-ink)]/5 px-3 py-0.5 text-xs font-medium text-[var(--color-flow-ink)]">
                  {user.chutes_quotas[0].quota.toLocaleString()} req/day
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-xs text-[var(--color-flow-slate)] underline underline-offset-2 hover:text-[var(--color-flow-ink)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] xl:items-start">
          <InputBox
            value={inputValue}
            onChange={setInputValue}
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
          <PipelineVisualizer
            steps={pipelineSteps}
            metadata={workflowMetadata}
            isProcessing={isProcessing}
            showMetadata={isProcessing || showOutput}
          />
        </div>

        {processError ? (
          <section
            className={`rounded-[22px] px-4 py-4 shadow-sm ${
              processErrorType === "credits"
                ? "border border-amber-200 bg-amber-50 text-amber-900"
                : "border border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-semibold">
                  {processErrorType === "credits"
                    ? "Layer 1 completed, but Chutes credits are required for the remaining layers."
                    : "FlowMind hit a processing problem."}
                </p>
                <p className="mt-1 text-sm leading-6">
                  {processError}
                </p>
                {completedLayers.includes(0) ? (
                  <p className="mt-2 text-sm font-medium">
                    Understanding already succeeded, so the document type and confidence shown above are real.
                  </p>
                ) : null}
              </div>
              <button
                onClick={handleProcess}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  processErrorType === "credits"
                    ? "bg-amber-900 text-amber-50 hover:bg-amber-800"
                    : "bg-rose-700 text-white hover:bg-rose-600"
                }`}
              >
                Retry
              </button>
            </div>
          </section>
        ) : null}

        {!showOutput && processErrorType === "credits" && completedLayers.includes(0) ? (
          <section className="rounded-[28px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,247,237,0.96))] p-5 shadow-[0_18px_44px_rgba(180,83,9,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
              Generation Paused
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-flow-ink)]">
              Layer 1 completed. FlowMind is ready to continue once Chutes credits are available.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-amber-900/90">
              We already classified your notes and revealed the real document type plus confidence above. The remaining layers need funded Chutes usage before FlowMind can extract tasks, produce the summary, and build the kanban board.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleProcess}
                className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-800"
              >
                Retry generation
              </button>
              <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
                Waiting for credited API access
              </span>
            </div>
          </section>
        ) : null}

        {showOutput && outputData ? (
          <div ref={outputSectionRef}>
            <OutputCard data={outputData} />
          </div>
        ) : null}

        {showOutput && outputData?.tasks?.length ? (
          <KanbanBoard tasks={outputData.tasks} />
        ) : null}
      </div>
    </div>
  );
}
