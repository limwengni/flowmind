import { useEffect, useRef, useState } from "react";
import InputBox from "./components/InputBox";
import KanbanBoard from "./components/KanbanBoard";
import OutputCard from "./components/OutputCard";
import PipelineVisualizer from "./components/PipelineVisualizer";

const pipelineBlueprint = [
  {
    layer: "Understanding",
    model: "Llama 3.1 8B",
    description: "Classifies document type and selects the analysis path.",
  },
  {
    layer: "Processing",
    model: "Qwen 2.5 14B",
    description: "Extracts structured information across summary, tasks, and risks.",
  },
  {
    layer: "Synthesis",
    model: "Qwen 2.5 14B",
    description: "Combines extracted outputs into one unified structure.",
  },
  {
    layer: "Formatting",
    model: "Llama 3.1 8B",
    description: "Validates schema shape and prepares the final response.",
  },
];

function buildPipelineState({ activeLayer, hasOutput }) {
  return pipelineBlueprint.map((step, index) => {
    if (hasOutput) return { ...step, status: "Done", tone: "done" };
    if (activeLayer === -1) return { ...step, status: "Pending", tone: "pending" };
    if (index < activeLayer) return { ...step, status: "Done", tone: "done" };
    if (index === activeLayer) return { ...step, status: "Running", tone: "active" };
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

// How long each layer "runs" visually while the real request is in flight (ms)
const LAYER_DURATION = 1800;

export default function App() {
  const [inputValue, setInputValue] = useState(
    "Team sync notes:\n- launch scope needs cleanup\n- assign owners for blockers\n- confirm timeline for stakeholder review"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeLayer, setActiveLayer] = useState(-1); // -1 = idle
  const [showOutput, setShowOutput] = useState(true);
  const [processError, setProcessError] = useState("");
  const [workflowMetadata, setWorkflowMetadata] = useState({
    documentType: "Meeting Transcript",
    confidence: "94%",
  });
  const [outputData, setOutputData] = useState({
    inputType: "Meeting Transcript",
    confidence: "94%",
    summary: "Team sync identified three key areas needing immediate attention: launch scope cleanup, blocker ownership, and stakeholder timeline confirmation. Action items have been extracted and prioritised for execution.",
    tasks: [
      "Clean up launch scope and define clear boundaries - Owner: TBD - Deadline: TBD",
      "Assign owners to all current blockers - Owner: TBD - Deadline: TBD",
      "Confirm timeline for stakeholder review - Owner: TBD - Deadline: TBD",
    ],
    timeline: [],
    risks: ["Blockers currently have no assigned owners, risking delays."],
    nextAction: "Assign owners to all current blockers before next sync.",
  });
  const layerTimers = useRef([]);

  // Step through layers 0→3 while processing
  useEffect(() => {
    layerTimers.current.forEach(clearTimeout);
    layerTimers.current = [];

    if (!isProcessing) {
      setActiveLayer(-1);
      return;
    }

    pipelineBlueprint.forEach((_, i) => {
      const id = setTimeout(() => setActiveLayer(i), i * LAYER_DURATION);
      layerTimers.current.push(id);
    });

    return () => layerTimers.current.forEach(clearTimeout);
  }, [isProcessing]);

  async function handleProcess() {
    setIsProcessing(true);
    setProcessError("");
    setShowOutput(false);

    try {
      const response = await fetch("http://127.0.0.1:8000/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    activeLayer,
    hasOutput: showOutput,
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <header className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,252,0.82))] p-6 shadow-[0_22px_60px_rgba(16,32,51,0.08)]">
          <div className="max-w-4xl">
              <p className="text-4xl font-semibold tracking-tight text-[var(--color-flow-ink)] sm:text-5xl lg:text-6xl">
                FlowMind
              </p>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[var(--color-flow-slate)] sm:text-lg">
                Structured AI pipeline for turning messy notes into execution-ready output.
              </p>
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

        {showOutput && outputData?.tasks?.length ? (
          <KanbanBoard tasks={outputData.tasks} />
        ) : null}
      </div>
    </div>
  );
}
