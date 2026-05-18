# FlowMind Next Steps

This plan is for the next hackathon work session.

The goal is not to make everything perfect first.
The goal is to secure a stable checkpoint, then improve safely.

## First: what is already done

- Project skeleton exists
- Frontend mock UI exists
- Backend placeholder endpoint exists
- Folder structure exists
- Fake data exists
- Basic local run flow is known

That is already a real start.
This is enough to continue.

## Tomorrow priority order

Do these in order.
Do not jump straight into polish before the first push.

1. Set up git locally
2. Add a proper `.gitignore`
3. Check local app still runs
4. Make the first push with the current stable version
5. Only after the first push, do the next UI polish fixes

## Step 1: Git setup

From the project root:

```powershell
cd C:\Users\lim12\Documents\flowmind
git init
git branch -M main
git config user.name "YOUR_NAME"
git config user.email "YOUR_EMAIL"
```

If the remote repo already exists, connect it after that:

```powershell
git remote add origin YOUR_REMOTE_URL
```

If `origin` already exists:

```powershell
git remote set-url origin YOUR_REMOTE_URL
```

## Step 2: `.gitignore`

Make sure these are ignored before the first push:

```gitignore
# Python
backend/.venv/
__pycache__/
*.pyc

# Node
frontend/node_modules/
frontend/dist/

# Environment / OS
.env
.env.*
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

Important:
- do not push `node_modules`
- do not push `.venv`
- do not push local build output
- do not push secrets or `.env` files

## Step 3: Quick local check before first push

Frontend:

```powershell
cd C:\Users\lim12\Documents\flowmind\frontend
npm run dev
```

Backend:

```powershell
cd C:\Users\lim12\Documents\flowmind\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Only do a short sanity check:

- frontend opens
- input box renders
- process button works
- pipeline section appears
- output card appears
- backend starts without crashing

## Step 4: First push

After the sanity check, push the current stable version first.

Suggested flow:

```powershell
cd C:\Users\lim12\Documents\flowmind
git status
git add .
git commit -m "Initial FlowMind scaffold and mock UI"
git push -u origin main
```

This first push is the safety checkpoint.

Do this before extra polish.

## After first push: next UI fixes

These are safe follow-up improvements after the first checkpoint is already on the remote.

### Fix 3: Confidence badge repeated twice

Current issue:

- confidence appears in the pipeline metadata area
- confidence also appears again in the output card header

This is slightly repetitive.

Recommended direction:

- keep confidence in the pipeline section
- remove confidence from the output card header
- keep `Input Type` in the output card header if needed

Why:

- the pipeline section is where interpretation happens
- the output card should focus on the structured result itself

## Fix 4: Done / Running / Pending badges feel too cute

Current issue:

- badges are a little too rounded
- colors feel slightly template-like
- visual tone is less mature than the rest of the page

Recommended direction:

- make pills smaller
- reduce border radius slightly
- soften the background colors
- keep only one strong blue active state
- keep green subdued for done
- keep gray understated for pending

Target feel:

- more product UI
- less demo template UI

## Output card layout improvement plan

Current issue:

- all cards feel similar in weight
- user does not know where to look first
- `Summary`, `Tasks`, `Timeline`, `Risks`, and `Next Action` compete too evenly

Recommended redesign direction:

### Layout hierarchy

1. Summary should be the dominant area
2. Next Action should be the second most visible item
3. Tasks and Timeline should feel medium priority
4. Risks should sit as a quieter footer section

### Practical UI changes

- make `Summary` wider and visually calmer
- keep `Next Action` strong but slightly smaller than `Summary`
- reduce box emphasis for `Tasks`, `Timeline`, and `Risks`
- use fewer repeated inner card outlines
- create more whitespace between sections instead of more borders

### Best reading order

The output card should guide the eye like this:

1. Summary
2. Next Action
3. Tasks
4. Timeline
5. Risks

That order matches how a judge or user usually scans the result.

## Recommended tomorrow schedule

Because work ends around 6:00 PM:

1. Reach home and do git setup first
2. Add `.gitignore`
3. Run quick sanity check
4. Make first push
5. If there is still time and energy, do Fix 3 and Fix 4
6. If still okay after that, improve output card hierarchy

If tired:

- stop after first push
- continue polish after the checkpoint is safe

That is still a win.

## Important mindset note

You do not need to feel fully confident before joining.

Right now you already have:

- a scaffold
- a story
- a UI
- a backend placeholder
- a next-step plan

That is more than many people have on Day 1.

Confidence usually comes after motion, not before it.

The correct next move is not "be sure first."
The correct next move is "secure the first checkpoint, then continue."
