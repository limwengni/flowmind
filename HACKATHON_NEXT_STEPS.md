# FlowMind Next Steps

This file reflects the current state after the first push and Day 2 implementation work.

The project already has:

- local and remote git setup
- first push completed
- frontend UI flow
- backend placeholder endpoint
- initial README and `.gitignore`
- basic project structure

## What is already done

### Foundation

- Project skeleton exists
- Frontend UI exists
- Backend FastAPI app exists
- Folder structure exists
- Fake/demo data exists
- Basic local run flow is known

### Git / Repo

- Git is initialized locally
- Branch is `main`
- Remote repo is connected
- First push is completed

### UI / Product flow

- Hero section is simplified
- Input section is implemented
- Pipeline visualizer is implemented
- Output card is implemented
- Output card hierarchy is improved
- Repeated helper text is reduced
- Pipeline descriptions are more meaningful
- Confidence is no longer repeated in the output header
- Pipeline status pills are more mature and compact
- Layout height is tighter than before

### Day 2 implementation already done

- Frontend calls backend `POST /process`
- Static frontend output is replaced by backend response
- Simple UI state flow exists:
  - idle
  - processing
  - result shown
- Backend CORS is enabled for the frontend dev server
- 4-layer backend orchestration is preserved
- Backend output shape remains stable for the frontend
- Backend now reacts to input content with lightweight heuristics
- Input type and confidence are returned from backend
- Tasks, timeline, risks, and next action now depend on the pasted text

## Current status

FlowMind is now beyond pure scaffold stage.

The project already demonstrates:

- input to backend request flow
- pipeline-driven UI structure
- structured output rendering
- lightweight input-dependent backend behavior

This is already a valid working hackathon prototype.

## Day 3 plan

Day 3 should focus on improving extraction quality and tightening the product feel.

Do not introduce unnecessary complexity yet.
The best next step is to improve correctness before adding more surface area.

## Day 3 priority order

1. Improve backend extraction quality
2. Refine pipeline state realism in the UI
3. Clean up API docs and backend response models
4. Prepare for demo stability

## Day 3 backend tasks

### 1. Improve heuristic extraction rules

Current logic is working, but still rough.

Focus on:

- separating task lines from risk lines more accurately
- improving owner extraction
- improving date extraction
- improving next action selection
- preventing the same line from being classified into multiple buckets unnecessarily

### 2. Make understanding layer slightly smarter

Improve input classification beyond very basic keyword checks.

Possible upgrades:

- stronger distinction between meeting notes and project briefs
- detect action-heavy notes vs. informational notes
- adjust confidence more meaningfully

### 3. Tighten output normalization

Make sure the formatting layer always returns:

- strings where strings are expected
- arrays where arrays are expected
- safe fallback values when extraction fails

### 4. Consider response models for API output

Possible improvement:

- return the work card through a Pydantic response model

This is not mandatory, but it would make the contract cleaner.

## Day 3 frontend tasks

### 1. Improve pre-process vs. post-process state clarity

The current UI works, but the pipeline can still feel slightly too active before processing.

Good next improvement:

- calmer idle pipeline state
- stronger distinction when processing starts
- clearer transition into completed output state

### 2. Tighten demo behavior

Make sure:

- loading state feels intentional
- error state is readable
- process button behavior is stable
- empty or short input still produces safe output

### 3. Review output card with real varied inputs

Test different inputs and check whether the output card still reads clearly when:

- tasks are long
- timeline is empty
- risks are empty
- summary is short

## Demo readiness tasks

Before the next push or demo round:

- restart backend and confirm new code is running
- test one meeting-style input
- test one project-brief-style input
- test one minimal/short input
- confirm frontend still renders all cases safely

## Suggested next working order

1. Restart backend and verify latest behavior
2. Improve backend heuristic extraction quality
3. Review frontend state transitions with live testing
4. Clean API docs naming if needed
5. Prepare a stable demo input set

## Important note

The project is in a good position.

At this stage, the goal is not perfection.
The goal is:

- keep the architecture clean
- keep the demo understandable
- improve extraction quality gradually
- avoid overbuilding too early

That is enough for a strong hackathon build path.
