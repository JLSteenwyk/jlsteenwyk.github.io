const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('assets/js/publication-badges.js', 'utf8');

function setup(observers = true) {
  const scripts = [], observed = [], classes = [], timers = [];
  let intersect;
  const badges = ['dimensions', 'dimensions', 'dimensions', 'altmetric'].map((provider) => ({
    provider,
    parentNode: {},
    classList: { add: (name) => classes.push(name) },
    getAttribute() { return this.provider; },
    removeAttribute() { this.provider = null; }
  }));
  const window = { setTimeout: callback => timers.push(callback) };
  let dimensions = 0, altmetric = 0;
  window.__dimensions_embed = { addBadges() { dimensions++; } };
  window._altmetric_embed_init = () => { altmetric++; };
  if (observers) window.IntersectionObserver = function(callback) {
    intersect = callback;
    this.observe = (badge) => observed.push(badge);
    this.unobserve = () => {};
  };
  const document = {
    querySelectorAll: () => badges,
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) }
  };
  vm.runInNewContext(source, { window, document, IntersectionObserver: window.IntersectionObserver });
  return { scripts, observed, classes, badges, flush: () => timers.splice(0).forEach(callback => callback()), show: (...items) => intersect(items.map(target => ({ target, isIntersecting: true }))), counts: () => [dimensions, altmetric] };
}

test('offscreen badges do not load vendors; later badges reuse one script and batch discovery', () => {
  const app = setup();
  assert.equal(app.observed.length, 4);
  assert.equal(app.scripts.length, 0);
  app.show(app.badges[0]);
  assert.equal(app.scripts.length, 1);
  app.scripts[0].onload();
  // Vendor startup handles the initial markers without redundant refresh calls.
  assert.equal(app.counts()[0], 0);
  app.show(app.badges[1], app.badges[2]);
  assert.equal(app.scripts.length, 1);
  app.flush();
  assert.equal(app.counts()[0], 1);
  app.show(app.badges[3]);
  assert.equal(app.scripts.length, 2);
  app.scripts[1].onload();
  assert.equal(app.counts()[1], 0);
});

test('badges entering during the script download are discovered at vendor startup', () => {
  const app = setup();
  app.show(app.badges[0]);
  app.show(app.badges[1]);
  assert.equal(app.scripts.length, 1);
  app.scripts[0].onload();
  app.flush();
  assert.equal(app.classes.length, 2);
  assert.deepEqual(app.counts(), [0, 0]);
});

test('browsers without IntersectionObserver activate all badges', () => {
  const app = setup(false);
  assert.equal(app.scripts.length, 2);
  assert.equal(app.classes.length, 4);
});

test('blocked vendors leave reading unaffected', () => {
  const app = setup();
  app.show(app.badges[0]);
  app.scripts[0].onerror();
  app.show(app.badges[1]);
  app.flush();
  assert.equal(app.scripts.length, 1);
  assert.deepEqual(app.counts(), [0, 0]);
});
