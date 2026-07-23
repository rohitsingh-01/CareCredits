import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feedbackCode = fs.readFileSync(path.join(__dirname, '../feedback.js'), 'utf8');

// Mock browser DOM and LocalStorage environment for CareFeedback test execution
function setupMockBrowser() {
  const store = {};

  const mockLocalStorage = {
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

  const mockDocument = {
    body: createMockElement('body', 'body'),
    createElement: (tag) => createMockElement(`element_${Math.random()}`, tag),
    getElementById: (id) => elements[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    activeElement: null,
  };

  const mockNavigator = {
    userAgent: 'NodeTestAgent/1.0',
    platform: 'NodePlatform',
  };

  const mockWindow = {
    location: { pathname: '/wallet.html' },
    addEventListener: () => {},
  };
  mockWindow.window = mockWindow;

  const mockCareAnalytics = {
    trackedEvents: [],
    postEvent: function (endpoint, payload) {
      this.trackedEvents.push(payload);
    },
  };

  mockWindow.CareAnalytics = mockCareAnalytics;
  mockWindow.fetch = async () => ({ status: 201, json: async () => ({ success: true }) });

  global.CareAnalytics = mockCareAnalytics;
  global.CareFeedback = undefined;

  const fn = new Function('window', 'document', 'localStorage', 'navigator', 'CareAnalytics', 'fetch', feedbackCode);
  fn(mockWindow, mockDocument, mockLocalStorage, mockNavigator, mockCareAnalytics, mockWindow.fetch);

  global.CareFeedback = mockWindow.CareFeedback;
}

describe('Milestone 4 CareFeedback Experience Center & FSM', () => {
  beforeEach(() => {
    setupMockBrowser();
  });

  it('Initializes in IDLE state and transitions to STEP_RATING on open()', () => {
    assert.equal(global.CareFeedback.getState(), 'IDLE');
    global.CareFeedback.open('manual');
    assert.equal(global.CareFeedback.getState(), 'STEP_RATING');
  });

  it('Captures rating selection and tracks state', () => {
    global.CareFeedback.open('manual');
    assert.equal(global.CareFeedback.getState(), 'STEP_RATING');
    assert.equal(global.CareFeedback.getRating(), 0);
  });

  it('Tracks feedback_opened and feedback_skipped analytics events', () => {
    global.CareAnalytics.trackedEvents = [];
    global.CareFeedback.open('manual');
    global.CareFeedback.close();

    const eventTypes = global.CareAnalytics.trackedEvents.map(e => e.event_type);
    assert.ok(eventTypes.includes('feedback_opened'));
  });

  it('CareFeedback.reset() clears state back to IDLE', () => {
    global.CareFeedback.open('manual');
    assert.equal(global.CareFeedback.getState(), 'STEP_RATING');

    global.CareFeedback.reset();
    assert.equal(global.CareFeedback.getState(), 'IDLE');
  });
});
