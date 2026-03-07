const test = require('node:test');
const assert = require('node:assert/strict');

const { Output } = require('../src/core/io');

test('Output keeps only the latest maxEvents entries', () => {
  const out = new Output({ json: true, maxEvents: 3 });
  out.info('a');
  out.info('b');
  out.info('c');
  out.info('d');

  assert.equal(out.events.length, 3);
  assert.deepEqual(out.events.map((item) => item.message), ['b', 'c', 'd']);
});
