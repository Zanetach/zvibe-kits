const test = require('node:test');
const assert = require('node:assert/strict');

const { sessionName, normalizeSessionInput, filterZvibeSessions } = require('../src/backends/zellij');

test('sessionName normalizes target dir and appends session tag', () => {
  const name = sessionName('/Users/zane/Documents/Coderepo/zvibe-kits', 'codex-ab12');
  assert.equal(name, 'zvibe-codex-ab12');
});

test('sessionName falls back to workspace on empty base', () => {
  const name = sessionName('/', 'terminal-xx22');
  assert.equal(name, 'workspace-terminal-xx22');
});

test('normalizeSessionInput trims surrounding spaces', () => {
  assert.equal(normalizeSessionInput('  demo-session  '), 'demo-session');
});

test('filterZvibeSessions keeps legacy and current zvibe sessions only', () => {
  const output = [
    'zippy-weasel',
    'zvibe-legacy-aa11',
    'Coderepo-claude-ga41',
    'Coderepo-codex-xy22',
    'RandomSession',
    'workspace-terminal-ab12'
  ].join('\n');
  const filtered = filterZvibeSessions(output);
  assert.deepEqual(filtered, [
    'zvibe-legacy-aa11',
    'Coderepo-claude-ga41',
    'Coderepo-codex-xy22',
    'workspace-terminal-ab12'
  ]);
});
