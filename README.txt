Landed by HTML5 UP
html5up.net | @ajlkn
Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)


A dark, slick, modern, responsive, adjective-drenched design built around an extremely
dynamic landing page (scroll that mofo!). Inspired by Big Picture, another design
of mine with a similarish feel/flow, only this time I took it waaaaaay further and
actually made it multipurpose (versus copping out and making it a one pager like I
did last time ;) Includes multiple pages, a bunch of pre-styled elements, and all
its Sass sources.

Demo images* courtesy of Unsplash, a radtastic collection of CC0 (public domain) images
you can use for pretty much whatever.

(* = Not included)

Feedback, bug reports, and comments are not only welcome, but strongly encouraged :)

AJ
aj@lkn.io | @ajlkn


Credits:

	Demo Images:
		Unsplash (unsplash.com)

	Icons:
		Font Awesome (fontawesome.io)

	Other:
		jQuery (jquery.com)
		Scrollex (github.com/ajlkn/jquery.scrollex)
		Responsive Tools (github.com/ajlkn/responsive-tools)
Website asset maintenance
-------------------------
Install development tools with `npm ci`. After editing assets/css/main.css,
run `npm run build:css` and commit both the readable source and main.min.css.
HTML pages load main.min.css; the HTML5 UP license notice is preserved.
Run `npm test` for citation widgets, mobile navigation, dropdowns, anchor
scrolling, and reduced-motion/offscreen animation checks. Use Node.js 24 LTS (24.15 or newer).

Responsive image previews live in assets/images/optimized. Full-resolution
originals are retained. Run `python scripts/optimize-images.py` with Pillow
installed to generate previews for new image references on the audited pages.
Delete affected preview files before regenerating a changed source image.
The script leaves existing responsive markup intact; update its srcset if the
original image dimensions or selected preview sizes change.

Performance audit
-----------------
The measurements, methodology, commit list, and known limitations from the
November 2026 audit are in performance/audit-2026-11-07.json. Before/after
screenshots are in performance/screenshots. These files are not loaded by the
website itself.

For a comparable local audit, serve a checkout with `python -m http.server`
and run the following for index.html, publications.html, software.html,
news.html, and arts_visual.html, changing the output filename for each:

npx lighthouse@13.6.0 http://127.0.0.1:8000/index.html --only-categories=performance --chrome-flags="--headless=new" --output=json --output-path=/tmp/index-mobile.json

Add `--preset=desktop` for the desktop run. Compare several runs when making
small timing claims; simulated local measurements are not field Core Web Vitals.
