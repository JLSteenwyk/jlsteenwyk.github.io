// Keep readable source and ship a minified stylesheet. Preserve license comments.
const fs = require('node:fs/promises');
const postcss = require('postcss');
const cssnano = require('cssnano');
(async () => {
  const source = await fs.readFile('assets/css/main.css', 'utf8');
  const result = await postcss([cssnano({ preset: ['default', { discardComments: { removeAll: false } }] })])
    .process(source, { from: 'assets/css/main.css', to: 'assets/css/main.min.css', map: false });
  await fs.writeFile('assets/css/main.min.css', result.css + '\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
