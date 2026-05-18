# FlowMind Next Steps

This file reflects the current state after the first push.

The project already has:

- local and remote git setup
- first push completed
- frontend mock UI
- backend placeholder endpoint
- initial README and `.gitignore`
- basic project structure

## What is already done

### Foundation

- Project skeleton exists
- Frontend mock UI exists
- Backend placeholder endpoint exists
- Folder structure exists
- Fake data exists
- Basic local run flow is known

### Git / Repo

- Git is initialized locally
- Branch is `main`
- Remote repo is connected
- First push is completed

### Post-push UI fixes already done

- Removed repeated confidence from the output card header
- Kept confidence in the pipeline section
- Kept `Input Type` in the output card header
- Made pipeline status pills smaller and less rounded
- Softened badge colors for a more mature UI feel
- Improved output card hierarchy
- Made `Summary` more dominant
- Made `Next Action` second in emphasis
- Reduced repeated explanatory helper text
- Replaced repetitive pipeline descriptions with meaningful copy

## Day 2 task plan

Day 2 should move from scaffold and mock UI into actual implementation work.

Do not try to solve everything at once.
Move layer by layer.

### Day 2 priority order

1. Connect frontend to backend mock endpoint
2. Replace static frontend output with backend response
3. Keep the 4-layer architecture clean in backend code
4. Start implementing real placeholder-to-real pipeline behavior one layer at a time

## Day 2 backend tasks

### 1. Keep the 4-layer orchestration structure

The backend already has the correct high-level flow:

1. Understanding
2. Processing
3. Synthesis
4. Formatting

Keep this structure.
Do not collapse everything into one file.

### 2. Improve schema stability

- make sure output shape is always fixed
- missing fields should remain empty or null
- frontend should always receive the same structure

### 3. Expand placeholder logic safely

Start simple:

- detect a rough document type
- extract obvious task-like lines
- extract obvious timeline-like lines
- produce a structured object with the fixed schema

Do not overcomplicate this on Day 2.

### 4. Keep backend demo-safe

- no database yet
- no deployment complexity yet
- no unnecessary model-routing complexity yet

## Day 2 frontend tasks

### 1. Replace static output with live mock fetch

- call `POST /process`
- send textarea content
- render response in the output card

### 2. Improve state transitions

Suggested states:

- idle
- processing
- result shown

This will make the product feel much more believable even before full AI logic exists.

### 3. Keep UI simple

- do not add chat UI
- do not add dashboards
- do not add extra panels unless they help the main story

The core story is still:

input -> pipeline -> structured output

## Suggested next working order

### Immediate next step

1. Do the layout height fix

### After that

2. Connect frontend to backend mock endpoint
3. Replace static output rendering with fetched output
4. Add simple processing-state behavior

### Only after that

5. Start improving actual layer logic

## Important note

The project is in a good position.

At this stage, the goal is not perfection.
The goal is:

- keep the architecture clean
- keep the demo understandable
- keep progress steady

That is enough for a strong hackathon build path.
