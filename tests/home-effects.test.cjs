const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');

function setup(reduced = false) {
  const dom = new JSDOM('<section id="banner"><div class="biophilic-orbs"><span></span></div><h2 id="typewriter-text"><span class="morph-text">Evolutionary Bioinformatics</span></h2></section>', { runScripts: 'outside-only' });
  const { window } = dom;
  const timers = new Map();
  let id = 0, observer, preferenceChanged, hidden = false;
  const preference = { matches: reduced, addEventListener: (_, callback) => { preferenceChanged = callback; } };
  window.matchMedia = () => preference;
  window.setTimeout = (callback) => { timers.set(++id, callback); return id; };
  window.clearTimeout = handle => timers.delete(handle);
  window.requestAnimationFrame = window.setTimeout;
  window.cancelAnimationFrame = window.clearTimeout;
  window.IntersectionObserver = function (callback) { observer = callback; this.observe = () => {}; };
  Object.defineProperty(window.document, 'hidden', { get: () => hidden });
  window.eval(fs.readFileSync('assets/js/home-effects.js', 'utf8'));
  return { dom, window, timers,
    visible(value) { observer([{ isIntersecting: value }]); },
    hidden(value) { hidden = value; window.document.dispatchEvent(new window.Event('visibilitychange')); },
    reduced(value) { preference.matches = value; preferenceChanged(); }
  };
}

test('hero timers pause offscreen, in hidden tabs, and when reduced motion changes', () => {
  const app = setup();
  try {
    assert.equal(app.timers.size, 1);
    app.visible(false);
    assert.equal(app.timers.size, 0);
    app.visible(true);
    assert.equal(app.timers.size, 1);
    app.hidden(true);
    assert.equal(app.timers.size, 0);
    app.hidden(false);
    assert.equal(app.timers.size, 1);
    app.reduced(true);
    assert.equal(app.timers.size, 0);
    assert.equal(app.window.document.querySelector('.morph-text').textContent, 'Evolutionary Bioinformatics');
    app.reduced(false);
    assert.equal(app.timers.size, 1);
  } finally { app.window.close(); }
});

test('reduced motion starts with readable text and no animation timer', () => {
  const app = setup(true);
  try { assert.equal(app.timers.size, 0); }
  finally { app.window.close(); }
});
