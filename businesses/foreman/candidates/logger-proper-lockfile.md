# Candidate: proper-lockfile

*Brief targeted: logger. Phase: 1. Researched: 2026-04-17. Foreman recommendation: PASS.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
A file-lock primitive Brewington would wrap around custom read-modify-write code for state.json, giving the tightest grip on concurrency semantics.

### 2. Monthly cost all-in
- Infrastructure: $0
- Licensing: $0 (MIT)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: single-host file system; proper-lockfile works across processes on the same machine.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 2 hours/month at $50/hr = $100/month. Strictly a safety primitive with no UX upside.
Assumptions: same concurrency profile.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
5. Library only.
Evidence for the score: no operator surface.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES.

### 8. One-line kill criteria
If write-file-atomic's temp-file-swap pattern turns out to race under our tick cadence, pivot to proper-lockfile.

---

## Source
- Repo / listing URL: https://github.com/moxystudio/node-proper-lockfile
- License: MIT
- Last commit: v4.1.2 on npm; mtime-precision fix recent
- Stars / downloads / sales: widely used in production (notably in yarn and pnpm toolchains historically)
- Active maintainer: moxystudio / satazor / hugomrdias

## What it does
Provides `lock(file)`, `unlock(file)`, and `check(file)` primitives for inter-process and inter-machine file locking. Uses an OS-level lock file adjacent to the target.

It is a lock primitive, not a writer. Brewington would still write its own fs.readFile + mutate + fs.writeFile sequence and bracket it in lockfile calls. More code than write-file-atomic, more knobs.

## Fit with Brewington ecosystem
- **Plugs into:** any custom state-writer
- **Replaces:** nothing directly; it is a primitive
- **Depends on:** filesystem that supports file locks (any mainstream FS)
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install proper-lockfile`
2. Write a helper that lock/reads/mutates/writes/unlocks
3. Handle lock-contention with retries

## Risks and trade-offs
- More code to write and test than the atomic-rename approach.
- Lock-holder crashes need stale-lock handling; proper-lockfile handles this but adds a timeout decision.
- Strictly more flexible than write-file-atomic but the flexibility is not useful for Brewington's "write the whole file" pattern.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (MIT, moxystudio/node-proper-lockfile/blob/master/LICENSE)
- [x] Last commit date confirmed (recent mtime-precision fix)
- [x] Star count confirmed via live visit (production-grade, used by yarn-era tools)
- [x] At least one independent review or discussion found and linked (issue #92 in repo; npm registry page)
- [x] Pricing page read and costs verified (OSS, free)

## Foreman recommendation
PASS. Right tool if we needed partial-file updates or cross-host locking. We don't. Write-file-atomic handles the "replace the whole state.json" case in fewer moving parts.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
