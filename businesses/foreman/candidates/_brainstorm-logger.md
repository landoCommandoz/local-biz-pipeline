# Brainstorm: Shared logger / state manager

*Brief: append to log.md, atomically update state.json, handle concurrent writes. $0 cost.*

Divergent list (14 considered):

1. **pino** — fast JSON logger, streaming, huge ecosystem. MIT. Logging side only.
2. **winston** — older, transport system, heavier. MIT. Logging side only.
3. **bunyan** — Joyent-era JSON logger. MIT. Maintenance soft.
4. **consola** — pretty console output, UnJS. MIT. Developer-ergonomic.
5. **lowdb** — JSON file database, atomic writes. MIT. State side. Jest-style.
6. **conf** — key/value config file, atomic. MIT. Sindre Sorhus.
7. **proper-lockfile** — file locking primitive. MIT. Handles concurrent writes.
8. **write-file-atomic** — atomic file writes for Node. ISC. Sindre Sorhus / npm-core.
9. **node-persist** — persistent key-value. MIT. Heavier than needed.
10. **steno** — atomic JSON writes, used internally by lowdb. MIT.
11. **keyv** — unified storage API. MIT. Pluggable backends, overkill here.
12. **LevelDB via level** — embedded KV. MIT. Bigger hammer.
13. **fs.promises.writeFile + temp-file swap** — hand-rolled atomic. Pure Node.
14. **rusha + fs append** — naive append, not safe under concurrency.

Shortlist (top 3 for full dossier):
- **pino + write-file-atomic** pair — pino for log streaming (stdout/JSON), write-file-atomic for state.json swaps. Small, fast, MIT/ISC, both mature.
- **lowdb** — single-library handles state.json side, atomic by default, easy API.
- **proper-lockfile** wrapped around hand-rolled append — if we want the tightest control, this is the concurrency primitive the others build on.

Dropped:
- winston (heavier, pino is the modern choice)
- bunyan (slow maintenance)
- consola (pretty, not the storage side)
- conf (works but scoped to user config dirs by default)
- node-persist (overkill)
- steno (low-level, lowdb already wraps it)
- keyv (unnecessary abstraction)
- LevelDB (wrong tool)
- naive append (unsafe under concurrent ticks)
