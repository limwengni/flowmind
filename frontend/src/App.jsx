import { useEffect, useState } from "react";
import InputBox from "./components/InputBox";
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
    layer: "Formatting",
    model: "Rule-based formatter",
    description: "Validates schema shape and prepares the final response.",
  },
];

function buildPipelineState({ isProcessing, hasOutput }) {
  return pipelineBlueprint.map((step, index) => {
    if (hasOutput) {
      return { ...step, status: "Done", tone: "done" };
    }

    if (isProcessing) {
      if (index === 0) {
        return { ...step, status: "Done", tone: "done" };
      }
      if (index === 1) {
        return { ...step, status: "Running", tone: "active" };
      }
    }

    return { ...step, status: "Pending", tone: "pending" };
  });
}

function normalizeOutput(response) {
  return {
    inputType: response.input_type || "General Notes",
    confidence: response.confidence || "94%",
    summary: response.summary || "",
    tasks: response.tasks || [],
    timeline: response.timeline || [],
    risks: response.risks || [],
    nextAction: response.next_action || "",
  };
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [inputValue, setInputValue] = useState(
    "Team sync notes:\n- launch scope needs cleanup\n- assign owners for blockers\n- confirm timeline for stakeholder review"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [processError, setProcessError] = useState("");
  const [workflowMetadata, setWorkflowMetadata] = useState({
    documentType: "Meeting Transcript",
    confidence: "94%",
  });
  const [outputData, setOutputData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("http://localhost:8000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  if (user === undefined) return null; // auth check in flight
  if (user === null) return <LoginPage />;

  async function handleProcess() {
    setIsProcessing(true);
    setProcessError("");
    setShowOutput(false);

    try {
      const response = await fetch("http://localhost:8000/process", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_input: inputValue }),
      });

      if (!response.ok) {
        throw new Error("Unable to process input right now.");
      }

      const payload = await response.json();
      const normalized = normalizeOutput(payload);

      setWorkflowMetadata({
        documentType: normalized.inputType,
        confidence: normalized.confidence,
      });
      setOutputData(normalized);
      setShowOutput(true);
    } catch (error) {
      setProcessError(
        error instanceof Error
          ? error.message
          : "Something went wrong while processing the input."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  const pipelineSteps = buildPipelineState({
    isProcessing,
    hasOutput: showOutput,
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
            <div className="flex shrink-0 flex-col items-end gap-1 pt-1">
              <p className="text-sm font-medium text-[var(--color-flow-slate)]">
                {user.username ?? user.name ?? user.email}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-[var(--color-flow-slate)] underline underline-offset-2 hover:text-[var(--color-flow-ink)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <section>
          <InputBox
            value={inputValue}
            onChange={setInputValue}
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
        </section>

        {processError ? (
          <section className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-800 shadow-sm">
            {processError}
          </section>
        ) : null}

        <PipelineVisualizer
          steps={pipelineSteps}
          metadata={workflowMetadata}
          showMetadata={isProcessing || showOutput}
        />

        {showOutput && outputData ? <OutputCard data={outputData} /> : null}
      </div>
    </div>
  );
}
