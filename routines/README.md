# Yard Routines (Claude Code Remote Routines)

Remote routines are Anthropic-hosted cron jobs that spawn a Claude Code session, clone this repo, run a prompt, and push results back. Your machine can be off; they still fire. Requires a Claude Pro or Max plan.

This folder holds the **prompt body** for each routine. The cron schedule, environment, and permissions live in Claude Desktop — not in this repo.

## Current routines

| File | Bay | Cadence | Purpose |
|------|-----|---------|---------|
| `hank-sunday-hunt.md` | Foreman | Sun 09:00 | Weekly Phase 2 agent hunt, 3 dossiers per brief, commits back |

## Setup for each routine (one-time, in Claude Desktop)

1. Open the **Claude Desktop app**.
2. Left sidebar → **Routines** → **New routine** → **Remote**.
3. Fill in:
   - **Name:** e.g. `hank-sunday-hunt`
   - **Repo:** `github.com/<you>/local-biz-pipeline` (this repo)
   - **Branch:** `main`
   - **Environment:** new or existing (see next section)
   - **Cron:** copy from the top of the corresponding `.md` file in this folder
   - **Model:** Claude Opus 4.7 (or whatever is current and strongest for your plan)
4. **Permissions** → enable **"Allow unrestricted branch pushes"** so the routine can commit back to `main`.
5. **Prompt** → paste the contents of the prompt section from the routine's `.md` file (everything under the `## Prompt` header, up to the `## Claude Desktop wiring` footer).
6. Save.
7. **Run now** once before enabling the cron — confirm it works, check the resulting commit.

## Environment setup (one-time, shared across routines)

Create a Claude Desktop environment named `yard`:

- **Network access:** full
- **Environment variables:**
  - `ANTHROPIC_API_KEY` — same one you have in `.env` locally. Required if the routine's skills fire sub-agent LLM calls.
  - `GITHUB_TOKEN` — a personal access token with `repo` scope, so the routine can push. Claude Desktop may handle this for you via its GitHub auth; if it doesn't, add it here.

Every routine in this folder assumes the `yard` environment unless it says otherwise.

## How to add a new routine

1. Write a new `.md` file in this folder following the `hank-sunday-hunt.md` structure:
   - `## Cron` block at top
   - `## Environment expected` list
   - `## Prompt` section with the full instruction body
2. Test locally first: copy the prompt into a fresh Claude Code session in VS Code on your machine, with the yard repo open. Make sure it completes cleanly.
3. Wire it in Claude Desktop using the steps above.
4. Run once manually. If the commit lands clean, enable the schedule.

## Cost and limits

- Each routine fire burns context from your Claude plan.
- Budget per fire: aim for under 150k tokens. Prompts in this folder are tuned for that.
- If you're on the Pro plan, Hank's weekly hunt is ~1 fire/week. Jax's designer, if moved to a routine, would be ~1 fire per brief (rare). Bay ticks that use routines should be measured and kept sparse.
- Routines failing repeatedly will show up in Claude Desktop's run history. Check there before debugging the prompt.

## What stays local (not a routine)

- `businesses/scheduler.js` — deterministic cron for bay ticks. Stays on Fly.io.
- `businesses/server.js` — god-view dashboard. Stays on Fly.io.
- Deterministic tick plumbing (state writes, rent math, log appends). No LLM needed.

Routines are for the **LLM-heavy moments** only: hunts, design runs, application triage. Everything else stays in local code.
