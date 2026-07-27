import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const onboardingCode = fs.readFileSync(path.join(__dirname, '../src/components/onboarding.js'), 'utf8');

// Mock browser DOM and LocalStorage environment for CareOnboarding test execution
function setupMockBrowser() {
  const store = {};

  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };

  const elements = {};

  function createMockElement(id, tag = 'div') {
    const el = {
      id,
      tagName: tag.toUpperCase(),
      className: '',
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
          else {
            if (el.classList.contains(c)) el.classList.remove(c);
            else el.classList.add(c);
          }
        },
      },
      attributes: {},
      setAttribute: (k, v) => { el.attributes[k] = v; },
      getAttribute: (k) => el.attributes[k] || null,
      style: {},
      children: [],
      appendChild: (c) => { el.children.push(c); return c; },
      querySelectorAll: () => [],
      addEventListener: () => {},
      focus: () => {},
      textContent: '',
      _innerHTML: '',
      get innerHTML() { return this._innerHTML; },
      set innerHTML(html) {
        this._innerHTML = html;
        const matches = html.matchAll(/id=["']([^"']+)["']/g);
        for (const match of matches) {
          const childId = match[1];
          if (!elements[childId]) {
            createMockElement(childId);
          }
        }
      },
    };
    elements[id] = el;
    return el;
  }

  global.document = {
    body: createMockElement('body', 'body'),
    createElement: (tag) => createMockElement(`element_${Math.random()}`, tag),
    getElementById: (id) => elements[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    activeElement: null,
  };

  global.window = global;
  global.CareAnalytics = {
    trackedEvents: [],
    trackOnboardingStart: function (w) { this.trackedEvents.push({ type: 'onboarding_started', wallet: w }); },
    trackOnboardingStep: function (s, w) { this.trackedEvents.push({ type: `step_${s}_completed`, wallet: w }); },
    trackOnboardingWalletConnect: function (w) { this.trackedEvents.push({ type: 'wallet_connected_during_onboarding', wallet: w }); },
    trackOnboardingSkip: function (w) { this.trackedEvents.push({ type: 'onboarding_skipped', wallet: w }); },
    trackOnboardingComplete: function (w) { this.trackedEvents.push({ type: 'onboarding_completed', wallet: w }); },
  };

  // Evaluate onboarding.js code in mock window context
  const fn = new Function('window', 'document', 'localStorage', 'CareAnalytics', onboardingCode);
  fn(global.window, global.document, global.localStorage, global.CareAnalytics);
}

describe('Milestone 3 CareOnboarding FSM & State Management', () => {
  beforeEach(() => {
    setupMockBrowser();
  });

  it('Initializes in IDLE or STEP_1 state for first-time visitors', () => {
    assert.equal(global.localStorage.getItem('carecredits_onboarded'), null);
    global.CareOnboarding.open(true);
    assert.equal(global.CareOnboarding.getState(), 'STEP_1');
  });

  it('Navigates sequentially through Step 1 -> Step 2 -> Step 3 -> Completed', () => {
    global.CareOnboarding.open(true);
    assert.equal(global.CareOnboarding.getState(), 'STEP_1');

    global.CareOnboarding.nextStep();
    assert.equal(global.CareOnboarding.getState(), 'STEP_2');

    global.CareOnboarding.nextStep();
    assert.equal(global.CareOnboarding.getState(), 'STEP_3');

    global.CareOnboarding.nextStep();
    assert.equal(global.CareOnboarding.getState(), 'COMPLETED');
    assert.equal(global.localStorage.getItem('carecredits_onboarded'), 'true');
  });

  it('Supports backward step navigation (Step 3 -> Step 2 -> Step 1)', () => {
    global.CareOnboarding.open(true);
    global.CareOnboarding.nextStep(); // Step 2
    global.CareOnboarding.nextStep(); // Step 3
    assert.equal(global.CareOnboarding.getState(), 'STEP_3');

    global.CareOnboarding.prevStep(); // Step 2
    assert.equal(global.CareOnboarding.getState(), 'STEP_2');

    global.CareOnboarding.prevStep(); // Step 1
    assert.equal(global.CareOnboarding.getState(), 'STEP_1');
  });

  it('Skipping onboarding marks user as onboarded in localStorage and sets state to SKIPPED', () => {
    global.CareOnboarding.open(true);
    assert.equal(global.CareOnboarding.getState(), 'STEP_1');

    global.CareOnboarding.close(); // Triggers skip
    assert.equal(global.CareOnboarding.getState(), 'SKIPPED');
    assert.equal(global.localStorage.getItem('carecredits_onboarded'), 'true');
  });

  it('CareOnboarding.reset() clears localStorage and resets state machine to IDLE', () => {
    global.localStorage.setItem('carecredits_onboarded', 'true');
    assert.equal(global.localStorage.getItem('carecredits_onboarded'), 'true');

    global.CareOnboarding.reset();
    assert.equal(global.localStorage.getItem('carecredits_onboarded'), null);
    assert.equal(global.CareOnboarding.getState(), 'IDLE');
  });

  it('Tracks analytics events during onboarding progression', () => {
    global.CareAnalytics.trackedEvents = [];
    global.CareOnboarding.open(true);
    global.CareOnboarding.nextStep(); // Step 1 completed
    global.CareOnboarding.nextStep(); // Step 2 completed
    global.CareOnboarding.nextStep(); // Step 3 completed

    const eventTypes = global.CareAnalytics.trackedEvents.map(e => e.type);
    assert.ok(eventTypes.includes('onboarding_started'));
    assert.ok(eventTypes.includes('step_1_completed'));
    assert.ok(eventTypes.includes('step_2_completed'));
    assert.ok(eventTypes.includes('step_3_completed'));
    assert.ok(eventTypes.includes('onboarding_completed'));
  });
});
