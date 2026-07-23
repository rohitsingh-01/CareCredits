import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const poolsCode = fs.readFileSync(path.join(__dirname, '../pools.js'), 'utf8');

function setupMockBrowser() {
  const store = {};

  const mockLocalStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };

  const mockWindow = {
    addEventListener: () => {},
  };
  mockWindow.window = mockWindow;

  global.CarePools = undefined;

  const fn = new Function('window', 'localStorage', poolsCode);
  fn(mockWindow, mockLocalStorage);

  global.CarePools = mockWindow.CarePools;
  global.localStorage = mockLocalStorage;
}

describe('Milestone 5 CarePools Multi-Pool Registry & Selection Manager', () => {
  beforeEach(() => {
    setupMockBrowser();
  });

  it('Initializes with default primary pool', () => {
    const active = global.CarePools.getActivePool();
    assert.equal(active.id, 'CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN');
    assert.ok(active.title.includes('Primary'));
  });

  it('Returns list of all registered funding pools', () => {
    const allPools = global.CarePools.getAllPools();
    assert.ok(Array.isArray(allPools));
    assert.ok(allPools.length >= 3);
  });

  it('Switches active pool and persists choice in localStorage', () => {
    const secondaryId = 'CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224';
    const success = global.CarePools.setActivePool(secondaryId);

    assert.equal(success, true);
    const active = global.CarePools.getActivePool();
    assert.equal(active.id, secondaryId);
    assert.equal(global.localStorage.getItem('carecredits_active_pool_id'), secondaryId);
  });

  it('Supports dynamically adding a new pool instance', () => {
    const newPool = {
      id: 'C_MOCK_NEW_POOL_ID_999999',
      title: '🌟 Emergency Cardiac Care Pool',
      caregiver: 'GA000000000000000000000000000000000000000000000000000000',
      goalXlm: 200.0,
    };

    const added = global.CarePools.addPool(newPool);
    assert.equal(added, true);

    const allPools = global.CarePools.getAllPools();
    assert.ok(allPools.some(p => p.id === newPool.id));
  });

  it('CarePools.reset() clears active selection back to default primary pool', () => {
    global.CarePools.setActivePool('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
    assert.equal(global.CarePools.getActivePool().id, 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');

    global.CarePools.reset();
    assert.equal(global.CarePools.getActivePool().id, 'CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN');
  });
});
