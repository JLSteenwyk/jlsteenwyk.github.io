const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const original = require('./fixtures/content-before-aesthetics.json');
const norm = s => s.replace(/\s+/g, ' ').trim();

test('software retains every project link, badge, and original description', () => {
  const dom = new JSDOM(fs.readFileSync('software.html', 'utf8'));
  try {
    const cards = [...dom.window.document.querySelectorAll('.software-card')];
    assert.equal(cards.length, original.software.length);
    cards.forEach((card, i) => {
      const old = original.software[i];
      assert.equal(card.id, old.id);
      assert.equal(norm(card.querySelector('.software-card-context').textContent), old.description);
      assert.deepEqual([...card.querySelectorAll('a')].map(a => a.getAttribute('href')).sort(), old.links);
      assert.deepEqual([...card.querySelectorAll('.software-card-badges img')].map(img => img.getAttribute('src')), old.badges);
      const words = norm(card.querySelector('.software-card-desc').textContent).split(' ').length;
      assert.ok(words >= 30 && words <= 45, card.id);
      const details = card.querySelector('details.software-project-details');
      assert.equal(details.open, false);
      assert.equal(details.firstElementChild.tagName, 'SUMMARY');
      assert.ok(details.querySelector('.software-card-badges'));
      const doc = [...card.querySelectorAll('.software-card-buttons a')].find(a => a.textContent === 'Documentation');
      if (doc) {
        assert.equal(card.querySelector('.software-card-buttons').firstElementChild, doc);
        assert.ok(doc.classList.contains('primary'));
      }
    });
  } finally { dom.window.close(); }
});

test('news retains all year groups, headlines, destinations, dates, and sources in order', () => {
  const dom = new JSDOM(fs.readFileSync('news.html', 'utf8'));
  try {
    const d = dom.window.document;
    assert.deepEqual([...d.querySelectorAll('#content > h3')].map(x => x.textContent), original.news.years);
    assert.deepEqual([...d.querySelectorAll('.news-item')].map(x => ({ title: norm(x.querySelector('.news-link').textContent), url: x.querySelector('.news-link').getAttribute('href'), date: norm(x.querySelector('.news-date').textContent), source: norm(x.querySelector('.news-source').textContent) })), original.news.items);
  } finally { dom.window.close(); }
});

