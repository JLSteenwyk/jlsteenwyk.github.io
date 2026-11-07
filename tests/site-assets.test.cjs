const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

for (const file of ['index.html', 'publications.html', 'software.html', 'news.html', 'arts_visual.html', 'resources.html', 'contact.html', 'tutorials/seqs_to_tree.html', 'portal/login.html']) {
  test(file + ': local scripts, stylesheets, and responsive images resolve', () => {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    try {
      const doc = dom.window.document;
      for (const node of doc.querySelectorAll('script[src], link[rel="stylesheet"][href], img[src]')) {
        const reference = node.getAttribute('src') || node.getAttribute('href');
        if (/^(https?:|data:|\/\/)/.test(reference)) continue;
        assert.ok(fs.existsSync(path.resolve(path.dirname(file), reference)), reference);
      }
      for (const image of doc.querySelectorAll('img[srcset]')) {
        assert.ok(+image.getAttribute('width') > 0);
        assert.ok(+image.getAttribute('height') > 0);
        for (const variant of image.getAttribute('srcset').split(',')) {
          const [reference, width] = variant.trim().split(/\s+/);
          assert.match(width, /^\d+w$/);
          assert.ok(fs.existsSync(path.resolve(path.dirname(file), reference)), reference);
        }
      }
      if (file === 'arts_visual.html') {
        for (const image of doc.querySelectorAll('img[srcset]')) {
          assert.equal(image.parentElement.tagName, 'A');
          assert.ok(fs.existsSync(image.parentElement.getAttribute('href')));
        }
      }
    } finally { dom.window.close(); }
  });
}
