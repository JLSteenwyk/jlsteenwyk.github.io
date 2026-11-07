const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('assets/js/publication-authors.js', 'utf8');

test('without JavaScript every lengthy author list is open and complete', () => {
  const dom = new JSDOM(fs.readFileSync('publications.html', 'utf8'));
  try {
    const lists = [...dom.window.document.querySelectorAll('.pub-author-details')];
    assert.equal(lists.length, 24);
    assert.ok(lists.every(details => details.open && details.querySelector('.pub-author-list').textContent.length > 0));
  } finally { dom.window.close(); }
});

test('enhanced summaries expand and collapse without changing the author list', { timeout: 2000 }, async () => {
  const dom = new JSDOM(fs.readFileSync('publications.html', 'utf8'), { runScripts: 'outside-only' });
  try {
    const { window } = dom;
    const lists = [...window.document.querySelectorAll('.pub-author-details')];
    const originals = lists.map(details => details.querySelector('.pub-author-list').innerHTML);
    window.eval(source);
    assert.ok(lists.every(details => !details.open));
    const details = lists[0], summary = details.querySelector('summary');
    assert.match(summary.textContent, /Show all authors/);
    const opened = new Promise(resolve => details.addEventListener('toggle', resolve, { once: true }));
    summary.click();
    await opened;
    assert.equal(details.open, true);
    assert.equal(details.querySelector('.pub-author-toggle').textContent, 'Hide author list');
    const closed = new Promise(resolve => details.addEventListener('toggle', resolve, { once: true }));
    summary.click();
    await closed;
    assert.equal(details.open, false);
    assert.equal(details.querySelector('.pub-author-toggle').textContent, 'Show all authors');
    assert.deepEqual(lists.map(item => item.querySelector('.pub-author-list').innerHTML), originals);
  } finally { dom.window.close(); }
});

const original = require('./fixtures/content-before-aesthetics.json');
const norm = s => s.replace(/\s+/g, ' ').trim();

test('publications preserve numbering, full author order, titles, status, bold names, links, and badges', () => {
  const dom = new JSDOM(fs.readFileSync('publications.html', 'utf8'));
  try {
    const d = dom.window.document;
    const text = html => { const node = d.createElement('div'); node.innerHTML = html; return norm(node.textContent); };
    const cards = [...d.querySelectorAll('.pub-card')];
    assert.equal(cards.length, original.publications.length);
    cards.forEach((card, i) => {
      const old = original.publications[i];
      assert.equal(norm(card.querySelector('.pub-number').textContent + ' ' + card.querySelector('.pub-author-list').textContent), text(old.authors));
      assert.equal(norm(card.querySelector('.pub-title').textContent), text(old.title));
      assert.equal(norm(card.querySelector('.pub-status').textContent), text(old.status));
      assert.deepEqual([...card.querySelectorAll('a')].map(a => a.getAttribute('href')), old.links);
      assert.deepEqual([...card.querySelectorAll('strong')].map(x => norm(x.textContent)), old.bold);
      assert.deepEqual([...card.querySelectorAll('[data-citation-provider]')].map(x => [x.getAttribute('data-citation-provider'), x.getAttribute('data-doi')]), old.badges);
      if (card.querySelector('.pub-status').textContent.includes('Submitted.')) assert.ok(card.querySelector('.pub-title > u'));
    });
  } finally { dom.window.close(); }
});

test('author enhancement handles incoming markup before DOMContentLoaded', async () => {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { runScripts: 'outside-only' });
  try {
    const { window } = dom;
    Object.defineProperty(window.document, 'readyState', { get: () => 'loading', configurable: true });
    window.eval(source);
    window.document.body.innerHTML = '<div class="pub-card"><details class="pub-author-details" open><summary>Authors</summary><span class="pub-author-list">Aime, M.C., U. Kõljalg, T.W. May, R. Lücking.</span></details><div class="pub-title">Article title</div></div>';
    await new Promise(resolve => window.setTimeout(resolve, 0));
    const details = window.document.querySelector('details');
    assert.equal(details.open, false);
    assert.match(details.querySelector('summary').textContent, /Show all authors/);
    assert.match(details.querySelector('.pub-author-list').textContent, /R\. Lücking/);
  } finally { dom.window.close(); }
});
