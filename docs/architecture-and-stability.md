# Zvibe Architecture & Stability Baseline

## 1) Runtime architecture

- `bin/zvibe`: global entrypoint shim, resolves symlinked npm global path.
- `src/cli.js`: command parser + orchestration layer.
- `src/core/*`: shared concerns.
  - `config.js`: config load/validate/merge.
  - `process.js`: subprocess execution and command discovery.
  - `agents.js`: agent command resolution.
  - `io.js`: user-facing output/events.
- `src/backends/zellij.js`: session naming, layout generation, launch/attach/kill/list.
- `src/tools/status-bar.js`: live telemetry renderer for the state pane.

## 2) Reliability principles

- Fail fast with actionable errors (`ZvibeError + hint`).
- Keep launch path deterministic:
  - resolve config first,
  - derive session name from mode + target,
  - launch or attach with explicit policy (`--fresh-session`).
- Keep session operations scoped to zvibe-managed names only.
- Avoid unnecessary privileged operations by default.

## 3) Performance principles

- Minimize shell/process churn:
  - cache command existence checks in-process,
  - avoid collecting metrics that are not displayed.
- Bound expensive subprocess calls with timeout when used in probe mode.
- Keep status bar rendering stable under large/small terminal widths by truncating fields safely.

## 4) Current baseline checks

- `npm run verify:syntax`: syntax check all JS entry/runtime files.
- `npm run verify:bin`: validate global-bin symlink startup behavior.
- `npm run verify:all`: full prepack gate.

## 5) Next hardening iterations

- Add focused tests for:
  - session name generation and filtering,
  - config migration and strict validation,
  - no-agent status-bar field packing.
- Add startup latency instrumentation (`zvibe status --doctor --json` timestamps).
- Add optional watchdog for long-running setup/update operations.
