# Zvibe 2.0.17 Release Notes

## Highlights

- Improved config/setup interaction flow:
  - Agent-specific parameter prompts now follow immediately after each agent selection.
- Added Codex mode toggle support in wizard/setup:
  - `--full-auto` can be enabled/disabled via yes/no prompts.
- Improved update reliability:
  - `brew update` / `brew cleanup` failures now fail fast with actionable errors.
  - Managed Codex upgrade now validates `npm` availability and reports upgrade stderr/stdout.
- Improved status-bar performance and responsiveness:
  - Added sampler subprocess architecture so render loop consumes cached telemetry.
  - Reduced render-loop blocking from heavy sampling commands.
- Added memory safety guards:
  - `Output.events` now keeps a bounded event buffer (default 500).
  - Added status-bar memory smoke script.

## Validation

- `npm run verify:syntax`
- `npm run verify:test`
- `npm run verify:bin`
- `npm run verify:smoke-memory` (may skip in restricted runtime if RSS metrics are denied)
