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
