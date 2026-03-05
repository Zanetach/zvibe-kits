const test = require('node:test');
const assert = require('node:assert/strict');

const { defaultConfig, normalizeBackend, validate, mergeWithPriority } = require('../src/core/config');
const { ZvibeError, ERRORS } = require('../src/core/errors');

test('normalizeBackend maps legacy aliases to zellij', () => {
  assert.equal(normalizeBackend('zellij'), 'zellij');
  assert.equal(normalizeBackend('ghostty'), 'zellij');
  assert.equal(normalizeBackend('tmux'), 'zellij');
  assert.equal(normalizeBackend('auto'), 'zellij');
});

test('validate accepts a strict, initialized config', () => {
  const cfg = {
    ...defaultConfig(),
    defaultAgent: 'codex',
    agentPair: ['claude', 'opencode'],
    initialized: true
  };
  assert.equal(validate(cfg, { strict: true }), true);
});

test('validate rejects invalid agent pair in strict mode', () => {
  const cfg = {
    ...defaultConfig(),
    defaultAgent: 'codex',
    agentPair: ['codex', 'unknown'],
    initialized: true
  };
  assert.throws(() => validate(cfg, { strict: true }), (error) => {
    assert.equal(error instanceof ZvibeError, true);
    assert.equal(error.code, ERRORS.CONFIG_INVALID);
    return true;
  });
});

test('mergeWithPriority keeps CLI overrides and config defaults', () => {
  const merged = mergeWithPriority(
    { defaultAgent: 'claude', rightTerminal: true },
    {
      ...defaultConfig(),
      defaultAgent: 'codex',
      agentPair: ['codex', 'opencode'],
      backend: 'zellij',
      initialized: true
    }
  );
  assert.equal(merged.defaultAgent, 'claude');
  assert.deepEqual(merged.agentPair, ['codex', 'opencode']);
  assert.equal(merged.rightTerminal, true);
  assert.equal(merged.initialized, true);
});
