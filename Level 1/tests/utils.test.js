import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stroopsToXlm,
  xlmToStroops,
  calculateProgressPercent,
  truncateAddress,
  classifyError,
  errorMessageFor
} from '../utils.js';

test('utils.js unit tests', async (t) => {
  await t.test('stroopsToXlm conversion', () => {
    assert.equal(stroopsToXlm(10000000), '1');
    assert.equal(stroopsToXlm(5000000), '0.5');
    assert.equal(stroopsToXlm('25000000'), '2.5');
    assert.equal(stroopsToXlm('abc'), '0');
  });

  await t.test('xlmToStroops conversion', () => {
    assert.equal(xlmToStroops(1), 10000000);
    assert.equal(xlmToStroops('0.5'), 5000000);
    assert.equal(xlmToStroops('2.5'), 25000000);
    assert.equal(xlmToStroops(-1.5), 0);
    assert.equal(xlmToStroops('xyz'), 0);
  });

  await t.test('calculateProgressPercent math and bounds', () => {
    assert.equal(calculateProgressPercent(50, 100), 50);
    assert.equal(calculateProgressPercent(120, 100), 100); // capped at 100
    assert.equal(calculateProgressPercent(-10, 100), 0); // floor at 0
    assert.equal(calculateProgressPercent(50, 0), 0); // division by zero safety
    assert.equal(calculateProgressPercent(50, -100), 0); // invalid goal safety
    assert.equal(calculateProgressPercent('abc', 100), 0); // invalid raised safety
  });

  await t.test('truncateAddress length and format', () => {
    assert.equal(truncateAddress('GCYRYFQXKWKPI74B23SKUZXQOKIY6CZUUS7AWDGX6MRPNKGVSEKTDAEL'), 'GCYRYF...DAEL');
    assert.equal(truncateAddress('CDX2BJAF'), 'CDX2BJAF'); // short strings unchanged
    assert.equal(truncateAddress(''), '');
    assert.equal(truncateAddress(null), '');
  });

  await t.test('classifyError classification branches', () => {
    assert.equal(classifyError(new Error('Freighter wallet not found')), 'WALLET_NOT_FOUND');
    assert.equal(classifyError('User rejected transaction submission'), 'USER_REJECTED');
    assert.equal(classifyError({ message: 'insufficient balance available' }), 'INSUFFICIENT_BALANCE');
    assert.equal(classifyError('random network glitch'), 'UNKNOWN_ERROR');
  });

  await t.test('errorMessageFor code lookups', () => {
    assert.match(errorMessageFor('WALLET_NOT_FOUND'), /Freighter/);
    assert.match(errorMessageFor('USER_REJECTED'), /rejected/);
    assert.match(errorMessageFor('INSUFFICIENT_BALANCE'), /insufficient/);
    assert.match(errorMessageFor('UNKNOWN_ERROR'), /unexpected/);
  });
});
