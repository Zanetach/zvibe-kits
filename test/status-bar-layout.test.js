const test = require('node:test');
const assert = require('node:assert/strict');

const {
  visibleLength,
  fillLineToWidth,
  packFieldsByWidth,
  segmentRatios,
  layoutThreeColumns
} = require('../src/tools/status-bar');

test('packFieldsByWidth keeps left-first order and respects width', () => {
  const fields = ['CPU 20%', 'GPU 10%', 'MEM 30%', 'DISK 2.0TB/500G', 'NET 10KB/s'];
  const packed = packFieldsByWidth(fields, 28, ' | ');
  assert.equal(packed.startsWith('CPU 20% | GPU 10%'), true);
  assert.equal(packed.includes('DISK 2.0TB/500G'), false);
  assert.equal(visibleLength(packed) <= 28, true);
});

test('fillLineToWidth fully fills the requested visible width', () => {
  const line = fillLineToWidth('ABC', 10);
  assert.equal(visibleLength(line), 10);
  assert.equal(line.startsWith('ABC'), true);
});

test('segmentRatios always sum to 1', () => {
  [100, 120, 150, 180, 240].forEach((width) => {
    const ratios = segmentRatios(width);
    const sum = ratios.reduce((acc, n) => acc + n, 0);
    assert.equal(Number(sum.toFixed(6)), 1);
  });
});

test('layoutThreeColumns keeps right segment visible on wide screens', () => {
  const left = 'CPU 12% MEM 40% DISK 2.0TB/500G NET 10KB/s';
  const middle = 'MODEL gpt-5.3 TOK T 55.2K TPS 22.5';
  const right = 'UP 103h LA 4.1 BAT 98% DATE 03-05 21:16';
  const line = layoutThreeColumns(left, middle, right, 180);
  assert.equal(line.includes('UP 103h'), true);
  assert.equal(line.includes('DATE 03-05 21:16'), true);
  assert.equal(visibleLength(line) <= 180, true);
});
