const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('assets/js/publication-badges.js', 'utf8');

function setup(observers = true) {
  const scripts = [], observed = [], classes = [];
  let intersect;
  const badges = ['dimensions', 'dimensions', 'altmetric'].map((provider) => ({
    provider,
    parentNode: {},
    classList: { add: (name) => classes.push(name) },
    getAttribute() { return this.provider; },
    removeAttribute() { this.provider = null; }
  }));
  const window = {};
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
  vm.runInNewContext(source, { window, document, Promise, IntersectionObserver: window.IntersectionObserver });
  return { scripts, observed, classes, badges, show: (...items) => intersect(items.map(target => ({ target, isIntersecting: true }))), counts: () => [dimensions, altmetric] };
}

test('offscreen badges do not load vendors; entering badges share one script per vendor', async () => {
  const app = setup();
  assert.equal(app.observed.length, 3);
  assert.equal(app.scripts.length, 0);
  app.show(app.badges[0], app.badges[1]);
  assert.equal(app.scripts.length, 1);
  app.scripts[0].onload();
  await Promise.resolve();
  assert.equal(app.counts()[0], 2);
  app.show(app.badges[2]);
  assert.equal(app.scripts.length, 2);
  app.scripts[1].onload();
  await Promise.resolve();
  assert.equal(app.counts()[1], 1);
});

test('browsers without IntersectionObserver activate all badges', async () => {
  const app = setup(false);
  assert.equal(app.scripts.length, 2);
  app.scripts.forEach(script => script.onload());
  await Promise.resolve();
  assert.deepEqual(app.counts(), [2, 1]);
});

test('blocked vendors do not cause unhandled rejections', async () => {
  const app = setup();
  app.show(app.badges[0]);
  app.scripts[0].onerror(new Error('blocked'));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(app.counts(), [0, 0]);
});
