#!/usr/bin/env node
const { spawn, spawnSync } = require('child_process');
const path = require('path');

function toInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.floor(n);
}

const durationSec = Math.max(10, toInt(process.env.ZVIBE_SMOKE_DURATION_SEC, 120));
const sampleEverySec = Math.max(1, toInt(process.env.ZVIBE_SMOKE_SAMPLE_SEC, 5));
const maxGrowthMb = Math.max(16, toInt(process.env.ZVIBE_SMOKE_MAX_GROWTH_MB, 80));

const statusBarScript = path.join(__dirname, '..', 'src', 'tools', 'status-bar.js');
const child = spawn(process.execPath, [statusBarScript], {
  stdio: ['ignore', 'ignore', 'ignore'],
  env: {
    ...process.env,
    ZVIBE_NO_AGENT: '1',
    NO_COLOR: '1'
  }
});

function readRssKb(pid) {
  const result = spawnSync('ps', ['-o', 'rss=', '-p', String(pid)], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 1200
  });
  if (result.error && (result.error.code === 'EPERM' || result.error.code === 'EACCES')) {
    return { permissionDenied: true };
  }
  if (result.status !== 0) return null;
  const rss = Number(String(result.stdout || '').trim());
  if (!Number.isFinite(rss)) return null;
  return rss;
}

const samples = [];
const startedAt = Date.now();
let done = false;
let childExitCode = null;
let metricsPermissionDenied = false;

function cleanup(exitCode) {
  if (done) return;
  done = true;
  try { child.kill('SIGTERM'); } catch {}
  process.exit(exitCode);
}

child.on('error', () => cleanup(1));
child.on('exit', (code) => {
  childExitCode = code;
  if (!done && code !== 0) cleanup(1);
});

const sampler = setInterval(() => {
  const rss = readRssKb(child.pid);
  if (rss == null) return;
  if (rss && rss.permissionDenied) {
    metricsPermissionDenied = true;
    return;
  }
  samples.push(rss);
}, sampleEverySec * 1000);

setTimeout(() => {
  clearInterval(sampler);
  try { child.kill('SIGTERM'); } catch {}

  if (childExitCode && childExitCode !== 0) {
    console.error(`smoke-memory: status-bar exited unexpectedly (${childExitCode})`);
    process.exit(1);
  }
  if (metricsPermissionDenied) {
    process.stdout.write('smoke-memory: skipped (process RSS metrics access denied by runtime permissions)\n');
    process.exit(0);
  }
  if (samples.length < 2) {
    console.error('smoke-memory: insufficient samples');
    process.exit(1);
  }

  const minRss = Math.min(...samples);
  const maxRss = Math.max(...samples);
  const growthKb = maxRss - minRss;
  const growthMb = growthKb / 1024;
  const elapsedSec = Math.round((Date.now() - startedAt) / 1000);

  process.stdout.write(
    `smoke-memory: duration=${elapsedSec}s samples=${samples.length} min=${(minRss / 1024).toFixed(1)}MB max=${(maxRss / 1024).toFixed(1)}MB growth=${growthMb.toFixed(1)}MB threshold=${maxGrowthMb}MB\n`
  );

  if (growthMb > maxGrowthMb) {
    console.error(`smoke-memory: failed (growth ${growthMb.toFixed(1)}MB > ${maxGrowthMb}MB)`);
    process.exit(1);
  }
  process.stdout.write('smoke-memory: passed\n');
  process.exit(0);
}, durationSec * 1000);
