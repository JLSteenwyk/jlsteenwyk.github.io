const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

function page(file, width, reduced = false) {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url: 'https://jlsteenwyk.com/' + file, runScripts: 'outside-only', pretendToBeVisual: true
  });
  const { window } = dom;
  window.matchMedia = query => ({
    matches: query.includes('reduced-motion') ? reduced :
      (!/max-width:\s*(\d+)px/.test(query) || width <= +query.match(/max-width:\s*(\d+)px/)[1]) &&
      (!/min-width:\s*(\d+)px/.test(query) || width >= +query.match(/min-width:\s*(\d+)px/)[1]),
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}
  });
  for (const script of window.document.querySelectorAll('script[src]')) {
    const src = script.getAttribute('src');
    if (/firebase|portal-/.test(src) || !src.includes('assets/js/') || src.startsWith('http') || !fs.existsSync(path.resolve(path.dirname(file), src))) continue;
    window.eval(fs.readFileSync(path.resolve(path.dirname(file), src), 'utf8'));
  }
  return dom;
}

for (const file of ['index.html', 'publications.html', 'software.html', 'news.html', 'contact.html', 'resources.html', 'arts_visual.html', 'tutorials/seqs_to_tree.html', 'portal/login.html']) {
  test(file + ': mobile navigation opens, retains links, and closes', () => {
    const dom = page(file, 390), { window } = dom, doc = window.document;
    try {
      const original = [...doc.querySelectorAll('#nav li > a')].map(a => a.getAttribute('href'));
      const panel = [...doc.querySelectorAll('#navPanel a')].map(a => a.getAttribute('href'));
      assert.deepEqual(panel, original);
      doc.querySelector('#titleBar .toggle').click();
      assert.equal(doc.body.classList.contains('navPanel-visible'), true);
      assert.equal(doc.querySelector('#titleBar .toggle').getAttribute('aria-expanded'), 'true');
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      assert.equal(doc.body.classList.contains('navPanel-visible'), false);
      assert.equal(doc.querySelector('#titleBar .toggle').getAttribute('aria-expanded'), 'false');
      doc.querySelector('#titleBar .toggle').click();
      doc.body.click();
      assert.equal(doc.body.classList.contains('navPanel-visible'), false);
      if ([...doc.querySelectorAll('#nav .nav-link')].some(a => a.getAttribute('href') === file.split('/').pop())) assert.ok(doc.querySelector('#nav .nav-active'));
    } finally { window.close(); }
  });
}

test('desktop dropdown menus retain submenu contents', () => {
  const dom = page('tutorials/seqs_to_tree.html', 1365), { window } = dom;
  try {
    assert.ok(window.document.querySelector('ul.dropotron'));
    const items = [...window.document.querySelectorAll('ul.dropotron a')];
    assert.ok(items.length > 0);
    assert.ok(items.every(a => a.getAttribute('href')));
  } finally { window.close(); }
});

test('anchor scrolling remains bound on the homepage', () => {
  const dom = page('index.html', 1365), { window } = dom;
  try {
    const link = window.document.querySelector('a.scrolly[href="#content"]');
    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  } finally { window.close(); }
});


test('reduced motion makes anchor scrolling immediate', () => {
  const dom = page('index.html', 1365, true), { window } = dom;
  try {
    const durations = [];
    const animate = window.jQuery.fn.animate;
    window.jQuery.fn.animate = function (properties, speed) {
      durations.push(speed);
      return animate.apply(this, arguments);
    };
    window.document.querySelector('a.scrolly[href="#content"]').click();
    assert.ok(durations.length > 0);
    assert.ok(durations.every(duration => duration === 0));
  } finally { window.close(); }
});
