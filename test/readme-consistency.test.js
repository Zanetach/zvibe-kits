const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('README examples keep dangerously-skip-permissions on claudeArgs only', () => {
  const readmePath = path.join(__dirname, '..', 'README.md');
  const readme = fs.readFileSync(readmePath, 'utf8');

  assert.equal(readme.includes('zvibe config set codexArgs --dangerously-skip-permissions'), false);
  assert.equal(readme.includes('zvibe config set claudeArgs --dangerously-skip-permissions'), true);
});
