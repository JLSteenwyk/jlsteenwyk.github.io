#!/usr/bin/env python3
"""Build responsive WebP previews without modifying full-resolution originals.

Run from the repository root with Python and Pillow installed. Existing previews
are reused; delete an individual preview to regenerate it after changing a source.
"""
from pathlib import Path
from html.parser import HTMLParser
from PIL import Image, ImageOps
import hashlib
import re

PAGES = ['index.html', 'publications.html', 'software.html', 'arts_visual.html']
OUTPUT = Path('assets/images/optimized')
OUTPUT.mkdir(parents=True, exist_ok=True)

class Attributes(HTMLParser):
    def handle_starttag(self, tag, attributes):
        self.attributes = dict(attributes)

def optimize_page(name):
    page = Path(name)
    original = page.read_bytes()
    text = original.decode()
    image_index = 0

    def image(match):
        nonlocal image_index
        tag = match.group()
        parser = Attributes()
        parser.feed(tag)
        attrs = parser.attributes
        src = attrs.get('src', '')
        if src.startswith(('http:', 'https:', 'data:')):
            # Badge dimensions are vendor-dependent; don't invent their ratio.
            if 'loading' not in attrs:
                tag = tag.replace('<img ', '<img loading="lazy" decoding="async" ', 1)
            return tag
        source = Path(src)
        if not source.is_file() or source.suffix.lower() not in {'.png', '.jpg', '.jpeg'}:
            return tag
        image_index += 1
        with Image.open(source) as raw:
            im = ImageOps.exif_transpose(raw)
            width, height = im.size
            if 'width' not in attrs:
                tag = tag.replace('<img ', f'<img width="{width}" height="{height}" ', 1)
            if 'loading' not in attrs:
                eager = (name == 'index.html' and image_index == 1) or (name == 'software.html' and image_index <= 3) or (name == 'arts_visual.html' and image_index == 1)
                tag = tag.replace('<img ', '<img loading="' + ('eager' if eager else 'lazy') + '" decoding="async" ', 1)
            if 'srcset' in attrs or src.startswith('assets/images/optimized/'):
                return tag
            if 'software-card-logo' in attrs.get('class', ''):
                widths, sizes = [200, 400, 600], '200px'
            elif name == 'publications.html':
                widths, sizes = [320, 640, 960], '(max-width: 980px) 90vw, 25vw'
            elif name == 'index.html':
                widths, sizes = [320, 640, 1200], '(max-width: 736px) 90vw, 40vw'
            else:
                widths, sizes = [320, 640, 1280, 1920], '(max-width: 736px) 90vw, 80vw'
            # The portrait is already only 11 KB; leave its original encoding.
            if source.stat().st_size < 20000:
                return tag
            key = hashlib.sha256(src.encode()).hexdigest()[:8]
            variants = []
            for target in sorted(set(min(w, width) for w in widths)):
                output = OUTPUT / f'{source.stem}-{key}-{target}.webp'
                if not output.exists():
                    preview = im.copy()
                    preview.thumbnail((target, round(height * target / width)), Image.Resampling.LANCZOS)
                    preview.save(output, 'WEBP', quality=85, method=6)
                variants.append((output.as_posix(), target))
            fallback = next((p for p, w in variants if w >= min(640, width)), variants[-1][0])
            tag = re.sub(r'\bsrc="[^"]+"', f'src="{fallback}"', tag, count=1)
            srcset = ', '.join(f'{p} {w}w' for p, w in variants)
            tag = tag.replace('<img ', f'<img srcset="{srcset}" sizes="{sizes}" ', 1)
            if name == 'arts_visual.html':
                tag = f'<a href="{src}" aria-label="Open full-resolution artwork">{tag}</a>'
            return tag

    # Don't rewrite examples and images inside commented-out sections.
    parts = re.split(r'(<!--.*?-->)', text, flags=re.S)
    for i in range(0, len(parts), 2):
        parts[i] = re.sub(r'<img\b[^>]*>', image, parts[i])
    page.write_bytes(''.join(parts).encode())

for name in PAGES:
    optimize_page(name)
