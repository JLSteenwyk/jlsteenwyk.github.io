const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

test('visual arts keeps the gallery outside navigation and the footer after content', () => {
  const dom = new JSDOM(fs.readFileSync('arts_visual.html', 'utf8'));
  try {
    const d = dom.window.document;
    assert.equal(d.querySelector('#nav #content'), null);
    assert.ok(d.querySelector('#page-wrapper > article#Top #main #content'));
    assert.ok(d.querySelector('#page-wrapper > article + footer#footer'));
    assert.equal(d.querySelectorAll('#content img').length, 23);
    assert.equal(d.querySelectorAll('#nav a').length, 7);
    for (const link of d.querySelectorAll('a[href^="#"]')) {
      assert.ok(d.getElementById(link.getAttribute('href').slice(1)), link.outerHTML);
    }
    for (const image of d.querySelectorAll('#content img')) {
      assert.ok(image.getAttribute('srcset'));
      assert.ok(fs.existsSync(image.closest('a').getAttribute('href')));
    }
  } finally { dom.window.close(); }
});

test('primary pages expose footer labels, document language, zoom, and a main landmark', () => {
  for (const file of ['index.html', 'publications.html', 'software.html', 'news.html', 'arts_visual.html']) {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    try {
      const d = dom.window.document;
      assert.equal(d.documentElement.lang, 'en');
      assert.ok(d.querySelector('[role="main"], main'));
      assert.doesNotMatch(d.querySelector('meta[name="viewport"]').content, /user-scalable=no|maximum-scale=1/);
      for (const link of d.querySelectorAll('#footer .icons a')) {
        assert.equal(link.getAttribute('aria-label'), link.querySelector('.label').textContent);
      }
    } finally { dom.window.close(); }
  }
});
