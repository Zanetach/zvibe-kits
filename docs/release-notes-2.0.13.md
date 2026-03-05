# Release Notes v2.0.13

Date: 2026-03-06

## Highlights

- Added explicit CLI version output flags:
  - `zvibe -v`
  - `zvibe --version`
  - `zvibe --v`
- Version flags now always print **zvibe's own version number** and exit immediately.

## CLI Behavior

- `-v/--version/--v` is handled as a global version command and does not enter run/setup/session flows.
- Help text now documents all supported version flags.

## Notes

- This release keeps current workspace scope and does not restore unrelated local deletions under `video/` or historical `*.tgz` files.
