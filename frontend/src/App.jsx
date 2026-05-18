import { useState } from "react";
import InputBox from "./components/InputBox";
import OutputCard from "./components/OutputCard";
import PipelineVisualizer from "./components/PipelineVisualizer";

const mockWorkflow = {
  documentType: "Meeting Transcript",
  confidence: "94%",
};

const mockPipeline = [
  {
    layer: "Understanding",
    status: "Done",
    tone: "done",
    model: "Llama 3.1 8B",
    description: "Classifies document type and selects the analysis path.",
  },
  {
    layer: "Processing",
    status: "Running",
    tone: "active",
    model: "Qwen 2.5 14B",
    description: "Extracts structured information across summary, tasks, and risks.",
  },
  {
    layer: "Synthesis",
    status: "Pending",
    tone: "pending",
    model: "Qwen 2.5 14B",
    description: "Combines extracted outputs into one unified structure.",
  },
  {
    layer: "Formatting",
    status: "Pending",
    tone: "pending",
    model: "Llama 3.1 8B",
    description: "Validates schema shape and prepares the final response.",
  },
];

const mockOutput = {
  confidence: "94%",
  inputType: "Meeting Transcript",
  summary:
    "Cross-functional kickoff notes were normalized into a focused execution snapshot. The discussion centered on launch timing, ownership gaps, and the need to align delivery milestones before the next stakeholder check-in.",
  tasks: [
    "Finalize sprint scope - Owner: Aina - Deadline: 18 May",
    "Confirm engineering estimates - Owner: Dev Team - Deadline: 19 May",
    "Share stakeholder recap - Owner: Project Ops - Deadline: 19 May",
  ],
  timeline: [
    "Kickoff alignment completed",
    "Implementation plan review on 20 May",
    "Execution handoff by 22 May",
  ],
  risks: [
    "Requirements are partially implied rather than explicitly confirmed.",
    "Timeline may slip if owner assignments remain unresolved.",
    "Communication dependencies across teams are still informal.",
  ],
  nextAction:
    "Validate owners and deadlines, then convert the card into an execution-ready work plan.",
};

export default function App() {
  const [inputValue, setInputValue] = useState(
    "Team sync notes:\n- launch scope needs cleanup\n- assign owners for blockers\n- confirm timeline for stakeholder review"
  );
  const [showOutput, setShowOutput] = useState(false);

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
            onProcess={() => setShowOutput(true)}
          />
        </section>

        <PipelineVisualizer
          steps={mockPipeline}
          metadata={mockWorkflow}
          showMetadata={showOutput}
        />

        {showOutput ? <OutputCard data={mockOutput} /> : null}
      </div>
    </div>
  );
}
