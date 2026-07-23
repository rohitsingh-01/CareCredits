import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  stroopsToXlm,
  xlmToStroops,
  calculateProgressPercent,
  truncateAddress,
} from '../utils.js';
import { CAREGIVERS, findCaregiverById } from '../caregivers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const onboardingCode = fs.readFileSync(path.join(__dirname, '../onboarding.js'), 'utf8');
const feedbackCode = fs.readFileSync(path.join(__dirname, '../feedback.js'), 'utf8');
const poolsCode = fs.readFileSync(path.join(__dirname, '../pools.js'), 'utf8');

function setupMockEnvironment() {
  const store = {};

  const mockLocalStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };

  function createMockElement(id, tag = 'div') {
    const el = {
      id,
      tagName: tag.toUpperCase(),
      className: '',
      innerHTML: '',
      value: '',
      style: {},
      disabled: false,
      classList: {
        contains: (c) => el.className.includes(c),
        add: (...cs) => {
          const set = new Set(el.className.split(' ').filter(Boolean));
          cs.forEach(c => set.add(c));
          el.className = Array.from(set).join(' ');
        },
        remove: (...cs) => {
          const set = new Set(el.className.split(' ').filter(Boolean));
          cs.forEach(c => set.delete(c));
          el.className = Array.from(set).join(' ');
        },
        toggle: (c, force) => {
          if (force === true) el.classList.add(c);
          else if (force === false) el.classList.remove(c);
        },
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => createMockElement('sub-el'),
      querySelectorAll: () => [createMockElement('item')],
      appendChild: (child) => child,
      focus: () => {},
    };
    return el;
  }

  const mockDocument = {
    createElement: (tag) => createMockElement('created', tag),
    getElementById: (id) => createMockElement(id),
    querySelector: () => createMockElement('modal'),
    querySelectorAll: () => [createMockElement('btn')],
    body: createMockElement('body'),
    addEventListener: () => {},
  };

  const mockWindow = {
    addEventListener: () => {},
    location: { href: 'http://localhost:3000/index.html', search: '' },
    navigator: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    document: mockDocument,
    fetch: async () => ({ ok: true, json: async () => ({ success: true }) }),
  };
  mockWindow.window = mockWindow;

  global.window = mockWindow;
  global.document = mockDocument;
  global.localStorage = mockLocalStorage;

  new Function('window', 'localStorage', onboardingCode)(mockWindow, mockLocalStorage);
  new Function('window', 'localStorage', feedbackCode)(mockWindow, mockLocalStorage);
  new Function('window', 'localStorage', poolsCode)(mockWindow, mockLocalStorage);

  global.CareOnboarding = mockWindow.CareOnboarding;
  global.CareFeedback = mockWindow.CareFeedback;
  global.CarePools = mockWindow.CarePools;
}

describe('Milestone 7 Comprehensive End-to-End Frontend Workflows Test Suite', () => {
  beforeEach(() => {
    setupMockEnvironment();
  });

  it('Journey 1: First-Time Visitor & CareOnboarding FSM', () => {
    global.CareOnboarding.reset();
    assert.equal(global.CareOnboarding.getState(), 'IDLE');
    global.CareOnboarding.open();
    assert.equal(global.CareOnboarding.getState(), 'STEP_1');

    global.CareOnboarding.nextStep();
    assert.equal(global.CareOnboarding.getState(), 'STEP_2');

    global.CareOnboarding.nextStep();
    assert.equal(global.CareOnboarding.getState(), 'STEP_3');

    global.CareOnboarding.nextStep();
    assert.equal(global.CareOnboarding.getState(), 'COMPLETED');
    assert.equal(global.localStorage.getItem('carecredits_onboarded'), 'true');
  });

  it('Journey 2: Caregiver Discovery & Lookup', () => {
    assert.ok(Array.isArray(CAREGIVERS));
    assert.ok(CAREGIVERS.length >= 2);

    const found = findCaregiverById('sarah-jenkins');
    assert.ok(found);
    assert.equal(found.name, 'Sarah Jenkins');
    assert.equal(found.publicKey, 'GCYRYFQXKWKPI74B23SKUZXQOKIY6CZUUS7AWDGX6MRPNKGVSEKTDAEL');
  });

  it('Journey 3: Pool Contribution Math & Conversion Helpers', () => {
    const stroops = xlmToStroops('10.5');
    assert.equal(stroops, 105000000);

    const xlm = stroopsToXlm(105000000);
    assert.equal(xlm, '10.5');

    const progress = calculateProgressPercent(35.5, 50.0);
    assert.equal(progress, 71);

    const truncated = truncateAddress('GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV');
    assert.equal(truncated, 'GCX7XQ...GGMV');
  });

  it('Journey 4: Multi-Pool Registry & Active Pool Switcher', () => {
    global.CarePools.reset();
    const active = global.CarePools.getActivePool();
    assert.equal(active.id, 'CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN');

    const switched = global.CarePools.setActivePool('CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224');
    assert.equal(switched, true);
    assert.equal(global.CarePools.getActivePool().id, 'CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224');
  });

  it('Journey 5: User Experience Center & 4-Step Feedback Flow', () => {
    global.CareFeedback.reset();
    assert.equal(global.CareFeedback.getState(), 'IDLE');
    global.CareFeedback.open('manual');
    assert.equal(global.CareFeedback.getState(), 'STEP_RATING');

    global.CareFeedback.close();
    assert.equal(global.CareFeedback.getState(), 'IDLE');
  });
});
