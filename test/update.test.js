const test = require('node:test');
const assert = require('node:assert/strict');

const { cmdUpdate } = require('../src/cli');
const { ZvibeError, ERRORS } = require('../src/core/errors');

function createOutput() {
  return {
    info() {},
    ok() {},
    warn() {},
    error() {},
    flushJson() {}
  };
}

function okResult() {
  return { ok: true, code: 0, stdout: '', stderr: '', error: '' };
}

test('cmdUpdate fails fast when brew update fails', () => {
  const output = createOutput();

  assert.throws(() => cmdUpdate(output, {
    needMacOS: () => {},
    commandExists: (cmd) => cmd === 'brew',
    loadConfig: () => ({ config: { managedAgents: [] } }),
    run: (command, args) => {
      if (command === 'brew' && args[0] === 'update') {
        return { ok: false, code: 1, stdout: '', stderr: 'network down', error: '' };
      }
      return okResult();
    },
    checkSetupState: () => [],
    reportSetupState: () => [],
    ensurePluginConfigs: () => {}
  }), (error) => {
    assert.equal(error instanceof ZvibeError, true);
    assert.equal(error.code, ERRORS.RUN_FAILED);
    assert.match(error.message, /brew update 失败/);
    return true;
  });
});

test('cmdUpdate fails when codex managed but npm is missing', () => {
  const output = createOutput();

  assert.throws(() => cmdUpdate(output, {
    needMacOS: () => {},
    commandExists: (cmd) => {
      if (cmd === 'brew') return true;
      if (cmd === 'codex') return true;
      if (cmd === 'npm') return false;
      return false;
    },
    loadConfig: () => ({ config: { managedAgents: ['codex'] } }),
    run: () => okResult(),
    checkSetupState: () => [],
    reportSetupState: () => [],
    ensurePluginConfigs: () => {}
  }), (error) => {
    assert.equal(error instanceof ZvibeError, true);
    assert.equal(error.code, ERRORS.COMMAND_MISSING);
    assert.match(error.message, /缺少 npm/);
    return true;
  });
});

test('cmdUpdate fails when brew cleanup fails', () => {
  const output = createOutput();

  assert.throws(() => cmdUpdate(output, {
    needMacOS: () => {},
    commandExists: (cmd) => cmd === 'brew',
    loadConfig: () => ({ config: { managedAgents: [] } }),
    run: (command, args) => {
      if (command === 'brew' && args[0] === 'cleanup') {
        return { ok: false, code: 1, stdout: '', stderr: 'cleanup denied', error: '' };
      }
      return okResult();
    },
    checkSetupState: () => [],
    reportSetupState: () => [],
    ensurePluginConfigs: () => {}
  }), (error) => {
    assert.equal(error instanceof ZvibeError, true);
    assert.equal(error.code, ERRORS.RUN_FAILED);
    assert.match(error.message, /brew cleanup 失败/);
    return true;
  });
});

test('cmdUpdate upgrades managed codex via npm install -g', () => {
  const output = createOutput();
  const calls = [];

  cmdUpdate(output, {
    needMacOS: () => {},
    commandExists: (cmd) => {
      if (cmd === 'brew') return true;
      if (cmd === 'codex') return true;
      if (cmd === 'npm') return true;
      return false;
    },
    loadConfig: () => ({ config: { managedAgents: ['codex'] } }),
    run: (command, args) => {
      calls.push([command, ...(args || [])]);
      return okResult();
    },
    checkSetupState: () => [],
    reportSetupState: () => [],
    ensurePluginConfigs: () => {}
  });

  assert.equal(calls.some((item) => item[0] === 'brew' && item[1] === 'update'), true);
  assert.equal(calls.some((item) => item[0] === 'npm' && item[1] === 'install' && item[2] === '-g' && item[3] === '@openai/codex@latest'), true);
  assert.equal(calls.some((item) => item[0] === 'brew' && item[1] === 'cleanup'), true);
});

test('cmdUpdate retries managed claude upgrade invocations until one succeeds', () => {
  const output = createOutput();
  const calls = [];

  cmdUpdate(output, {
    needMacOS: () => {},
    commandExists: (cmd) => cmd === 'brew',
    loadConfig: () => ({ config: { managedAgents: ['claude'] } }),
    run: (command, args) => {
      calls.push([command, ...(args || [])]);
      if (command === 'claude' && args[0] === 'update') {
        return { ok: false, code: 1, stdout: '', stderr: 'failed once', error: '' };
      }
      return okResult();
    },
    isClaudeAvailable: () => true,
    getClaudeUpgradeInvocations: () => [
      ['claude', 'update'],
      ['claude', 'upgrade']
    ],
    checkSetupState: () => [],
    reportSetupState: () => [],
    ensurePluginConfigs: () => {}
  });

  assert.equal(calls.some((item) => item[0] === 'claude' && item[1] === 'update'), true);
  assert.equal(calls.some((item) => item[0] === 'claude' && item[1] === 'upgrade'), true);
});

test('cmdUpdate does not run npm codex upgrade when codex is unmanaged', () => {
  const output = createOutput();
  const calls = [];

  cmdUpdate(output, {
    needMacOS: () => {},
    commandExists: (cmd) => cmd === 'brew',
    loadConfig: () => ({ config: { managedAgents: [] } }),
    run: (command, args) => {
      calls.push([command, ...(args || [])]);
      return okResult();
    },
    checkSetupState: () => [],
    reportSetupState: () => [],
    ensurePluginConfigs: () => {}
  });

  assert.equal(calls.some((item) => item[0] === 'npm' && item[1] === 'install' && item[3] === '@openai/codex@latest'), false);
});
