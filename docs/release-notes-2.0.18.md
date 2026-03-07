# Zvibe 2.0.18 Release Notes

## Patch

- Hardened command resolution for unknown top-level tokens.
- `zvibe v` and other plain unknown tokens now return a clear "unknown command" error instead of accidentally entering run mode.
- Added regression tests for command resolution behavior.

## Validation

- `npm run verify:syntax`
- `npm run verify:test`
- `npm run verify:bin`
