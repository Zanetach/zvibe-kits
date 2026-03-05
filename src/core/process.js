const { spawnSync } = require('child_process');

const commandExistsCache = new Map();

function run(command, args = [], options = {}) {
  const normalizedArgs = Array.isArray(args) ? args.map((item) => String(item)) : [];
  const spawnOptions = {
    stdio: options.capture ? 'pipe' : 'inherit',
    cwd: options.cwd || process.cwd(),
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8'
  };
  if (Number.isFinite(options.timeoutMs) && options.timeoutMs > 0) {
    spawnOptions.timeout = Math.floor(options.timeoutMs);
  }

  const result = spawnSync(command, normalizedArgs, spawnOptions);
  const message = result.error ? String(result.error.message || result.error) : '';

  return {
    ok: result.status === 0,
    code: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: message
  };
}

function commandExists(cmd) {
  const key = String(cmd || '').trim();
  if (!key) return false;
  if (commandExistsCache.has(key)) return commandExistsCache.get(key);

  const result = spawnSync('which', [key], {
    stdio: 'pipe',
    encoding: 'utf8',
    timeout: 1500
  });
  const exists = result.status === 0;
  commandExistsCache.set(key, exists);
  return exists;
}

function commandExistsMany(commands) {
  const list = Array.from(new Set((Array.isArray(commands) ? commands : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)));
  const out = {};
  list.forEach((cmd) => { out[cmd] = false; });
  if (list.length === 0) return out;

  const checkList = [];
  list.forEach((cmd) => {
    if (commandExistsCache.has(cmd)) {
      out[cmd] = commandExistsCache.get(cmd);
    } else {
      checkList.push(cmd);
    }
  });
  if (checkList.length === 0) return out;

  const result = spawnSync('sh', ['-lc', checkList.map((cmd) => `command -v ${cmd} >/dev/null 2>&1 && echo 1 || echo 0`).join('; ')], {
    stdio: 'pipe',
    encoding: 'utf8',
    timeout: 2500
  });
  if (result.status !== 0 && !result.stdout) {
    checkList.forEach((cmd) => {
      out[cmd] = false;
      commandExistsCache.set(cmd, false);
    });
    return out;
  }

  const lines = String(result.stdout || '').trim().split('\n');
  checkList.forEach((cmd, idx) => {
    const ok = lines[idx] === '1';
    out[cmd] = ok;
    commandExistsCache.set(cmd, ok);
  });
  return out;
}

function clearCommandExistsCache() {
  commandExistsCache.clear();
}

module.exports = { run, commandExists, commandExistsMany, clearCommandExistsCache };
