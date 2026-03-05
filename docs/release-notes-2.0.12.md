# Release Notes v2.0.12

Date: 2026-03-05

## Highlights

- Status bar layout priority refactor for better visibility on wide and narrow terminals.
- Ping refresh changed to 1s interval.
- Disk display standardized to `total/free` format and positioned with right-side system indicators.
- CPU/GPU/MEM trendlines now render with distinct colors.
- Removed ETA/Cost/TPS display from the bar.

## Session and Runtime

- Added `zvibe session -k all` / `zvibe session kill all`.
- Improved session filtering and naming behavior for zvibe-managed sessions.
- Reduced command-probe overhead in status/session flows.

## Stability and Quality

- Added `verify:syntax` and `verify:test`.
- Added automated tests for config, session filtering/naming, and status-bar layout helpers.
- `prepack` now runs `verify:all` (syntax + tests + bin verification).

## Notes

- This release does not include unrelated `video/` directory deletions.
