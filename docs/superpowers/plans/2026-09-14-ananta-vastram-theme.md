# Ananta Vastram Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Ananta Vastram Shopify Online Store 2.0 theme on the stripped Dawn v9.0.0 base, reproducing the design canvas page by page, verified live on `anantavastram.myshopify.com` as an unpublished theme.

**Architecture:** Every page is a JSON template composed of new `av-*` Liquid sections; repeatable units are `av-*` snippets; all styling lives in the two existing CSS files (`assets/av-base.css`, `assets/av-sections.css`), extended not restyled. Dawn's stock cart, account, search, 404 and password templates remain and pick up the palette through Dawn's colour-scheme settings. Drops, weavers and campaigns are metaobjects; product facts are `av.*` metafields; remaining stock is variant inventory.

**Tech Stack:** Shopify Liquid, Online Store 2.0 JSON templates, plain CSS custom properties, three vanilla JS files, Shopify CLI 3 (`shopify theme dev`, `shopify theme check`), GitHub Actions for Theme Check, Python + fontTools (scratch venv only) for the wordmark SVG.

**Spec:** `docs/superpowers/specs/2026-09-14-ananta-vastram-theme-design.md` — read it first. The design canvas artboards are extracted as plain HTML at `/private/tmp/claude-501/-Users-tharunpalla-Documents-GitHub-anantavastram-shopify/3bf8de45-1515-4548-a354-68b246b452f3/scratchpad/canvas/*.dc.html` (Main = homepage, Collections, Exclusive, About, Gallery, Stories, Opening). If that directory is gone, re-extract with the Artifact tool (`action: read`, URL in `CLAUDE.md`) — the artboards live in the `appifact-doc` script block, key `content.files`.

**Conventions for every task:**
- Work on branch `develop`. One commit per task (or per numbered sub-step where marked).
- Before every commit: `shopify theme check` must report `0 errors` (warnings are acceptable only if listed as pre-existing in Task 0's baseline).
- Visual verification = `shopify theme dev --store anantavastram.myshopify.com` (started once in the background; it hot-reloads) and open the printed `127.0.0.1:9292` URL in the Browser pane; compare against the matching artboard at 1440px and at the mobile preset (375px). Never `shopify theme push --live` or `shopify theme publish`.
- Liquid rules: `{%- liquid -%}` blocks for logic; no inline `<style>` in sections (CSS goes in `av-sections.css`); every image via the `av-media` snippet; every label/statement/body uses the type-role classes from `av-base.css` (`.av-label`, `.av-statement--*`, `.av-sub--*`, `.av-body`, `.av-link`, `.av-chip`, `.av-numeral`).
- Section schemas: settings are content only. No `color_scheme`, no padding sliders, no layout toggles.
- Copy: no lorem ipsum. Unknown facts are `[bracketed placeholders]` in default settings.

---

## File structure

**Layout / config**
- `layout/theme.liquid` — modify: fonts, av CSS, opening, scripts.
- `config/settings_schema.json` — modify: add "Ananta Vastram" group.
- `config/settings_data.json` — un-ignore, add, set defaults.
- `.gitignore`, `.github/workflows/theme-check.yml`, `docs/setup.md`, `README.md`.

**Scripts (build-time only)**
- `scripts/build-wordmark.py` — generates `snippets/av-wordmark.liquid` from the OTF.

**Assets**
- `assets/av-base.css`, `assets/av-sections.css` — extend.
- `assets/av-opening.js`, `assets/av-reveal.js`, `assets/av-video.js` — new.

**Snippets** (each one repeatable unit)
- `av-wordmark.liquid`, `av-opening.liquid`, `av-icon.liquid`, `av-cart-bubble.liquid`, `av-media.liquid`, `av-video.liquid`, `av-edition-line.liquid`, `av-whatsapp-link.liquid`, `av-product-row.liquid`, `av-product-list-item.liquid`, `av-drop-tile.liquid`, `av-drop-banner.liquid`, `av-newsletter-form.liquid`. (The ordered-drop-iteration rule is a comment atop `sections/av-drop-index.liquid`, not a snippet.)

**Sections**
- Chrome: `av-header.liquid`, `av-footer.liquid`; `cart-icon-bubble.liquid` (rewrite).
- Home: `av-hero`, `av-credo`, `av-showcase-three`, `av-story`, `av-film-banner`, `av-drop-rows`, `av-exclusive-row`.
- Collections: `av-page-intro`, `av-drop-index`, `av-drop-header`, `av-product-rows`.
- Product: `av-product`. Products: `av-product-list`.
- Exclusive: `av-full-bleed`, `av-steps`, `av-cards`, `av-band`, `av-enquiry`.
- About: `av-video-block`, `av-chapter`, `av-video-pair`, `av-chapter-split`, `av-people-grid`, `av-routes`.
- Gallery: `av-campaign`. Stories: `av-featured-article`, `av-tabs`, `av-posts`, `av-earlier`, `av-newsletter-line`, `av-article`.

**Templates** — `index.json`, `list-collections.json`, `collection.json`, `collection.products-all.json`, `product.json`, `page.exclusive.json`, `page.about.json`, `page.gallery.json`, `blog.json`, `article.json`; `cart.json` (remove grid); `sections/header-group.json`, `sections/footer-group.json`.

---

### Task 0: Tooling, branch, baseline

**Files:**
- Modify: `.gitignore`
- Add: `config/settings_data.json` (already on disk, currently ignored)

- [ ] **Step 1: Install Shopify CLI and confirm Theme Check runs**

```bash
npm i -g @shopify/cli@latest && shopify version
```
Expected: a `3.x` version string.

- [ ] **Step 2: Run the baseline Theme Check and record it**

```bash
cd /Users/tharunpalla/Documents/GitHub/anantavastram-shopify && shopify theme check 2>&1 | tail -5
```
Expected: a summary line like `N files inspected, X offenses`. Copy the offense list into `docs/superpowers/plans/theme-check-baseline.txt` (`shopify theme check > docs/superpowers/plans/theme-check-baseline.txt 2>&1`). Stock Dawn 9.0.0 usually has 0 errors; any pre-existing warnings are the baseline and are not ours to fix.

- [ ] **Step 3: Authenticate (user action)**

Tell the user to run `shopify auth login --store anantavastram.myshopify.com` in their terminal and approve in the browser. Then verify from Bash:

```bash
shopify theme list --store anantavastram.myshopify.com 2>&1 | head
```
Expected: a table of themes including the live one. Note the live theme's name/ID; we never target it.

- [ ] **Step 4: Fix `.gitignore` and track `settings_data.json`**

Replace `.gitignore` contents with:

```
.DS_Store
node_modules/
.shopify/
.superpowers/
*.otf
*.ttf
```

Then:
```bash
git add .gitignore config/settings_data.json docs/superpowers/plans/theme-check-baseline.txt && git status --short
```
Expected: `M .gitignore`, `A config/settings_data.json`, `A docs/superpowers/plans/theme-check-baseline.txt`.

- [ ] **Step 5: Create the develop branch and commit**

```bash
git checkout -b develop && git commit -m "chore: track settings_data.json, ignore font files, theme-check baseline

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 6: Start the dev server (background, keep for all tasks)**

```bash
shopify theme dev --store anantavastram.myshopify.com --theme-editor-sync
```
Run with `run_in_background: true`. It prints a `http://127.0.0.1:9292` URL — open it in the Browser pane; it should show the stock Dawn store. If the CLI asks to create a development theme, accept (that is an unpublished theme on the store). Do not pass `--live`.

---

### Task 1: Wordmark SVG from the Montage OTF; self-hosted display font

**Why the display font is self-hosted:** Shopify's font library (shopify.dev → Fonts) has `rubik_*` and `cormorant_*` but **no Rubik Mono One and no Cormorant Garamond**. Rubik Mono One is the design's display face (product names, prices, sub-headings), so it ships as a woff2 in `assets/` under its SIL Open Font License. The wordmark text fallback uses Shopify's `cormorant_n7` (Cormorant 700, visually the same family) since the Montage SVG makes it a rarely-seen fallback. This overrides the "fonts via font picker" line in `CLAUDE.md` for one font; Step 9 records that.

**Files:**
- Create: `scripts/build-wordmark.py`
- Create: `snippets/av-wordmark.liquid` (generated)
- Create: `assets/rubik-mono-one-400.woff2`
- Modify: `CLAUDE.md` (one line)

- [ ] **Step 1: Write the generator**

`scripts/build-wordmark.py`:

```python
"""Generate snippets/av-wordmark.liquid: inline SVG outlines of the wordmark.

Usage: <venv>/bin/python scripts/build-wordmark.py path/to/montage.otf
Requires fontTools. The OTF is never committed; only the SVG paths are.
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

TEXT = "ANANTA VASTRAM"
TRACKING = 0.18  # em, matches letter-spacing: 0.18em in the design
OUT = Path(__file__).resolve().parent.parent / "snippets" / "av-wordmark.liquid"


def main(otf: str) -> None:
    font = TTFont(otf)
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()
    upem = font["head"].unitsPerEm
    ascent = font["OS/2"].sTypoAscender or font["hhea"].ascent
    descent = abs(font["OS/2"].sTypoDescender or font["hhea"].descent)
    track = TRACKING * upem
    space = font["hmtx"][cmap[ord(" ")]][0] if ord(" ") in cmap else upem * 0.3

    x = 0.0
    paths = []
    for ch in TEXT:
        if ch == " ":
            x += space + track
            continue
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        # flip y (font y-up -> svg y-down), place at baseline = ascent
        tpen = TransformPen(pen, (1, 0, 0, -1, x, ascent))
        glyphs[name].draw(tpen)
        d = pen.getCommands()
        if d:
            paths.append(f'<path d="{d}"/>')
        x += font["hmtx"][name][0] + track
    width = round(x - track)
    height = ascent + descent

    svg = (
        f'<svg class="av-wordmark__svg" viewBox="0 0 {width} {height}" '
        f'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{TEXT.title()}" fill="currentColor">'
        + "".join(paths) + "</svg>"
    )

    liquid = f"""{{%- comment -%}}
  GENERATED by scripts/build-wordmark.py — do not edit by hand.
  Renders the wordmark. Chain: settings.av_logo image → inline Montage SVG → text.
  Usage: {{% render 'av-wordmark', class: 'av-header__wordmark' %}}
{{%- endcomment -%}}
{{%- if settings.av_logo != blank -%}}
  <span class="{{{{ class }}}}">{{{{ settings.av_logo | image_url: width: 600 | image_tag: alt: shop.name, loading: 'eager' }}}}</span>
{{%- else -%}}
  <span class="{{{{ class }}}} av-wordmark--svg">{svg}</span>
{{%- endif -%}}
"""
    OUT.write_text(liquid)
    print(f"wrote {OUT} ({width}x{height}, {len(paths)} glyph paths)")


if __name__ == "__main__":
    main(sys.argv[1])
```

- [ ] **Step 2: Run it**

```bash
/private/tmp/claude-501/-Users-tharunpalla-Documents-GitHub-anantavastram-shopify/3bf8de45-1515-4548-a354-68b246b452f3/scratchpad/venv/bin/python scripts/build-wordmark.py .superpowers/fonts/montage-serif.otf
```
Expected: `wrote .../snippets/av-wordmark.liquid (WxH, 13 glyph paths)`. If the venv is gone: `python3 -m venv <scratchpad>/venv && <venv>/bin/pip install fonttools`.

- [ ] **Step 3: Eyeball the SVG**

Write a scratch HTML file containing just the `<svg>` from the snippet on a `#9E1B1E` background with `color:#fff; width:600px` and open it in the Browser pane. Expected: "ANANTA VASTRAM" in Montage, upright, evenly tracked. If glyphs are upside-down the y-flip is wrong; if they overlap, `hmtx` advance wasn't added.

- [ ] **Step 4: Add wordmark CSS to `assets/av-base.css`**

Append after the `.av-header__wordmark img` rule:

```css
.av-wordmark--svg { display: inline-flex; align-items: center; }
.av-wordmark--svg svg { height: 1em; width: auto; display: block; }
.av-header__wordmark.av-wordmark--svg svg { height: 22px; }
.av-footer__wordmark.av-wordmark--svg svg { height: 18px; }
.av-opening__wordmark.av-wordmark--svg svg { height: clamp(32px, 5vw, 72px); }
@media (max-width: 900px) { .av-header__wordmark.av-wordmark--svg svg { height: 16px; } }
```

(Compound selectors, no space: the snippet puts both classes on the same `<span>`.)

```css
```

- [ ] **Step 5: Theme check and commit**

```bash
shopify theme check && git add scripts/build-wordmark.py snippets/av-wordmark.liquid assets/av-base.css && git commit -m "feat: Montage wordmark snippet generated from OTF outlines

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 6: Fetch Rubik Mono One (ask the user before downloading)**

Source: the Google Fonts repository, file `ofl/rubikmonoone/RubikMonoOne-Regular.ttf` (~50 KB, SIL OFL 1.1). Tell the user the filename, source and size and get a yes, then:

```bash
curl -fsSL -o /private/tmp/claude-501/-Users-tharunpalla-Documents-GitHub-anantavastram-shopify/3bf8de45-1515-4548-a354-68b246b452f3/scratchpad/RubikMonoOne-Regular.ttf https://github.com/google/fonts/raw/main/ofl/rubikmonoone/RubikMonoOne-Regular.ttf && ls -la /private/tmp/claude-501/-Users-tharunpalla-Documents-GitHub-anantavastram-shopify/3bf8de45-1515-4548-a354-68b246b452f3/scratchpad/RubikMonoOne-Regular.ttf
```
Expected: a file of roughly 40–60 KB. Also fetch `ofl/rubikmonoone/OFL.txt` from the same directory and save it as `assets/rubik-mono-one-OFL.txt` (the licence must travel with the font).

- [ ] **Step 7: Subset to Latin and convert to woff2**

```bash
V=/private/tmp/claude-501/-Users-tharunpalla-Documents-GitHub-anantavastram-shopify/3bf8de45-1515-4548-a354-68b246b452f3/scratchpad/venv; $V/bin/pip install -q brotli && $V/bin/pyftsubset $V/../RubikMonoOne-Regular.ttf --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20B9,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" --flavor=woff2 --output-file=/Users/tharunpalla/Documents/GitHub/anantavastram-shopify/assets/rubik-mono-one-400.woff2 && ls -la /Users/tharunpalla/Documents/GitHub/anantavastram-shopify/assets/rubik-mono-one-400.woff2
```
Expected: a woff2 of roughly 15–25 KB. `U+20B9` is ₹; Rubik Mono One most likely lacks that glyph, in which case `pyftsubset` silently skips it and ₹ renders from the fallback stack — that is expected, not a subsetting bug.

- [ ] **Step 8: Point the token at the self-hosted face**

In `assets/av-base.css` change `--av-font-display: var(--av-display-family);` to `--av-font-display: 'Rubik Mono One', 'Arial Black', Impact, sans-serif;` (the `@font-face` itself is added in `theme.liquid` in Task 2 Step 3a).

- [ ] **Step 9: Record the deviation in `CLAUDE.md`**

Change the stack line "Fonts via Shopify's font picker (Shopify CDN, no Google Fonts call): heading = Marcellus, body = Karla, display = Rubik Mono One, wordmark stand-in = Cormorant Garamond 700." to: "Fonts: heading = Marcellus and body = Karla via Shopify's font picker; display = Rubik Mono One self-hosted as `assets/rubik-mono-one-400.woff2` (OFL; not in Shopify's library); wordmark text fallback = Cormorant 700 (`cormorant_n7`, Shopify library — Cormorant Garamond is not available). No Google Fonts runtime call."

- [ ] **Step 10: Commit**

```bash
git add assets/rubik-mono-one-400.woff2 assets/rubik-mono-one-OFL.txt assets/av-base.css CLAUDE.md && git commit -m "feat: self-host Rubik Mono One display font (OFL)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: theme.liquid, theme settings, opening sequence, scripts

**Files:**
- Modify: `layout/theme.liquid`
- Modify: `config/settings_schema.json` (append a group)
- Modify: `config/settings_data.json`
- Create: `snippets/av-opening.liquid`, `assets/av-opening.js`, `assets/av-reveal.js`, `assets/av-video.js`

- [ ] **Step 1: Add the Ananta Vastram settings group**

In `config/settings_schema.json`, insert this object as the second element of the top-level array (right after `theme_info`):

```json
{
  "name": "Ananta Vastram",
  "settings": [
    { "type": "header", "content": "Type" },
    { "type": "font_picker", "id": "av_wordmark_font", "default": "cormorant_n7", "label": "Wordmark fallback font", "info": "Used only when no logo is set and the generated wordmark is missing. The display font (Rubik Mono One) is self-hosted and not a setting." },
    { "type": "header", "content": "Wordmark" },
    { "type": "image_picker", "id": "av_logo", "label": "Logo (SVG or PNG, white on transparent)", "info": "Overrides the built-in Montage wordmark in header, footer and opening." },
    { "type": "header", "content": "Contact" },
    { "type": "text", "id": "av_whatsapp_number", "label": "WhatsApp number", "info": "International format, digits only, e.g. 919876543210", "default": "" },
    { "type": "header", "content": "Commerce copy" },
    { "type": "text", "id": "av_shipping_line", "label": "Shipping line (product rows and pages)", "default": "[Shipping terms — India and worldwide, duties note]" },
    { "type": "text", "id": "av_currency_line", "label": "Footer currency line", "default": "India (INR ₹)" }
  ]
}
```

- [ ] **Step 2: Set defaults in `config/settings_data.json`**

In the `"Default"` preset object, change/add these keys (keep everything else):

```json
"type_header_font": "marcellus_n4",
"type_body_font": "karla_n3",
"av_wordmark_font": "cormorant_n7",
"colors_solid_button_labels": "#F5EFE3",
"colors_accent_1": "#9E1B1E",
"colors_accent_2": "#7A1216",
"colors_text": "#9E1B1E",
"colors_outline_button_labels": "#9E1B1E",
"colors_background_1": "#F5EFE3",
"colors_background_2": "#EDE5D6",
"cart_type": "page",
"predictive_search_enabled": false,
"av_shipping_line": "[Shipping terms — India and worldwide, duties note]",
"av_currency_line": "India (INR ₹)"
```

Also set the same keys in the `"current"` object if `current` is an object rather than the string `"Default"` (in stock Dawn it is the string — leave it).

- [ ] **Step 3: Edit `layout/theme.liquid`**

(a) After the existing `{{ settings.type_header_font | font_face: font_display: 'swap' }}` line (line 48) add:

```liquid
      {{ settings.av_wordmark_font | font_face: font_display: 'swap' }}
      @font-face { font-family: 'Rubik Mono One'; font-style: normal; font-weight: 400; font-display: swap; src: url('{{ 'rubik-mono-one-400.woff2' | asset_url }}') format('woff2'); }
```

(b) Inside the `:root {` block, after `--font-heading-weight` add:

```liquid
        --av-wordmark-family: {{ settings.av_wordmark_font.family }}, {{ settings.av_wordmark_font.fallback_families }};
```

(`--av-font-display` was hard-coded to 'Rubik Mono One' in `av-base.css` in Task 1 Step 8, so no display-family property is needed.) After the two existing `<link rel="preload" as="font" …>` lines add:

```liquid
    {{ 'rubik-mono-one-400.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}
```

(`preload_tag` rather than a raw `<link>` keeps Theme Check's `AssetPreload` rule quiet.)

(c) Replace the Dawn `body { display: grid; grid-template-rows: auto auto 1fr auto; ... }` rule's `display: grid; grid-template-rows: auto auto 1fr auto; grid-template-columns: 100%;` with `display: flex; flex-direction: column;` and add `main { flex: 1 0 auto; }` — the header group no longer has an announcement bar (grid rows would leave a gap), and the flex-grow keeps the footer at the bottom on short stock pages (404, empty search).

(d) After `{{ 'base.css' | asset_url | stylesheet_tag }}` add:

```liquid
    {{ 'av-base.css' | asset_url | stylesheet_tag }}
    {{ 'av-sections.css' | asset_url | stylesheet_tag }}
    <script src="{{ 'av-opening.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'av-reveal.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'av-video.js' | asset_url }}" defer="defer"></script>
```

(e) In the `<head>` inline `<script>` that swaps `no-js`, append the pre-paint opening guard so the overlay never flashes for returning visitors:

```javascript
    try { if (!sessionStorage.getItem('avOpened') && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('av-opening-active'); } catch (e) {}
```

(f) In `<body>`: remove the `{%- if settings.cart_type == 'drawer' -%}{%- render 'cart-drawer' -%}{%- endif -%}` block; directly after the skip link add `{% render 'av-opening' %}`. Change `<body class="gradient">` to `<body>`.

(g) Keep everything else (constants/pubsub/global scripts, `content_for_header`, routes/strings block, predictive search conditional).

- [ ] **Step 4: Opening snippet — `snippets/av-opening.liquid`**

```liquid
{%- comment -%} Once-per-session opening overlay. Shown only when <html> has .av-opening-active (set pre-paint in theme.liquid); av-opening.js runs the sequence. {%- endcomment -%}
<div class="av-opening" id="av-opening" aria-hidden="true">
  <div class="av-opening__mark">
    {% render 'av-wordmark', class: 'av-opening__wordmark' %}
    <span class="av-opening__line"></span>
  </div>
</div>
```

In `assets/av-base.css`, change the `.av-opening` rule so it is hidden unless the html class is present: add before it

```css
html:not(.av-opening-active) .av-opening { display: none; }
```

- [ ] **Step 5: `assets/av-opening.js`**

```javascript
(function () {
  var html = document.documentElement;
  var el = document.getElementById('av-opening');
  if (!el) return;
  if (!html.classList.contains('av-opening-active')) { el.remove(); return; }
  var HOLD = 1600 + 200 + 1000; // fade-in + delay + hold
  function finish() {
    el.remove();
    html.classList.remove('av-opening-active');
    try { sessionStorage.setItem('avOpened', '1'); } catch (e) {}
  }
  setTimeout(function () {
    el.classList.add('is-leaving');
    el.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 1200); // safety if transitionend never fires
  }, HOLD);
})();
```

- [ ] **Step 6: `assets/av-reveal.js`**

```javascript
(function () {
  var items = document.querySelectorAll('.av-reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(function (n) { n.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach(function (n) { io.observe(n); });
})();
```

- [ ] **Step 7: `assets/av-video.js`**

```javascript
/* .av-video: muted loop by default. Play button unmutes; if data-film is set, swaps to the full film with controls. */
(function () {
  document.querySelectorAll('.av-video').forEach(function (box) {
    var video = box.querySelector('video');
    var btn = box.querySelector('.av-video__play, .av-film__play');
    if (!video || !btn) return;
    btn.addEventListener('click', function () {
      var film = box.getAttribute('data-film');
      if (film && video.getAttribute('src') !== film) {
        video.pause();
        video.removeAttribute('loop');
        video.setAttribute('src', film);
        video.setAttribute('controls', '');
        video.load();
      }
      video.muted = false;
      video.play();
      box.classList.add('is-playing');
    });
  });
})();
```

- [ ] **Step 8: Verify**

`shopify theme check` → 0 errors. Reload the dev preview: page background should be ivory, any `.av-sub` text renders in Rubik Mono One (wide, monospaced — check the network panel loads `rubik-mono-one-400.woff2` with status 200), the red overlay should show the Montage wordmark for ~2.8 s then slide up; reload again in the same tab → no overlay (sessionStorage). Open the Browser pane's devtools-equivalent: `read_console_messages` shows no errors.

- [ ] **Step 9: Commit**

```bash
git add layout/theme.liquid config/settings_schema.json config/settings_data.json snippets/av-opening.liquid assets/av-opening.js assets/av-reveal.js assets/av-video.js assets/av-base.css
git commit -m "feat: theme layout with AV fonts, settings, opening sequence and scripts

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 3: Header, footer, cart bubble, shared icon snippet

**Files:**
- Create: `snippets/av-icon.liquid`, `snippets/av-cart-bubble.liquid`, `snippets/av-newsletter-form.liquid`
- Create: `sections/av-header.liquid`, `sections/av-footer.liquid`
- Rewrite: `sections/cart-icon-bubble.liquid`
- Rewrite: `sections/header-group.json`, `sections/footer-group.json`
- Modify: `assets/av-base.css` (drawer `<dialog>` rules)

- [ ] **Step 1: `snippets/av-icon.liquid`** — inline SVGs, stroke 1.5, `currentColor`

```liquid
{%- comment -%} Usage: {% render 'av-icon', name: 'search' %} — names: search, account, bag, burger, close, play {%- endcomment -%}
{%- case name -%}
{%- when 'search' -%}
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
{%- when 'account' -%}
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
{%- when 'bag' -%}
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
{%- when 'burger' -%}
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
{%- when 'close' -%}
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" focusable="false"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
{%- when 'play' -%}
<svg viewBox="0 0 72 72" fill="currentColor" aria-hidden="true" focusable="false"><path d="M29 24v24l20-12z"/></svg>
{%- endcase -%}
```

- [ ] **Step 2: `snippets/av-cart-bubble.liquid`** and `sections/cart-icon-bubble.liquid`

Snippet:
```liquid
{%- comment -%} Contents of the header bag link. Also the whole output of sections/cart-icon-bubble.liquid, which Dawn's cart.js re-fetches on quantity change. Keep the two identical. {%- endcomment -%}
{% render 'av-icon', name: 'bag' %}
<span class="visually-hidden">{{ 'templates.cart.cart' | t }}</span>
{%- if cart != empty -%}
  <span class="av-cart-count" aria-hidden="true">{{ cart.item_count }}</span>
  <span class="visually-hidden">{{ 'sections.header.cart_count' | t: count: cart.item_count }}</span>
{%- endif -%}
```

Replace the entire contents of `sections/cart-icon-bubble.liquid` with:
```liquid
{% render 'av-cart-bubble' %}
```

- [ ] **Step 3: `snippets/av-newsletter-form.liquid`** (footer and Stories line share it)

```liquid
{%- comment -%} Usage: {% render 'av-newsletter-form', id: 'footer', placeholder: 'Your email, for the next drop', class: 'av-footer__news' %} {%- endcomment -%}
{%- assign form_id = 'av-news-' | append: id -%}
{%- form 'customer', id: form_id, class: class -%}
  <input type="hidden" name="contact[tags]" value="newsletter">
  {%- if form.posted_successfully? -%}
    <span class="av-body--s">Thank you. The next letter comes to you.</span>
  {%- else -%}
    <label class="visually-hidden" for="av-news-input-{{ id }}">Email</label>
    <input id="av-news-input-{{ id }}" type="email" name="contact[email]" value="{{ form.email }}" placeholder="{{ placeholder }}" autocomplete="email" required{% if form.errors %} aria-invalid="true"{% endif %}>
    <button type="submit">Join</button>
  {%- endif -%}
{%- endform -%}
```

- [ ] **Step 4: `sections/av-header.liquid`**

```liquid
<header class="av-header" id="av-header">
  <button class="av-header__burger" type="button" aria-label="Open menu" onclick="document.getElementById('av-drawer').showModal()">{% render 'av-icon', name: 'burger' %}</button>
  <nav class="av-header__nav av-header__nav--left" aria-label="The house">
    {%- for link in section.settings.menu_house.links -%}
      <a href="{{ link.url }}"{% if link.current %} aria-current="page"{% endif %}>{{ link.title }}</a>
    {%- endfor -%}
  </nav>
  <a class="av-header__home" href="{{ routes.root_url }}" aria-label="{{ shop.name }}">{% render 'av-wordmark', class: 'av-header__wordmark' %}</a>
  <div class="av-header__right">
    <nav class="av-header__nav av-header__nav--right" aria-label="Shop">
      {%- for link in section.settings.menu_shop.links -%}
        <a href="{{ link.url }}"{% if link.current %} aria-current="page"{% endif %}>{{ link.title }}</a>
      {%- endfor -%}
    </nav>
    <div class="av-header__icons">
      <a href="{{ routes.search_url }}" aria-label="Search">{% render 'av-icon', name: 'search' %}</a>
      {%- if shop.customer_accounts_enabled -%}
        <a href="{% if customer %}{{ routes.account_url }}{% else %}{{ routes.account_login_url }}{% endif %}" aria-label="Account">{% render 'av-icon', name: 'account' %}</a>
      {%- endif -%}
      <a href="{{ routes.cart_url }}" id="cart-icon-bubble">{% render 'av-cart-bubble' %}</a>
    </div>
  </div>
</header>

<dialog class="av-drawer" id="av-drawer" aria-label="Menu">
  <button class="av-drawer__close" type="button" aria-label="Close menu" onclick="this.closest('dialog').close()">{% render 'av-icon', name: 'close' %}</button>
  <div class="av-drawer__group">
    {%- for link in section.settings.menu_house.links -%}<a href="{{ link.url }}">{{ link.title }}</a>{%- endfor -%}
  </div>
  <div class="av-drawer__group">
    {%- for link in section.settings.menu_shop.links -%}<a href="{{ link.url }}">{{ link.title }}</a>{%- endfor -%}
  </div>
</dialog>

{% schema %}
{
  "name": "AV Header",
  "class": "av-header-section",
  "settings": [
    { "type": "link_list", "id": "menu_house", "label": "Left menu — the house (Stories · Gallery · About)" },
    { "type": "link_list", "id": "menu_shop", "label": "Right menu — shop (Collections · Products · Exclusive)" }
  ]
}
{% endschema %}
```

`link_list` settings only accept `main-menu` or `footer` as a `default`, so there is none here; `sections/header-group.json` (Step 7) assigns `av-house` / `av-shop` as values instead. Until those menus exist in admin the nav renders no links — the documented empty state; `docs/setup.md` (Task 12) tells the client to create them.

- [ ] **Step 5: Drawer CSS** — in `assets/av-base.css` replace the `.av-drawer` block (`display: none` / `[open]`) with native-dialog rules:

```css
.av-drawer { position: fixed; inset: 0; width: 100vw; height: 100vh; max-width: none; max-height: none; margin: 0; border: 0; z-index: 60; background: var(--av-kumkum); padding: 96px var(--av-gutter) 40px; flex-direction: column; gap: 40px; }
.av-drawer[open] { display: flex; }
.av-drawer::backdrop { background: transparent; }
.av-header__home { display: flex; justify-content: center; }
```

Keep `.av-drawer__group` and `.av-drawer__close` as they are. Then three header fixes in `av-base.css`:

1. **Sticky must be on the section wrapper**, not on `.av-header` — a sticky element cannot leave its parent's box, and Shopify wraps every section in an auto-height `.shopify-section`. The schema sets `"class": "av-header-section"`, so add `.av-header-section { position: sticky; top: 0; z-index: 50; }` and change `.av-header` from `position: sticky; top: 0; z-index: 50;` to `position: relative;`.
2. The grid stays `1fr auto 1fr` (left nav · wordmark · right group), which keeps the wordmark exactly centred. Add `.av-header__right { display: flex; justify-content: flex-end; align-items: center; gap: 36px; }`.
3. Mobile (`max-width: 900px`): the existing `auto 1fr auto` grid becomes burger · wordmark · right group; both `<nav>`s are already `display: none` there, so the right group shows icons only. Nothing else to add.

- [ ] **Step 6: `sections/av-footer.liquid`**

```liquid
<footer class="av-footer">
  <div class="av-footer__grid">
    <div class="av-footer__brand">
      {% render 'av-wordmark', class: 'av-footer__wordmark' %}
      <p class="av-footer__blurb">{{ section.settings.blurb }}</p>
      {% render 'av-newsletter-form', id: 'footer', placeholder: section.settings.news_placeholder, class: 'av-footer__news' %}
    </div>
    {%- for block in section.blocks -%}
      <div class="av-footer__col" {{ block.shopify_attributes }}>
        <div class="av-footer__title">{{ block.settings.heading }}</div>
        {%- for link in block.settings.menu.links -%}<a href="{{ link.url }}">{{ link.title }}</a>{%- endfor -%}
      </div>
    {%- endfor -%}
  </div>
  <div class="av-footer__bottom">
    <div>© {{ 'now' | date: '%Y' }} {{ shop.name }}{% for policy in shop.policies %}{% if policy.body != blank %} · <a href="{{ policy.url }}">{{ policy.title }}</a>{% endif %}{% endfor %}</div>
    <div>{{ settings.av_currency_line }}</div>
  </div>
</footer>

{% schema %}
{
  "name": "AV Footer",
  "settings": [
    { "type": "textarea", "id": "blurb", "label": "Blurb", "default": "[Weaving unit], [town], Tamil Nadu. Handwoven veshtis in numbered editions." },
    { "type": "text", "id": "news_placeholder", "label": "Newsletter placeholder", "default": "Your email, for the next drop" }
  ],
  "blocks": [
    { "type": "column", "name": "Link column", "limit": 4, "settings": [
      { "type": "text", "id": "heading", "label": "Heading" },
      { "type": "link_list", "id": "menu", "label": "Menu" }
    ] }
  ],
  "presets": [{ "name": "AV Footer" }]
}
{% endschema %}
```

The footer bottom line prints policies that exist (Privacy, Terms) instead of dead links; the currency line is text (Dawn's localization form is skipped — one currency, one market, per §4).

- [ ] **Step 7: Groups**

`sections/header-group.json`:
```json
{ "name": "Header", "type": "header", "sections": { "av-header": { "type": "av-header", "settings": { "menu_house": "av-house", "menu_shop": "av-shop" } } }, "order": ["av-header"] }
```

`sections/footer-group.json`:
```json
{ "name": "Footer", "type": "footer", "sections": { "av-footer": { "type": "av-footer", "blocks": {
  "house": { "type": "column", "settings": { "heading": "The house", "menu": "av-house" } },
  "shop": { "type": "column", "settings": { "heading": "Shop", "menu": "av-shop" } },
  "orders": { "type": "column", "settings": { "heading": "Orders", "menu": "av-orders" } },
  "contact": { "type": "column", "settings": { "heading": "Contact", "menu": "av-contact" } }
}, "block_order": ["house", "shop", "orders", "contact"], "settings": {} } }, "order": ["av-footer"] }
```

- [ ] **Step 8: Verify**

`shopify theme check` → 0 errors. Dev preview: red sticky header 88px with wordmark centred; at 375px a burger opens a full-screen red dialog and the close button closes it; footer red with four columns (empty until menus exist — create `av-house`/`av-shop` in admin now under Online Store → Navigation so links show: Stories `/blogs/stories`, Gallery `/pages/gallery`, About `/pages/about`; Collections `/collections`, Products `/collections/all`, Exclusive `/pages/exclusive`). Add one product to the cart from any stock page and confirm the bag shows a count and `/cart` quantity changes update it without console errors.

- [ ] **Step 9: Commit**

```bash
git add sections/av-header.liquid sections/av-footer.liquid sections/cart-icon-bubble.liquid sections/header-group.json sections/footer-group.json snippets/av-icon.liquid snippets/av-cart-bubble.liquid snippets/av-newsletter-form.liquid assets/av-base.css
git commit -m "feat: AV header, mobile drawer, footer and cart bubble

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Core snippets — media, video, edition line, WhatsApp, drop iteration

**Files:**
- Create: `snippets/av-media.liquid`, `snippets/av-video.liquid`, `snippets/av-edition-line.liquid`, `snippets/av-whatsapp-link.liquid`

- [ ] **Step 1: `snippets/av-media.liquid`**

```liquid
{%- comment -%}
  Responsive image in a fixed-ratio box. Ivory placeholder when blank.
  Usage: {% render 'av-media', image: settings.image, ratio: '4 / 5', sizes: '(min-width: 900px) 33vw, 100vw', alt: 'text', loading: 'lazy', class: 'extra' %}
{%- endcomment -%}
{%- liquid
  assign ratio = ratio | default: '4 / 5'
  assign sizes = sizes | default: '100vw'
  assign loading = loading | default: 'lazy'
  assign alt = alt | default: image.alt | default: ''
-%}
<div class="av-media av-media--ratio {{ class }}" style="--ratio: {{ ratio }};">
  {%- if image != blank -%}
    {{ image | image_url: width: 2400 | image_tag: widths: '400, 600, 800, 1200, 1600, 2400', sizes: sizes, loading: loading, alt: alt }}
  {%- endif -%}
</div>
```

- [ ] **Step 2: `snippets/av-video.liquid`**

```liquid
{%- comment -%}
  Muted loop with play button. `loop_video` is a Shopify video (file) metafield/setting; `film` optional full film.
  Usage: {% render 'av-video', loop_video: section.settings.loop, film: section.settings.film, poster: section.settings.poster, class: 'av-film__video' %}
{%- endcomment -%}
{%- liquid
  assign loop_src = ''
  if loop_video != blank and loop_video.sources.size > 0
    assign loop_src = loop_video.sources | where: 'format', 'mp4' | first
    assign loop_src = loop_src.url
  endif
  assign film_src = ''
  if film != blank and film.sources.size > 0
    assign film_src = film.sources | where: 'format', 'mp4' | first
    assign film_src = film_src.url
  endif
-%}
<div class="av-video {{ class }}"{% if film_src != blank %} data-film="{{ film_src }}"{% endif %}>
  {%- if loop_src != blank -%}
    <video src="{{ loop_src }}" muted autoplay loop playsinline preload="metadata"{% if poster != blank %} poster="{{ poster | image_url: width: 1600 }}"{% endif %}></video>
  {%- elsif poster != blank -%}
    {{ poster | image_url: width: 1600 | image_tag: loading: 'lazy', alt: '' }}
  {%- endif -%}
  {%- if loop_src != blank or film_src != blank -%}
    <button class="av-video__play" type="button" aria-label="{% if film_src != blank %}Play the film with sound{% else %}Play with sound{% endif %}">{% render 'av-icon', name: 'play' %}</button>
  {%- endif -%}
</div>
```

- [ ] **Step 3: `snippets/av-edition-line.liquid`** — the only place counts are computed

```liquid
{%- comment -%}
  Usage: {% render 'av-edition-line', product: product, context: 'tile' %}  context: tile | row | page
  tile: "3 of 8 left" / "Sold out"
  row:  "8 pieces in Drop 001. 3 remain." / "8 pieces in Drop 001. All placed."
  page: "3 of 8 remain" / "All 8 placed"
{%- endcomment -%}
{%- liquid
  assign v = product.selected_or_first_available_variant | default: product.variants.first
  assign remaining = v.inventory_quantity | default: 0
  if v.inventory_management != 'shopify'
    assign remaining = 1
  endif
  assign total = product.metafields.av.edition_total.value | default: 0
  assign drop = product.metafields.av.drop.value
  assign drop_no = drop.number.value | default: drop.number
  if remaining < 0
    assign remaining = 0
  endif
-%}
{%- case context -%}
{%- when 'row' -%}
  {%- if total > 0 -%}{{ total }} pieces{% if drop_no %} in Drop {{ drop_no | prepend: '00' | slice: -3, 3 }}{% endif %}. {% if remaining > 0 %}{{ remaining }} remain.{% else %}All placed.{% endif %}{%- endif -%}
{%- when 'page' -%}
  {%- if remaining > 0 -%}{{ remaining }} of {{ total }} remain{%- else -%}All {{ total }} placed{%- endif -%}
{%- else -%}
  {%- if remaining > 0 -%}{{ remaining }} of {{ total }} left{%- else -%}Sold out{%- endif -%}
{%- endcase -%}
```

(`prepend: '00' | slice: -3, 3` zero-pads 1 → 001, 12 → 012.)

- [ ] **Step 4: `snippets/av-whatsapp-link.liquid`**

```liquid
{%- comment -%} Usage: {% render 'av-whatsapp-link', label: 'Ask on WhatsApp', text: 'About [piece]' , class: 'av-link' %} Renders nothing if no number is set. {%- endcomment -%}
{%- if settings.av_whatsapp_number != blank -%}
  {%- assign msg = text | default: 'Hello Ananta Vastram' | url_encode -%}
  <a class="{{ class | default: 'av-link' }}" href="https://wa.me/{{ settings.av_whatsapp_number }}?text={{ msg }}" target="_blank" rel="noopener">{{ label | default: 'WhatsApp' }}</a>
{%- endif -%}
```

- [ ] **Step 5: Drop iteration rule** — no file. Liquid snippets cannot return values, so ordered drop iteration is inlined wherever needed (`av-drop-rows` Task 5, `av-drop-index` Task 6) using the same loop: `for i in (1..50) reversed` → handle `drop-NNN` → `shop.metaobjects.drop[handle]` → skip blanks. The rule is documented once, as the comment at the top of `sections/av-drop-index.liquid` (Task 6 Step 3).

- [ ] **Step 6: Theme check and commit**

```bash
shopify theme check && git add snippets/av-media.liquid snippets/av-video.liquid snippets/av-edition-line.liquid snippets/av-whatsapp-link.liquid && git commit -m "feat: core AV snippets (media, video, edition line, WhatsApp)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 5: Homepage sections and `index.json`

Reference artboard: `Main.dc.html`. Every section gets `class="av-reveal"` on its outermost element except `av-hero`.

**Files:**
- Create: `sections/av-hero.liquid`, `sections/av-credo.liquid`, `sections/av-showcase-three.liquid`, `sections/av-story.liquid`, `sections/av-film-banner.liquid`, `sections/av-drop-rows.liquid`, `sections/av-exclusive-row.liquid`
- Create: `snippets/av-product-row.liquid`, `snippets/av-drop-banner.liquid`
- Rewrite: `templates/index.json`

- [ ] **Step 1: `sections/av-hero.liquid`**

```liquid
<section class="av-hero">
  {%- if section.settings.image != blank -%}
    {{ section.settings.image | image_url: width: 2800 | image_tag: widths: '800, 1200, 1600, 2000, 2800', sizes: '100vw', loading: 'eager', fetchpriority: 'high', alt: section.settings.image.alt | default: '' }}
  {%- else -%}
    <div class="av-media" style="height:100%"></div>
  {%- endif -%}
</section>
{% schema %}
{ "name": "AV Hero", "settings": [ { "type": "image_picker", "id": "image", "label": "Full-viewport still (no copy, no button)" } ], "presets": [{ "name": "AV Hero" }] }
{% endschema %}
```

- [ ] **Step 2: `sections/av-credo.liquid`**

```liquid
<section class="av-credo av-reveal">
  <div class="av-label">{{ section.settings.label }}</div>
  <p class="av-statement av-statement--credo av-credo__text">{{ section.settings.statement }}</p>
  <span class="av-credo__line"></span>
</section>
{% schema %}
{ "name": "AV Credo", "settings": [
  { "type": "text", "id": "label", "label": "Label", "default": "The house keeps to this" },
  { "type": "textarea", "id": "statement", "label": "Statement", "default": "Woven by hand, in numbered editions, by weavers we name. Nothing is made until it is asked for, and nothing is ever marked down." }
], "presets": [{ "name": "AV Credo" }] }
{% endschema %}
```

- [ ] **Step 3: `sections/av-showcase-three.liquid`**

```liquid
<section class="av-showcase av-reveal">
  <div class="av-grid av-grid--3">
    {%- for block in section.blocks -%}
      <div {{ block.shopify_attributes }}>{% render 'av-media', image: block.settings.image, ratio: '3 / 5.6', sizes: '(min-width: 900px) 33vw, 100vw' %}</div>
    {%- endfor -%}
  </div>
  <div class="av-grid av-grid--3">
    {%- for block in section.blocks -%}
      <div class="av-showcase__caption">{{ block.settings.caption }}</div>
    {%- endfor -%}
  </div>
</section>
{% schema %}
{ "name": "AV Showcase (three)", "max_blocks": 3, "blocks": [ { "type": "image", "name": "Image", "settings": [
  { "type": "image_picker", "id": "image", "label": "Image (tall)" },
  { "type": "text", "id": "caption", "label": "Caption (Roman numeral · name)", "default": "I · [Set]" }
] } ], "presets": [ { "name": "AV Showcase (three)", "blocks": [ { "type": "image", "settings": { "caption": "I · Red set" } }, { "type": "image", "settings": { "caption": "II · Rust set" } }, { "type": "image", "settings": { "caption": "III · Linen set" } } ] } ] }
{% endschema %}
```

- [ ] **Step 4: `sections/av-story.liquid`**

```liquid
<section class="av-story av-reveal">
  {% render 'av-media', image: section.settings.image, ratio: '720 / 760', sizes: '(min-width: 900px) 50vw, 100vw' %}
  <div class="av-story__text">
    <div class="av-label">{{ section.settings.label }}</div>
    <p class="av-sub av-sub--m">{{ section.settings.heading }}</p>
    <div class="av-body">{{ section.settings.text }}</div>
    {%- if section.settings.link_label != blank -%}<a class="av-link" href="{{ section.settings.link }}">{{ section.settings.link_label }}</a>{%- endif -%}
  </div>
</section>
{% schema %}
{ "name": "AV Story", "settings": [
  { "type": "image_picker", "id": "image", "label": "Image (weaver at the loom)" },
  { "type": "text", "id": "label", "label": "Label", "default": "The house" },
  { "type": "textarea", "id": "heading", "label": "Heading (Rubik)", "default": "A veshti is not a garment first. It is a length of cloth that a weaver has already decided everything about." },
  { "type": "richtext", "id": "text", "label": "Paragraphs", "default": "<p>[Brand story, paragraph one — Kamalam, the unit, the town.]</p><p>[Paragraph two — the yarn, the dye, the border.]</p><p>[Paragraph three — why each piece carries the weaver's name and a number.]</p>" },
  { "type": "text", "id": "link_label", "label": "Link label", "default": "The craft" },
  { "type": "url", "id": "link", "label": "Link" }
], "presets": [{ "name": "AV Story" }] }
{% endschema %}
```

- [ ] **Step 5: `sections/av-film-banner.liquid`**

```liquid
<section class="av-film av-reveal">
  <div class="av-film__grid">
    {% render 'av-video', loop_video: section.settings.loop, film: section.settings.film, poster: section.settings.poster, class: 'av-film__video' %}
    {% render 'av-media', image: section.settings.still, ratio: '480 / 640', sizes: '(min-width: 900px) 33vw, 100vw' %}
  </div>
  <div class="av-film__caption">
    <div class="av-sub av-sub--xs">{{ section.settings.caption }}</div>
    <div class="av-label">{{ section.settings.meta }}</div>
  </div>
</section>
{% schema %}
{ "name": "AV Film banner", "settings": [
  { "type": "video", "id": "loop", "label": "Silent loop (loom, fixed rig)" },
  { "type": "video", "id": "film", "label": "Drop film with sound (plays on tap)" },
  { "type": "image_picker", "id": "poster", "label": "Poster frame" },
  { "type": "image_picker", "id": "still", "label": "Tall still (border and kara, macro)" },
  { "type": "text", "id": "caption", "label": "Caption", "default": "The drop film — loom, hands, a voice in Tamil" },
  { "type": "text", "id": "meta", "label": "Meta", "default": "≈ 1:30 · subtitled" }
], "presets": [{ "name": "AV Film banner" }] }
{% endschema %}
```

In `av-sections.css` the `.av-film__video` block already styles `video` and `.av-film__play`; because `av-video` emits `.av-video__play`, add `.av-film__video .av-video__play { position:absolute; inset:0; margin:auto; }` and `.av-film__video.is-playing .av-video__play { display:none; }` (the generic `.av-video` rules from the about block cover the rest — they apply because the snippet also adds class `av-video`).

- [ ] **Step 6: `snippets/av-drop-banner.liquid`** and **`snippets/av-product-row.liquid`**

Banner:
```liquid
{%- comment -%} Usage: {% render 'av-drop-banner', label: 'Drop 001', title: drop.theme_name, meta: 'Three pieces · Pongal 2027' %} {%- endcomment -%}
<div class="av-drop-banner">
  <div class="av-drop-banner__title">
    <span class="av-label">{{ label }}</span>
    <span class="av-sub av-sub--l">{{ title }}</span>
  </div>
  {%- if meta != blank -%}<span class="av-label av-label--red">{{ meta }}</span>{%- endif -%}
</div>
```

Row (image | story | notes):
```liquid
{%- comment -%} One product, one row. Usage: {% render 'av-product-row', product: product %} {%- endcomment -%}
{%- liquid
  assign mf = product.metafields.av
  assign weaver = mf.weaver.value
  assign drop = mf.drop.value
  assign v = product.selected_or_first_available_variant | default: product.variants.first
  assign sold_out = false
  if v.inventory_management == 'shopify' and v.inventory_quantity <= 0
    assign sold_out = true
  endif
-%}
<article class="av-row av-reveal{% if sold_out %} av-row--sold{% endif %}">
  <a href="{{ product.url }}" aria-label="{{ product.title | escape }}">{% render 'av-media', image: product.featured_image, ratio: '520 / 560', sizes: '(min-width: 1100px) 520px, (min-width: 900px) 50vw, 100vw' %}</a>
  <div class="av-row__story">
    <div class="av-stack" style="gap:8px">
      <div class="av-label">{% if mf.numeral != blank %}No. {{ mf.numeral }}{% endif %}{% if mf.tier != blank %} · {{ mf.tier | capitalize }}{% endif %}</div>
      <h3 class="av-name"><a href="{{ product.url }}">{{ product.title }}</a></h3>
    </div>
    <div class="av-body av-body--s">{{ product.description }}</div>
    {%- if mf.how_made != blank or weaver != blank -%}
    <div class="av-row__making">
      <div class="av-label av-label--red">How it is made</div>
      <div class="av-body av-body--s">
        {%- if weaver != blank -%}Woven by {{ weaver.name }}{% if weaver.unit != blank %} at {{ weaver.unit }}{% endif %}. {% endif -%}
        {{ mf.how_made | newline_to_br }}
      </div>
    </div>
    {%- endif -%}
  </div>
  <div class="av-row__notes">
    <div class="av-price">{{ product.price | money }}</div>
    <div class="av-row__note"><div class="av-label">Edition</div><div class="av-body av-body--s">{% render 'av-edition-line', product: product, context: 'row' %}</div></div>
    <div class="av-row__note"><div class="av-label">Availability</div><div class="av-body av-body--s">{% if sold_out %}Sold out.{% else %}Made to order.{% if mf.lead_time_weeks != blank %} {{ mf.lead_time_weeks }} weeks from confirmation.{% endif %}{% endif %}</div></div>
    <div class="av-row__note"><div class="av-label">Shipping</div><div class="av-body av-body--s">{{ settings.av_shipping_line }}</div></div>
    <a class="av-link" href="{{ product.url }}">View the piece</a>
  </div>
</article>
```

Add to `av-sections.css` under the row block: `.av-row--sold .av-media { opacity: .45; }`.

- [ ] **Step 7: `sections/av-drop-rows.liquid`** — banner + rows for one drop (auto or chosen)

```liquid
{%- liquid
  assign drop = section.settings.drop
  if drop == blank
    assign want = section.settings.auto_index
    assign seen = 0
    for i in (1..50) reversed
      assign h = i | prepend: '00' | slice: -3, 3 | prepend: 'drop-'
      assign d = shop.metaobjects.drop[h]
      if d == blank or d.status.value == 'closed'
        continue
      endif
      assign seen = seen | plus: 1
      if seen == want
        assign drop = d
        break
      endif
    endfor
  endif
-%}
{%- if drop != blank and drop.collection.value != blank -%}
  {%- liquid
    assign col = drop.collection.value
    assign count = col.products_count
    assign padded = drop.number.value | prepend: '00' | slice: -3, 3
    assign label = 'Drop ' | append: padded
    assign meta = count | append: ' pieces'
    if drop.season != blank
      assign meta = meta | append: ' · ' | append: drop.season
    endif
  -%}
  <section class="av-drop-rows">
    {% render 'av-drop-banner', label: label, title: drop.theme_name, meta: meta %}
    <div class="av-rows">
      {%- for product in col.products limit: 12 -%}{% render 'av-product-row', product: product %}{%- endfor -%}
    </div>
  </section>
{%- endif -%}
{% schema %}
{ "name": "AV Drop rows", "settings": [
  { "type": "metaobject", "metaobject_type": "drop", "id": "drop", "label": "Drop (leave empty to pick automatically)" },
  { "type": "range", "id": "auto_index", "min": 1, "max": 3, "step": 1, "default": 1, "label": "Automatic pick: Nth newest open drop" }
], "presets": [{ "name": "AV Drop rows" }] }
{% endschema %}
```

**Metaobject access rule (applies to every task):** a `metaobject`-type *setting* (`section.settings.drop`, `block.settings.weaver`, `section.settings.campaign`) returns the metaobject directly — never add `.value` to it. A metaobject *field* (`drop.status`, `drop.number`, `drop.collection`) is a metafield object: use `.value` whenever the field is compared, filtered or is a reference (`drop.status.value == 'current'`, `drop.number.value | prepend: '00'`, `drop.collection.value.url`); bare `{{ drop.theme_name }}` output is fine because Liquid renders the metafield's value when printed.

- [ ] **Step 8: `sections/av-exclusive-row.liquid`** — the advert; all copy from settings

```liquid
<section class="av-drop-rows av-reveal">
  {% render 'av-drop-banner', label: 'Exclusive', title: section.settings.title, meta: section.settings.meta %}
  <div class="av-rows">
    <article class="av-row">
      {% render 'av-media', image: section.settings.image, ratio: '520 / 560', sizes: '(min-width: 1100px) 520px, 100vw' %}
      <div class="av-row__story">
        <div class="av-stack" style="gap:8px"><div class="av-label">Exclusive · {{ section.settings.category }}</div><h3 class="av-name">{{ section.settings.name }}</h3></div>
        <div class="av-body av-body--s">{{ section.settings.description }}</div>
        <div class="av-row__making"><div class="av-label av-label--red">How it is made</div><div class="av-body av-body--s">{{ section.settings.how_made }}</div></div>
      </div>
      <div class="av-row__notes">
        <div class="av-price">On enquiry</div>
        <div class="av-row__note"><div class="av-label">Availability</div><div class="av-body av-body--s">{{ section.settings.availability }}</div></div>
        <div class="av-row__note"><div class="av-label">Shipping</div><div class="av-body av-body--s">{{ section.settings.shipping }}</div></div>
        <a class="av-link" href="{{ section.settings.link }}">See the exclusive line</a>
      </div>
    </article>
  </div>
</section>
{% schema %}
{ "name": "AV Exclusive row", "settings": [
  { "type": "text", "id": "title", "label": "Banner title", "default": "[Second collection name]" },
  { "type": "text", "id": "meta", "label": "Banner meta", "default": "Wedding sets · made once, to the wearer" },
  { "type": "image_picker", "id": "image", "label": "Image" },
  { "type": "text", "id": "category", "label": "Category", "default": "Wedding" },
  { "type": "text", "id": "name", "label": "Piece name", "default": "[Piece name] — the groom set" },
  { "type": "textarea", "id": "description", "label": "Description", "default": "Pale-gold silk kurta with a gold zari angavastram. Ivory veshti, gold border, hand-worked motifs on the pallu. Made once, for one wearer, to their measure." },
  { "type": "textarea", "id": "how_made", "label": "How it is made", "default": "Begins with a conversation with Kamalam. [Yarn / silk grade], [zari type]. About [loom hours] hours at the loom, then [hand-work hours] at the table." },
  { "type": "text", "id": "availability", "label": "Availability", "default": "[X] commissions a season. [Y] weeks from the first fitting." },
  { "type": "text", "id": "shipping", "label": "Shipping", "default": "[Commission delivery terms]" },
  { "type": "url", "id": "link", "label": "Link to Exclusive page" }
], "presets": [{ "name": "AV Exclusive row" }] }
{% endschema %}
```

- [ ] **Step 9: `templates/index.json`**

```json
{ "sections": {
  "hero": { "type": "av-hero", "settings": {} },
  "credo": { "type": "av-credo", "settings": {} },
  "showcase": { "type": "av-showcase-three", "blocks": { "a": { "type": "image", "settings": { "caption": "I · Red set" } }, "b": { "type": "image", "settings": { "caption": "II · Rust set" } }, "c": { "type": "image", "settings": { "caption": "III · Linen set" } } }, "block_order": ["a", "b", "c"], "settings": {} },
  "story": { "type": "av-story", "settings": {} },
  "film": { "type": "av-film-banner", "settings": {} },
  "drop-1": { "type": "av-drop-rows", "settings": { "auto_index": 1 } },
  "drop-2": { "type": "av-drop-rows", "settings": { "auto_index": 2 } },
  "exclusive": { "type": "av-exclusive-row", "settings": { "link": "shopify://pages/exclusive" } }
}, "order": ["hero", "credo", "showcase", "story", "film", "drop-1", "drop-2", "exclusive"] }
```

- [ ] **Step 10: Seed test data in admin (one-time, needed to see rows)**

In admin: Settings → Custom data → Metaobjects → add definition `drop` with fields exactly as spec §3 (handle field: enable "handle" as editable; status: single line text with validation choices current/open/closed; collection: collection reference). Add definition `weaver` (name, portrait, role, years, unit). Then Products → metafield definitions, namespace `av`: `drop` (metaobject ref → drop), `numeral`, `tier` (single line, choices everyday/occasion/exclusive), `weaver` (ref), `edition_total` (integer), `loom_hours` (integer), `motif_name_ta`, `motif_name_en`, `yarn`, `dye`, `kara_colour`, `lead_time_weeks` (integer), `how_made` (multi-line), `care` (multi-line). Create collection "Drop 001" (manual), a drop metaobject with handle `drop-001`, number 1, status `current`, collection → Drop 001; create three products with 1 variant each, inventory tracked, quantity 3 / 8 edition_total, tag `occasion`, in the collection, with the av metafields filled. (Full list also goes into `docs/setup.md`, Task 12.)

- [ ] **Step 11: Verify against `Main.dc.html`**

Dev preview homepage at 1440: hero fills viewport under header; credo centred ~38px Marcellus; three tall images with numeral captions; story split; film banner 2/3 + 1/3; "Drop 001" banner then three rows (520 | story | 280 notes) with hairlines; Exclusive banner + one row with "On enquiry". At 375: rows stack image → story → notes. `read_console_messages` clean. `shopify theme check` 0 errors.

- [ ] **Step 12: Commit**

```bash
git add sections/av-hero.liquid sections/av-credo.liquid sections/av-showcase-three.liquid sections/av-story.liquid sections/av-film-banner.liquid sections/av-drop-rows.liquid sections/av-exclusive-row.liquid snippets/av-product-row.liquid snippets/av-drop-banner.liquid templates/index.json assets/av-sections.css
git commit -m "feat: homepage sections and template

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 6: Collections index and single-drop page

Reference artboard: `Collections.dc.html`.

**Files:**
- Create: `sections/av-page-intro.liquid`, `sections/av-drop-index.liquid`, `sections/av-drop-header.liquid`, `sections/av-product-rows.liquid`
- Create: `snippets/av-drop-tile.liquid`
- Rewrite: `templates/list-collections.json`, `templates/collection.json`

- [ ] **Step 1: `sections/av-page-intro.liquid`** (reused by Exclusive, About, Products)

```liquid
<section class="av-intro av-reveal{% if section.settings.open %} av-intro--open{% endif %}">
  <div class="av-stack" style="gap:28px">
    <div class="av-label">{{ section.settings.label }}</div>
    <h1 class="av-statement av-statement--xl">{{ section.settings.statement }}</h1>
  </div>
  <div class="av-stack">
    <div class="av-body{% if section.settings.large_body %} av-body--l{% endif %}">{{ section.settings.text }}</div>
    {%- if section.settings.note != blank -%}<div class="av-body av-body--s" style="color:var(--av-grey-1)">{{ section.settings.note }}</div>{%- endif -%}
    {%- if section.blocks.size > 0 -%}
    <div class="av-intro__keys">
      {%- for block in section.blocks -%}
        {%- if block.settings.url != blank -%}<a class="av-label av-label--red{% if block.settings.url == request.path %} is-active{% endif %}" href="{{ block.settings.url }}" {{ block.shopify_attributes }}>{{ block.settings.label }}</a>{%- else -%}<span class="av-label av-label--red" {{ block.shopify_attributes }}>{{ block.settings.label }}</span>{%- endif -%}
      {%- endfor -%}
    </div>
    {%- endif -%}
  </div>
</section>
{% schema %}
{ "name": "AV Page intro", "settings": [
  { "type": "text", "id": "label", "label": "Label", "default": "Collections" },
  { "type": "textarea", "id": "statement", "label": "Statement (Marcellus)", "default": "Numbered drops, each on one idea." },
  { "type": "richtext", "id": "text", "label": "Paragraph", "default": "<p>A drop is five or six pieces built around a single design — a motif, a border, a cloth. Each piece is made in a fixed edition. A drop stays open while pieces remain; when the last one goes, it closes and stays here as the record.</p>" },
  { "type": "textarea", "id": "note", "label": "Secondary note (About page only)" },
  { "type": "checkbox", "id": "large_body", "label": "Larger paragraph (About)", "default": false },
  { "type": "checkbox", "id": "open", "label": "No bottom rule", "default": false }
], "blocks": [ { "type": "key", "name": "Key word / filter link", "settings": [ { "type": "text", "id": "label", "label": "Label" }, { "type": "url", "id": "url", "label": "Link (optional — makes it a filter tab)" } ] } ],
"presets": [{ "name": "AV Page intro" }] }
{% endschema %}
```

Add to `av-base.css`: `.av-body--l { font-size: 18px; }` and to `av-sections.css`: `.av-intro__keys .is-active { border-bottom: 1px solid var(--av-kumkum); padding-bottom: 4px; }`. The `large_body` / `open` checkboxes here and the `mode` select on `av-band` (Task 9) are the deliberate exceptions to "no layout toggles": one section serving several artboards that differ only in that detail.

- [ ] **Step 2: `snippets/av-drop-tile.liquid`**

```liquid
{%- comment -%} Usage: {% render 'av-drop-tile', product: product %} {%- endcomment -%}
{%- liquid
  assign v = product.selected_or_first_available_variant | default: product.variants.first
  assign sold = false
  if v.inventory_management == 'shopify' and v.inventory_quantity <= 0
    assign sold = true
  endif
  assign mf = product.metafields.av
-%}
<a class="av-tile{% if sold %} av-tile--sold{% endif %}" href="{{ product.url }}">
  {% render 'av-media', image: product.featured_image, ratio: '3 / 4', sizes: '(min-width: 900px) 16vw, 50vw' %}
  <div class="av-tile__meta">
    <span class="av-label">{{ mf.numeral }}{% if mf.tier != blank %} · {{ mf.tier | capitalize }}{% endif %}</span>
    <span class="av-tile__left">{% render 'av-edition-line', product: product, context: 'tile' %}</span>
  </div>
  <div class="av-sub av-sub--xs" style="font-size:12px">{{ product.title }}</div>
</a>
```

- [ ] **Step 3: `sections/av-drop-index.liquid`**

```liquid
{%- comment -%}
  Drop ordering rule (the one place it is documented): every drop metaobject has handle
  drop-NNN (three digits = its number). Sorting metaobjects by field is unreliable in Liquid,
  so we walk the handle range newest-first and skip blanks. av-drop-rows uses the same loop.
{%- endcomment -%}
{%- liquid
  assign found = 0
  assign past_head_done = false
-%}
{%- for i in (1..50) reversed -%}
  {%- liquid
    assign h = i | prepend: '00' | slice: -3, 3 | prepend: 'drop-'
    assign drop = shop.metaobjects.drop[h]
    if drop == blank
      continue
    endif
    assign found = found | plus: 1
    assign col = drop.collection.value
    assign pieces = col.products_count | default: 0
    assign remaining = 0
    assign total = 0
    for p in col.products
      assign v = p.variants.first
      assign q = v.inventory_quantity | default: 0
      if q > 0
        assign remaining = remaining | plus: q
      endif
      assign total = total | plus: p.metafields.av.edition_total.value
    endfor
    assign per = 0
    if pieces > 0
      assign per = total | divided_by: pieces
    endif
    assign padded = drop.number.value | prepend: '00' | slice: -3, 3
  -%}
  {%- if drop.status.value == 'current' -%}
    <section class="av-drop av-reveal">
      {% render 'av-media', image: drop.ensemble_image.value, ratio: '780 / 820', sizes: '(min-width: 900px) 58vw, 100vw' %}
      <div class="av-drop__info">
        <div class="av-stack" style="gap:28px">
          <div class="av-drop__head"><span class="av-label">Drop {{ padded }}{% if drop.season != blank %} · {{ drop.season }}{% endif %}</span><span class="av-chip">Current drop</span></div>
          <h2 class="av-sub av-sub--l">{{ drop.theme_name }}</h2>
          {%- if drop.design_line != blank -%}<div class="av-label av-label--red">The design · {{ drop.design_line }}</div>{%- endif -%}
          <div class="av-body">{{ drop.story | newline_to_br }}</div>
          <div class="av-counts">
            <div class="av-count"><span class="av-label">Pieces</span><span class="av-sub av-sub--xs">{{ pieces }}</span></div>
            <div class="av-count"><span class="av-label">Edition</span><span class="av-sub av-sub--xs">{{ per }} per piece</span></div>
            <div class="av-count"><span class="av-label">Remaining</span><span class="av-sub av-sub--xs">{{ remaining }} of {{ total }}</span></div>
          </div>
        </div>
        <a class="av-link" href="{{ col.url }}">Enter the drop</a>
      </div>
    </section>
    <div class="av-tiles">{%- for p in col.products limit: 6 -%}{% render 'av-drop-tile', product: p %}{%- endfor -%}</div>
  {%- else -%}
    {%- unless past_head_done -%}
      <div class="av-past-head av-reveal">
        <div class="av-stack" style="gap:12px"><div class="av-label">Past drops</div><h2 class="av-sub av-sub--m">Still open while pieces remain</h2></div>
        <div class="av-body" style="max-width:560px">{{ section.settings.past_text }}</div>
      </div>
      {%- assign past_head_done = true -%}
    {%- endunless -%}
    <section class="av-past av-reveal">
      <div class="av-past__head">
        <div class="av-stack" style="gap:22px">
          <div class="av-drop__head"><span class="av-label">Drop {{ padded }}{% if drop.season != blank %} · {{ drop.season }}{% endif %}</span>{% if remaining > 0 %}<span class="av-chip">Pieces remaining</span>{% else %}<span class="av-chip av-chip--outline">Closed</span>{% endif %}</div>
          <h2 class="av-sub av-sub--m">{{ drop.theme_name }}</h2>
          <div class="av-counts">
            <div class="av-count"><span class="av-label">Pieces</span><span class="av-sub av-sub--xs">{{ pieces }}</span></div>
            <div class="av-count"><span class="av-label">Remaining</span><span class="av-sub av-sub--xs">{{ remaining }} of {{ total }}</span></div>
          </div>
        </div>
        <div class="av-stack" style="max-width:620px">
          <div class="av-body">{{ drop.story | newline_to_br }}</div>
          <a class="av-link" href="{{ col.url }}">{% if remaining > 0 %}See the drop{% else %}View the record{% endif %}</a>
        </div>
      </div>
      <div class="av-tiles">{%- for p in col.products limit: 6 -%}{% render 'av-drop-tile', product: p %}{%- endfor -%}</div>
    </section>
  {%- endif -%}
{%- endfor -%}
{%- if found == 0 -%}<div class="av-wrap av-section av-body">No drops yet.</div>{%- endif -%}
{% schema %}
{ "name": "AV Drop index", "settings": [
  { "type": "richtext", "id": "past_text", "label": "Past drops paragraph", "default": "<p>Earlier drops are listed in full. A piece with an edition number left can still be ordered; a sold-out piece stays on the page, with its weaver and its count, as part of the record.</p>" }
], "presets": [{ "name": "AV Drop index" }] }
{% endschema %}
```

Add to `av-sections.css` next to the `.av-past` block: `.av-past-head { padding: 96px var(--av-gutter) 40px; display: grid; grid-template-columns: 5fr 7fr; gap: 64px; align-items: end; }` and in the 900px media query `.av-past-head { grid-template-columns: 1fr; gap: 20px; }`.

- [ ] **Step 4: `sections/av-drop-header.liquid`** (single drop page)

```liquid
{%- liquid
  assign drop = collection.metafields.av.drop.value
  assign padded = drop.number.value | prepend: '00' | slice: -3, 3
-%}
<section class="av-intro av-reveal">
  <div class="av-stack" style="gap:28px">
    <div class="av-label">{% if drop != blank %}Drop {{ padded }}{% if drop.season != blank %} · {{ drop.season }}{% endif %}{% else %}{{ collection.title }}{% endif %}</div>
    <h1 class="av-statement av-statement--xl">{{ drop.theme_name | default: collection.title }}</h1>
  </div>
  <div class="av-stack">
    {%- if drop.design_line != blank -%}<div class="av-label av-label--red">The design · {{ drop.design_line }}</div>{%- endif -%}
    <div class="av-body">{{ drop.story | default: collection.description | newline_to_br }}</div>
  </div>
</section>
{% schema %}
{ "name": "AV Drop header", "settings": [] }
{% endschema %}
```

- [ ] **Step 5: `sections/av-product-rows.liquid`**

```liquid
<section class="av-rows av-section">
  {%- paginate collection.products by 12 -%}
    {%- for product in collection.products -%}{% render 'av-product-row', product: product %}{%- endfor -%}
    {%- if paginate.pages > 1 -%}<div class="av-wrap" style="padding-top:40px">{{ paginate | default_pagination }}</div>{%- endif -%}
  {%- endpaginate -%}
</section>
{% schema %}
{ "name": "AV Product rows", "settings": [] }
{% endschema %}
```

- [ ] **Step 6: Templates**

`templates/list-collections.json`:
```json
{ "sections": { "intro": { "type": "av-page-intro", "blocks": { "k1": { "type": "key", "settings": { "label": "Everyday" } }, "k2": { "type": "key", "settings": { "label": "Occasion" } } }, "block_order": ["k1", "k2"], "settings": { "label": "Collections", "statement": "Numbered drops, each on one idea." } }, "index": { "type": "av-drop-index", "settings": {} } }, "order": ["intro", "index"] }
```

`templates/collection.json`:
```json
{ "sections": { "header": { "type": "av-drop-header", "settings": {} }, "rows": { "type": "av-product-rows", "settings": {} } }, "order": ["header", "rows"] }
```

- [ ] **Step 7: Verify**

In admin, add collection metafield definition `av.drop` (metaobject ref) and set it on "Drop 001" → `drop-001`. Preview `/collections`: intro, current drop band with image left / info right, chip, counts, six tiles with "3 of 8 left". To see the past-drop band, create `drop-002` (status `current`, its own collection with one product) and change `drop-001` to `open`: 002 renders as the large band, 001 below it under the "Past drops" head with the "Pieces remaining" chip. Set one product's inventory to 0 to see a faded "Sold out" tile. `/collections/drop-001`: header + rows. Theme check 0 errors.

- [ ] **Step 8: Commit**

```bash
git add sections/av-page-intro.liquid sections/av-drop-index.liquid sections/av-drop-header.liquid sections/av-product-rows.liquid snippets/av-drop-tile.liquid templates/list-collections.json templates/collection.json assets/av-base.css assets/av-sections.css
git commit -m "feat: collections index and drop page

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Product page (layout A)

**Files:**
- Create: `sections/av-product.liquid`
- Rewrite: `templates/product.json`
- Modify: `assets/av-sections.css` (new `av-product` block)

- [ ] **Step 1: CSS block** — append to `av-sections.css`:

```css
/* av-product: stacked media left, sticky panel right */
.av-product { padding: 0 var(--av-gutter) var(--av-section); display: grid; grid-template-columns: 7fr 5fr; gap: 64px; align-items: start; }
.av-product__media { display: flex; flex-direction: column; gap: 24px; }
.av-product__media .av-media { --ratio: 4 / 5; }
.av-product__panel { position: sticky; top: calc(var(--av-header-h) + 32px); display: flex; flex-direction: column; gap: 22px; padding-top: 48px; }
.av-product__title { display: flex; flex-direction: column; gap: 10px; }
.av-product__notes { display: flex; flex-direction: column; gap: 18px; }
.av-product__actions { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
.av-product__actions .av-button { width: 100%; }
.av-product__actions .product-form__error-message-wrapper { font-family: var(--av-font-body); font-size: 13px; color: var(--av-kumkum); }
.av-product__actions .loading-overlay__spinner { display: none; }
.av-acc { border-top: 1px solid var(--av-grey-3); }
.av-acc:last-of-type { border-bottom: 1px solid var(--av-grey-3); }
.av-acc summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 16px 0; font-family: var(--av-font-body); font-size: 12px; letter-spacing: .24em; text-transform: uppercase; color: var(--av-kumkum); }
.av-acc summary::-webkit-details-marker { display: none; }
.av-acc summary::after { content: '+'; font-family: var(--av-font-heading); font-size: 18px; }
.av-acc[open] summary::after { content: '−'; }
.av-acc__body { padding: 0 0 20px; }
.av-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 24px; }
.av-notify { display: flex; flex-direction: column; gap: 12px; }
.av-notify input { width: 100%; background: none; border: 0; border-bottom: 1px solid var(--av-kumkum); border-radius: 0; outline: 0; padding: 0 0 10px; font-family: var(--av-font-body); font-weight: 300; font-size: 15px; color: var(--av-ink); min-height: 44px; }
@media (max-width: 900px) { .av-product { grid-template-columns: 1fr; gap: 32px; } .av-product__panel { position: static; padding-top: 0; } .av-product__media { flex-direction: row; overflow-x: auto; scroll-snap-type: x mandatory; margin: 0 calc(-1 * var(--av-gutter)); padding: 0 var(--av-gutter); } .av-product__media .av-media { flex: 0 0 85%; scroll-snap-align: start; } }
```

- [ ] **Step 2: `sections/av-product.liquid`**

```liquid
{%- liquid
  assign mf = product.metafields.av
  assign weaver = mf.weaver.value
  assign drop = mf.drop.value
  assign v = product.selected_or_first_available_variant
  assign sold_out = false
  if v.available == false
    assign sold_out = true
  endif
  assign form_id = 'product-form-' | append: section.id
  assign padded = drop.number.value | prepend: '00' | slice: -3, 3
  assign wa_text = 'About ' | append: product.title | append: ' — ' | append: shop.url | append: product.url
-%}
<section class="av-product">
  <div class="av-product__media">
    {%- for media in product.media -%}
      {%- liquid
        assign loading_attr = 'lazy'
        if forloop.first
          assign loading_attr = 'eager'
        endif
      -%}
      {%- if media.media_type == 'image' -%}
        {% render 'av-media', image: media, ratio: '4 / 5', sizes: '(min-width: 900px) 58vw, 85vw', loading: loading_attr %}
      {%- elsif media.media_type == 'video' -%}
        {% render 'av-video', loop_video: media, class: 'av-product__video' %}
      {%- endif -%}
    {%- endfor -%}
  </div>

  <div class="av-product__panel">
    <div class="av-product__title">
      <div class="av-label">{% if drop != blank %}Drop {{ padded }}{% endif %}{% if mf.numeral != blank %} · No. {{ mf.numeral }}{% endif %}{% if mf.tier != blank %} · {{ mf.tier | capitalize }}{% endif %}</div>
      <h1 class="av-name">{{ product.title }}</h1>
      <div class="av-price">{{ v.price | money }}</div>
    </div>
    <div class="av-body av-body--s">{{ product.description }}</div>

    <div class="av-product__notes">
      <div class="av-row__note"><div class="av-label">Edition</div><div class="av-body av-body--s">{% render 'av-edition-line', product: product, context: 'page' %}</div></div>
      <div class="av-row__note"><div class="av-label">Availability</div><div class="av-body av-body--s">{% if sold_out %}This number is placed.{% else %}Made to order.{% if mf.lead_time_weeks != blank %} {{ mf.lead_time_weeks }} weeks from confirmation.{% endif %}{% endif %}</div></div>
    </div>

    <div class="av-product__actions">
      {%- if sold_out -%}
        {%- form 'contact', id: 'av-notify', class: 'av-notify' -%}
          <input type="hidden" name="contact[product]" value="{{ product.handle }}">
          <input type="hidden" name="contact[subject]" value="Notify me: {{ product.title | escape }}">
          {%- if form.posted_successfully? -%}
            <div class="av-body av-body--s">Noted. If a number comes back, you hear first.</div>
          {%- else -%}
            <label class="av-label" for="av-notify-email">Notify me if a number comes back</label>
            <input id="av-notify-email" type="email" name="contact[email]" placeholder="Your email" required>
            <button class="av-button" type="submit">Notify me</button>
          {%- endif -%}
        {%- endform -%}
      {%- else -%}
        <product-form class="product-form">
          <div class="product-form__error-message-wrapper" role="alert" hidden><span class="product-form__error-message"></span></div>
          {%- form 'product', product, id: form_id, class: 'form', novalidate: 'novalidate', data-type: 'add-to-cart-form' -%}
            <input type="hidden" name="id" value="{{ v.id }}" disabled class="product-variant-id">
            <input type="hidden" name="quantity" value="1">
            <button id="ProductSubmitButton-{{ section.id }}" type="submit" name="add" class="av-button product-form__submit"><span>Order this piece</span><div class="loading-overlay__spinner hidden"></div></button>
          {%- endform -%}
        </product-form>
      {%- endif -%}
      {% render 'av-whatsapp-link', label: 'Ask on WhatsApp', text: wa_text %}
    </div>

    <div class="av-product__accordions">
      {%- if mf.how_made != blank or weaver != blank -%}
      <details class="av-acc"><summary>How it is made</summary><div class="av-acc__body av-body av-body--s">{% if weaver != blank %}Woven by {{ weaver.name }}{% if weaver.unit != blank %} at {{ weaver.unit }}{% endif %}. {% endif %}{{ mf.how_made | newline_to_br }}</div></details>
      {%- endif -%}
      <details class="av-acc"><summary>Materials and motif</summary><div class="av-acc__body av-body av-body--s">
        {%- if mf.yarn != blank -%}<p>Yarn: {{ mf.yarn }}</p>{%- endif -%}
        {%- if mf.dye != blank -%}<p>Dye: {{ mf.dye }}</p>{%- endif -%}
        {%- if mf.motif_name_en != blank or mf.motif_name_ta != blank -%}<p>Motif: {{ mf.motif_name_ta }}{% if mf.motif_name_en != blank %} — {{ mf.motif_name_en }}{% endif %}</p>{%- endif -%}
        {%- if mf.loom_hours != blank -%}<p>About {{ mf.loom_hours }} hours at the loom.</p>{%- endif -%}
      </div></details>
      <details class="av-acc"><summary>Shipping</summary><div class="av-acc__body av-body av-body--s">{{ section.settings.shipping | default: settings.av_shipping_line }}</div></details>
      <details class="av-acc"><summary>Care</summary><div class="av-acc__body av-body av-body--s">{{ mf.care | default: section.settings.care | newline_to_br }}</div></details>
    </div>

    <div class="av-facts">
      {%- if weaver != blank -%}<div class="av-row__note"><div class="av-label">Woven by</div><div class="av-body av-body--s">{{ weaver.name }}{% if weaver.unit != blank %} · {{ weaver.unit }}{% endif %}</div></div>{%- endif -%}
      {%- if drop != blank -%}<div class="av-row__note"><div class="av-label">Drop</div><div class="av-body av-body--s"><a href="{{ drop.collection.value.url }}">{{ padded }}{% if drop.theme_name != blank %} · {{ drop.theme_name }}{% endif %}</a></div></div>{%- endif -%}
      {%- if mf.edition_total != blank -%}<div class="av-row__note"><div class="av-label">Edition</div><div class="av-body av-body--s">{{ mf.edition_total }} pieces</div></div>{%- endif -%}
      {%- if mf.kara_colour != blank -%}<div class="av-row__note"><div class="av-label">Kara</div><div class="av-body av-body--s">{{ mf.kara_colour }}</div></div>{%- endif -%}
    </div>
  </div>
</section>
<script src="{{ 'product-form.js' | asset_url }}" defer="defer"></script>
{% schema %}
{ "name": "AV Product", "settings": [
  { "type": "richtext", "id": "shipping", "label": "Shipping text (overrides theme setting)" },
  { "type": "richtext", "id": "care", "label": "Default care text", "default": "<p>[Care instructions — wash, dry, store]</p>" }
] }
{% endschema %}
```

`product-form.js` expects `.loading-overlay__spinner` inside the button (it calls `classList.remove('hidden')` on it); the empty div satisfies it and the CSS hides it.

- [ ] **Step 3: `templates/product.json`**

```json
{ "sections": { "main": { "type": "av-product", "settings": {} } }, "order": ["main"] }
```

- [ ] **Step 4: Verify**

Preview a product: two-column at 1440, panel sticks while images scroll; "Order this piece" adds to cart and lands on `/cart`; set a product's inventory to 0 → "All 8 placed", notify form; WhatsApp link opens `wa.me` with the piece name (set `av_whatsapp_number` in theme settings first). At 375: media row scrolls horizontally, panel below. Theme check 0 errors.

- [ ] **Step 5: Commit**

```bash
git add sections/av-product.liquid templates/product.json assets/av-sections.css
git commit -m "feat: product page (stacked media, sticky panel, accordions, notify-me)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 8: Products page (compact list)

**Files:**
- Create: `sections/av-product-list.liquid`, `snippets/av-product-list-item.liquid`, `templates/collection.products-all.json`
- Modify: `assets/av-sections.css`

- [ ] **Step 1: CSS** — append:

```css
/* av-product-list: compact list, the one deliberate list on the site */
.av-list { padding: 0 var(--av-gutter) var(--av-section); display: flex; flex-direction: column; }
.av-list__item { display: grid; grid-template-columns: 160px minmax(0, 1fr) 160px 120px; gap: 32px; align-items: center; padding: 24px 0; border-top: 1px solid var(--av-grey-3); }
.av-list__item:last-child { border-bottom: 1px solid var(--av-grey-3); }
.av-list__item .av-media { --ratio: 4 / 5; }
.av-list__item--sold { opacity: .45; }
.av-list__name { display: flex; flex-direction: column; gap: 8px; }
.av-list__left { font-family: var(--av-font-body); font-weight: 400; font-size: 13px; color: var(--av-kumkum); }
@media (max-width: 900px) { .av-list__item { grid-template-columns: 96px minmax(0, 1fr); gap: 16px; } .av-list__left, .av-list__item .av-price { grid-column: 2; } }
```

- [ ] **Step 2: `snippets/av-product-list-item.liquid`**

```liquid
{%- liquid
  assign v = product.variants.first
  assign sold = false
  if v.inventory_management == 'shopify' and v.inventory_quantity <= 0
    assign sold = true
  endif
  assign mf = product.metafields.av
-%}
<a class="av-list__item{% if sold %} av-list__item--sold{% endif %}" href="{{ product.url }}">
  {% render 'av-media', image: product.featured_image, ratio: '4 / 5', sizes: '160px' %}
  <div class="av-list__name">
    <span class="av-label">{% if mf.drop.value != blank %}Drop {{ mf.drop.value.number.value | prepend: '00' | slice: -3, 3 }} · {% endif %}{{ mf.numeral }}{% if mf.tier != blank %} · {{ mf.tier | capitalize }}{% endif %}</span>
    <span class="av-name">{{ product.title }}</span>
  </div>
  <span class="av-list__left">{% render 'av-edition-line', product: product, context: 'tile' %}</span>
  <span class="av-price">{{ product.price | money }}</span>
</a>
```

- [ ] **Step 3: `sections/av-product-list.liquid`** — two passes, available then sold-out

```liquid
<section class="av-list av-reveal">
  {%- paginate collection.products by 50 -%}
    {%- for product in collection.products -%}
      {%- assign q = product.variants.first.inventory_quantity | default: 0 -%}
      {%- if product.variants.first.inventory_management != 'shopify' or q > 0 -%}{% render 'av-product-list-item', product: product %}{%- endif -%}
    {%- endfor -%}
    {%- for product in collection.products -%}
      {%- assign q = product.variants.first.inventory_quantity | default: 0 -%}
      {%- if product.variants.first.inventory_management == 'shopify' and q <= 0 -%}{% render 'av-product-list-item', product: product %}{%- endif -%}
    {%- endfor -%}
    {%- if paginate.pages > 1 -%}<div style="padding-top:40px">{{ paginate | default_pagination }}</div>{%- endif -%}
  {%- endpaginate -%}
</section>
{% schema %}
{ "name": "AV Product list", "settings": [] }
{% endschema %}
```

- [ ] **Step 4: `templates/collection.products-all.json`**

```json
{ "sections": { "intro": { "type": "av-page-intro", "blocks": {
  "all": { "type": "key", "settings": { "label": "All", "url": "/collections/all" } },
  "everyday": { "type": "key", "settings": { "label": "Everyday", "url": "/collections/all/everyday" } },
  "occasion": { "type": "key", "settings": { "label": "Occasion", "url": "/collections/all/occasion" } }
}, "block_order": ["all", "everyday", "occasion"], "settings": { "label": "Products", "statement": "Every piece, across the drops.", "text": "<p>Each is one of a numbered edition. A piece that has found all its wearers stays listed, at the end, as the record.</p>", "open": true } },
  "list": { "type": "av-product-list", "settings": {} } }, "order": ["intro", "list"] }
```

- [ ] **Step 5: Verify**

In admin create the automated collection `all` (title "Products", handle `all`; condition inventory stock > −1 or price > 0; sort Newest first) and assign template `products-all`. Preview `/collections/all` and `/collections/all/occasion`: list rows, tag filter narrows, sold-out rows last and faded, active tab underlined. Theme check 0 errors.

- [ ] **Step 6: Commit**

```bash
git add sections/av-product-list.liquid snippets/av-product-list-item.liquid templates/collection.products-all.json assets/av-sections.css
git commit -m "feat: Products compact list with tier filter

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Exclusive page

Reference artboard: `Exclusive.dc.html`. Sections `av-full-bleed`, `av-band` are reused by About.

**Files:**
- Create: `sections/av-full-bleed.liquid`, `sections/av-steps.liquid`, `sections/av-cards.liquid`, `sections/av-band.liquid`, `sections/av-enquiry.liquid`, `templates/page.exclusive.json`

- [ ] **Step 1: `sections/av-full-bleed.liquid`**

```liquid
<section class="av-bleed av-reveal">
  {% render 'av-media', image: section.settings.image, ratio: '1440 / 820', sizes: '100vw' %}
  {%- if section.settings.left != blank or section.settings.right != blank -%}
  <div class="av-bleed__caption av-caption"><span class="av-label">{{ section.settings.left }}</span><span class="av-label">{{ section.settings.right }}</span></div>
  {%- endif -%}
</section>
{% schema %}
{ "name": "AV Full-bleed image", "settings": [
  { "type": "image_picker", "id": "image", "label": "Image" },
  { "type": "text", "id": "left", "label": "Caption left", "default": "[Unit name], [town], Tamil Nadu" },
  { "type": "text", "id": "right", "label": "Caption right", "default": "Photograph · [credit]" }
], "presets": [{ "name": "AV Full-bleed image" }] }
{% endschema %}
```

- [ ] **Step 2: `sections/av-steps.liquid`**

```liquid
<section class="av-steps av-reveal">
  <div class="av-people__head">
    <div class="av-stack" style="gap:12px"><div class="av-label">{{ section.settings.label }}</div><h2 class="av-sub av-sub--m">{{ section.settings.heading }}</h2></div>
    <div class="av-body" style="max-width:560px">{{ section.settings.text }}</div>
  </div>
  <div class="av-steps__grid">
    {%- for block in section.blocks -%}
      <div class="av-step" {{ block.shopify_attributes }}>
        <div class="av-step__num">{{ block.settings.numeral }}</div>
        <div class="av-sub av-sub--xs">{{ block.settings.title }}</div>
        <div class="av-body av-body--s">{{ block.settings.text }}</div>
      </div>
    {%- endfor -%}
  </div>
</section>
{% schema %}
{ "name": "AV Steps", "max_blocks": 4, "settings": [
  { "type": "text", "id": "label", "label": "Label", "default": "How it works" },
  { "type": "text", "id": "heading", "label": "Heading", "default": "Four steps, [Y] weeks" },
  { "type": "textarea", "id": "text", "label": "Paragraph", "default": "There is no configurator. Each piece is agreed in conversation, then woven, then fitted. The timings below are honest and will not be shortened for a date." }
], "blocks": [ { "type": "step", "name": "Step", "settings": [ { "type": "text", "id": "numeral", "label": "Numeral", "default": "I" }, { "type": "text", "id": "title", "label": "Title" }, { "type": "textarea", "id": "text", "label": "Text" } ] } ],
"presets": [ { "name": "AV Steps", "blocks": [
  { "type": "step", "settings": { "numeral": "I", "title": "The conversation", "text": "Write to us with the occasion and the date. Kamalam replies within [n] days and, if the dates allow, a call is set. Tamil or English." } },
  { "type": "step", "settings": { "numeral": "II", "title": "Cloth and motif", "text": "Together you settle the cloth, the border, the motif and the colour from the kara set. A sample of the border is woven and sent before anything is committed." } },
  { "type": "step", "settings": { "numeral": "III", "title": "The loom", "text": "The veshti is woven by a named weaver at the unit. The kurta or shirt is cut to your measure. You are told when the warp goes on." } },
  { "type": "step", "settings": { "numeral": "IV", "title": "Fitting and delivery", "text": "One fitting, in [city] or by measurement. Delivered by hand within Tamil Nadu; insured courier elsewhere. The piece carries the weaver's name and yours." } }
] } ] }
{% endschema %}
```

- [ ] **Step 3: `sections/av-cards.liquid`**

```liquid
<section class="av-cards av-reveal">
  {%- for block in section.blocks -%}
    <div class="av-card" {{ block.shopify_attributes }}>
      {% render 'av-media', image: block.settings.image, ratio: '1 / 1', sizes: '(min-width: 900px) 50vw, 100vw' %}
      <div class="av-sub av-sub--s">{{ block.settings.title }}</div>
      <div class="av-body av-body--s">{{ block.settings.text }}</div>
      {%- if block.settings.link_label != blank -%}<a class="av-link" href="{{ block.settings.link | default: '#av-enquiry' }}">{{ block.settings.link_label }}</a>{%- endif -%}
    </div>
  {%- endfor -%}
</section>
{% schema %}
{ "name": "AV Cards (two)", "max_blocks": 2, "settings": [], "blocks": [ { "type": "card", "name": "Card", "settings": [
  { "type": "image_picker", "id": "image", "label": "Image" }, { "type": "text", "id": "title", "label": "Title" }, { "type": "textarea", "id": "text", "label": "Text" }, { "type": "text", "id": "link_label", "label": "Link label", "default": "Enquire" }, { "type": "url", "id": "link", "label": "Link" } ] } ],
"presets": [ { "name": "AV Cards (two)", "blocks": [
  { "type": "card", "settings": { "title": "The wedding set", "text": "Veshti, kurta and angavastram as one piece. Gold or tested zari, motifs drawn for the family. [Lead time] weeks. From ₹ [PRICE]." } },
  { "type": "card", "settings": { "title": "[Second category]", "text": "[What it is, who it is for, what is decided together. Lead time and starting price.]" } } ] } ] }
{% endschema %}
```

- [ ] **Step 4: `sections/av-band.liquid`** — red band; `mode` list (01–04, About) or grid (terms, Exclusive)

```liquid
<section class="av-band av-reveal">
  <div class="av-stack" style="gap:12px">
    {%- if section.settings.numeral != blank -%}<div class="av-numeral" style="color:var(--av-ivory);opacity:.7">{{ section.settings.numeral }}</div>{%- else -%}<div class="av-label">{{ section.settings.label }}</div>{%- endif -%}
    <h2 class="av-sub av-sub--m">{{ section.settings.heading }}</h2>
  </div>
  {%- if section.settings.mode == 'list' -%}
    <div class="av-band__list">
      {%- for block in section.blocks -%}
        <div class="av-band__item" {{ block.shopify_attributes }}><div class="av-band__num">{{ forloop.index | prepend: '0' | slice: -2, 2 }}</div><div class="av-stack" style="gap:8px"><div class="av-sub av-sub--xs">{{ block.settings.title }}</div><div class="av-body">{{ block.settings.text }}</div></div></div>
      {%- endfor -%}
    </div>
  {%- else -%}
    <div class="av-band__grid">
      {%- for block in section.blocks -%}
        <div class="av-band__cell" {{ block.shopify_attributes }}><div class="av-label">{{ block.settings.title }}</div><div class="av-body">{{ block.settings.text }}</div></div>
      {%- endfor -%}
    </div>
  {%- endif -%}
</section>
{% schema %}
{ "name": "AV Red band", "settings": [
  { "type": "select", "id": "mode", "label": "Layout", "options": [ { "value": "grid", "label": "Grid of terms" }, { "value": "list", "label": "Numbered list" } ], "default": "grid" },
  { "type": "text", "id": "label", "label": "Label", "default": "Terms" },
  { "type": "text", "id": "numeral", "label": "Chapter numeral (About IV) — replaces label" },
  { "type": "text", "id": "heading", "label": "Heading", "default": "What is agreed before the warp goes on" }
], "blocks": [ { "type": "item", "name": "Item", "settings": [ { "type": "text", "id": "title", "label": "Title" }, { "type": "textarea", "id": "text", "label": "Text" } ] } ],
"presets": [ { "name": "AV Red band", "blocks": [
  { "type": "item", "settings": { "title": "Capacity", "text": "[X] pieces a season. Dates are taken in order of the first conversation." } },
  { "type": "item", "settings": { "title": "Deposit", "text": "[Deposit terms] on agreement of cloth and motif; balance at fitting." } },
  { "type": "item", "settings": { "title": "Lead time", "text": "[Y] weeks from sample approval. Wedding dates inside that window cannot be taken." } },
  { "type": "item", "settings": { "title": "Price", "text": "Quoted once, in writing, after step II. It does not change, and it is never discounted." } } ] } ] }
{% endschema %}
```

- [ ] **Step 5: `sections/av-enquiry.liquid`**

```liquid
<section class="av-enquiry av-reveal" id="av-enquiry">
  <div class="av-stack">
    <div class="av-label">{{ section.settings.label }}</div>
    <h2 class="av-sub av-sub--m">{{ section.settings.heading }}</h2>
    <div class="av-body">{{ section.settings.text }}</div>
    {% render 'av-whatsapp-link', label: 'WhatsApp', text: 'An enquiry for a piece made to order' %}
  </div>
  {%- form 'contact', id: 'av-enquiry-form', class: 'av-form' -%}
    <input type="hidden" name="contact[subject]" value="Exclusive enquiry">
    {%- if form.posted_successfully? -%}
      <div class="av-field--wide av-body">Received. Kamalam replies within {{ section.settings.reply_days }} days.</div>
    {%- else -%}
      {%- if form.errors -%}<div class="av-field--wide av-body av-body--s">{{ form.errors | default_errors }}</div>{%- endif -%}
      <div class="av-field"><label class="av-label" for="enq-name">Name</label><input id="enq-name" type="text" name="contact[name]" placeholder="Your name" required></div>
      <div class="av-field"><label class="av-label" for="enq-email">Email or phone</label><input id="enq-email" type="email" name="contact[email]" placeholder="So we can reply" required></div>
      <div class="av-field"><label class="av-label" for="enq-occasion">The occasion</label><input id="enq-occasion" type="text" name="contact[occasion]" placeholder="Wedding · other"></div>
      <div class="av-field"><label class="av-label" for="enq-date">The date</label><input id="enq-date" type="text" name="contact[date]" placeholder="When it is needed by"></div>
      <div class="av-field"><label class="av-label" for="enq-city">City</label><input id="enq-city" type="text" name="contact[city]" placeholder="Where the fitting would be"></div>
      <div class="av-field"><label class="av-label" for="enq-lang">Language</label><select id="enq-lang" name="contact[language]"><option>Tamil</option><option>English</option></select></div>
      <div class="av-field av-field--wide"><label class="av-label" for="enq-notes">A few lines</label><textarea id="enq-notes" name="contact[body]" placeholder="What you have in mind — a border you remember, a colour, a family motif"></textarea></div>
      <div class="av-form__foot"><span class="av-label">Kamalam replies within {{ section.settings.reply_days }} days</span><button class="av-button" type="submit">Send</button></div>
    {%- endif -%}
  {%- endform -%}
</section>
{% schema %}
{ "name": "AV Enquiry form", "settings": [
  { "type": "text", "id": "label", "label": "Label", "default": "Begin" },
  { "type": "text", "id": "heading", "label": "Heading", "default": "Write to Kamalam" },
  { "type": "textarea", "id": "text", "label": "Text", "default": "Three lines are enough: the occasion, the date, and where you are. Or send the same on WhatsApp." },
  { "type": "text", "id": "reply_days", "label": "Reply time (days)", "default": "[n]" }
], "presets": [{ "name": "AV Enquiry form" }] }
{% endschema %}
```

Note: Shopify's contact form requires `contact[email]`; the "email or phone" field is therefore `type=email` — a phone goes in the notes. Say so in the placeholder if the client objects later.

- [ ] **Step 6: `templates/page.exclusive.json`**

```json
{ "sections": {
  "intro": { "type": "av-page-intro", "blocks": { "k1": { "type": "key", "settings": { "label": "Wedding sets" } }, "k2": { "type": "key", "settings": { "label": "[Second category]" } } }, "block_order": ["k1", "k2"], "settings": { "label": "Exclusive", "statement": "One piece, for one person, made once.", "text": "<p>Outside the numbered drops, the house makes single pieces to the wearer — wedding sets above all. Nothing here is listed or held in stock. It begins with a conversation with Kamalam and ends at the loom.</p>", "open": true } },
  "exemplar": { "type": "av-full-bleed", "settings": { "left": "The groom set · made for [wearer], [occasion, year]", "right": "Woven by [weaver] · [loom hours] hours · gold zari" } },
  "steps": { "type": "av-steps", "blocks": { "s1": { "type": "step", "settings": { "numeral": "I", "title": "The conversation", "text": "Write to us with the occasion and the date. Kamalam replies within [n] days and, if the dates allow, a call is set. Tamil or English." } }, "s2": { "type": "step", "settings": { "numeral": "II", "title": "Cloth and motif", "text": "Together you settle the cloth, the border, the motif and the colour from the kara set. A sample of the border is woven and sent before anything is committed." } }, "s3": { "type": "step", "settings": { "numeral": "III", "title": "The loom", "text": "The veshti is woven by a named weaver at the unit. The kurta or shirt is cut to your measure. You are told when the warp goes on." } }, "s4": { "type": "step", "settings": { "numeral": "IV", "title": "Fitting and delivery", "text": "One fitting, in [city] or by measurement. Delivered by hand within Tamil Nadu; insured courier elsewhere. The piece carries the weaver's name and yours." } } }, "block_order": ["s1", "s2", "s3", "s4"], "settings": {} },
  "cards": { "type": "av-cards", "blocks": { "c1": { "type": "card", "settings": { "title": "The wedding set", "text": "Veshti, kurta and angavastram as one piece. Gold or tested zari, motifs drawn for the family. [Lead time] weeks. From ₹ [PRICE]." } }, "c2": { "type": "card", "settings": { "title": "[Second category]", "text": "[What it is, who it is for, what is decided together. Lead time and starting price.]" } } }, "block_order": ["c1", "c2"], "settings": {} },
  "terms": { "type": "av-band", "blocks": { "t1": { "type": "item", "settings": { "title": "Capacity", "text": "[X] pieces a season. Dates are taken in order of the first conversation." } }, "t2": { "type": "item", "settings": { "title": "Deposit", "text": "[Deposit terms] on agreement of cloth and motif; balance at fitting." } }, "t3": { "type": "item", "settings": { "title": "Lead time", "text": "[Y] weeks from sample approval. Wedding dates inside that window cannot be taken." } }, "t4": { "type": "item", "settings": { "title": "Price", "text": "Quoted once, in writing, after step II. It does not change, and it is never discounted." } } }, "block_order": ["t1", "t2", "t3", "t4"], "settings": { "mode": "grid", "label": "Terms", "heading": "What is agreed before the warp goes on" } },
  "enquiry": { "type": "av-enquiry", "settings": {} }
}, "order": ["intro", "exemplar", "steps", "cards", "terms", "enquiry"] }
```

- [ ] **Step 7: Verify**

Create page "Exclusive" (handle `exclusive`) with template `page.exclusive`. Preview: matches the artboard order; submit the form with a test email → success message; check the store receives the contact email (Settings → Notifications sender). Theme check 0 errors.

- [ ] **Step 8: Commit**

```bash
git add sections/av-full-bleed.liquid sections/av-steps.liquid sections/av-cards.liquid sections/av-band.liquid sections/av-enquiry.liquid templates/page.exclusive.json
git commit -m "feat: Exclusive page (steps, cards, terms band, enquiry form)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 10: Stories (blog) and article

Reference artboard: `Stories.dc.html`.

**Files:**
- Create: `sections/av-featured-article.liquid`, `sections/av-tabs.liquid`, `sections/av-posts.liquid`, `sections/av-earlier.liquid`, `sections/av-newsletter-line.liquid`, `sections/av-article.liquid`
- Rewrite: `templates/blog.json`, `templates/article.json`

- [ ] **Step 1: Article metafields (admin)** — Articles: `av.read_time` (integer), `av.video` (file). Blog handle must be `stories`. Tags on articles: `weavers`, `embroidery`, `motifs-and-design`, `the-house`.

- [ ] **Step 2: `sections/av-featured-article.liquid`**

```liquid
{%- liquid
  assign article = section.settings.article | default: blog.articles.first
-%}
{%- if article != blank and current_tags == blank and current_page == 1 -%}
<section class="av-featured">
  <a href="{{ article.url }}">{% render 'av-media', image: article.image, ratio: '1440 / 760', sizes: '100vw', loading: 'eager' %}</a>
  <div class="av-featured__text">
    <div class="av-stack" style="gap:20px">
      <div class="av-meta"><span class="av-label av-label--red">{{ article.tags.first | replace: '-', ' ' | capitalize }}</span><span class="av-label">{{ article.published_at | date: '%B %Y' }}</span>{% if article.metafields.av.read_time != blank %}<span class="av-label">{{ article.metafields.av.read_time }} min</span>{% endif %}</div>
      <h1 class="av-statement av-statement--l"><a href="{{ article.url }}">{{ article.title }}</a></h1>
    </div>
    <div class="av-stack">
      <div class="av-body">{{ article.excerpt_or_content | strip_html | truncatewords: 45 }}</div>
      <a class="av-link" href="{{ article.url }}">Read the story</a>
    </div>
  </div>
</section>
{%- endif -%}
{% schema %}
{ "name": "AV Featured story", "settings": [ { "type": "article", "id": "article", "label": "Featured article (default: newest)" } ] }
{% endschema %}
```

- [ ] **Step 3: `sections/av-tabs.liquid`**

```liquid
<div class="av-tabs">
  <div class="av-tabs__list">
    <a href="{{ blog.url }}"{% if current_tags == blank %} class="is-active"{% endif %}>All</a>
    {%- for block in section.blocks -%}
      <a href="{{ blog.url }}/tagged/{{ block.settings.tag }}"{% if current_tags contains block.settings.tag %} class="is-active"{% endif %} {{ block.shopify_attributes }}>{{ block.settings.label }}</a>
    {%- endfor -%}
  </div>
  <span class="av-label">{{ blog.articles_count }} stories</span>
</div>
{% schema %}
{ "name": "AV Story tabs", "blocks": [ { "type": "tab", "name": "Tab", "settings": [ { "type": "text", "id": "label", "label": "Label" }, { "type": "text", "id": "tag", "label": "Article tag (handle)" } ] } ], "settings": [] }
{% endschema %}
```

- [ ] **Step 4: `sections/av-posts.liquid`** and **`sections/av-earlier.liquid`**

Posts:
```liquid
{%- liquid
  assign featured = section.settings.featured_article | default: blog.articles.first
-%}
<section class="av-posts">
  {%- paginate blog.articles by 7 -%}
    {%- assign shown = 0 -%}
    {%- assign first_page = false -%}
    {%- if current_tags == blank and paginate.current_page == 1 %}{% assign first_page = true %}{% endif -%}
    {%- for article in blog.articles -%}
      {%- if first_page and article.id == featured.id %}{% continue %}{% endif -%}
      {%- if first_page and shown >= 6 %}{% break %}{% endif -%}
      {%- assign shown = shown | plus: 1 -%}
      <article class="av-post av-reveal">
        <div class="av-post__media">
          {%- if article.metafields.av.video != blank -%}
            {% render 'av-video', loop_video: article.metafields.av.video.value, poster: article.image, class: 'av-post__video' %}
          {%- else -%}
            <a href="{{ article.url }}">{% render 'av-media', image: article.image, ratio: '600 / 520', sizes: '(min-width: 900px) 50vw, 100vw' %}</a>
          {%- endif -%}
        </div>
        <div class="av-post__text">
          <div class="av-meta"><span class="av-label av-label--red">{{ article.tags.first | replace: '-', ' ' | capitalize }}</span><span class="av-label">{{ article.published_at | date: '%B %Y' }}</span>{% if article.metafields.av.read_time != blank %}<span class="av-label">{{ article.metafields.av.read_time }} min</span>{% endif %}</div>
          <h2 class="av-sub av-sub--m"><a href="{{ article.url }}">{{ article.title }}</a></h2>
          <div class="av-body">{{ article.excerpt_or_content | strip_html | truncatewords: 40 }}</div>
          <a class="av-link" href="{{ article.url }}">Read</a>
        </div>
      </article>
    {%- endfor -%}
    {%- if paginate.pages > 1 -%}<div style="padding:40px 0">{{ paginate | default_pagination }}</div>{%- endif -%}
  {%- endpaginate -%}
</section>
{% schema %}
{ "name": "AV Story rows", "settings": [ { "type": "article", "id": "featured_article", "label": "Featured article to skip (match the featured section)" } ] }
{% endschema %}
```

Earlier (hidden on tag pages; shows articles 8–10):
```liquid
{%- if current_tags == blank and blog.articles_count > 7 -%}
<section class="av-earlier av-reveal">
  <div class="av-earlier__head"><h2 class="av-sub av-sub--s">Earlier</h2><a class="av-link" href="{{ blog.url }}?page=2">All stories</a></div>
  <div class="av-grid av-grid--3">
    {%- for article in blog.articles offset: 7 limit: 3 -%}
      <a class="av-earlier__item" href="{{ article.url }}">
        {% render 'av-media', image: article.image, ratio: '4 / 3', sizes: '(min-width: 900px) 33vw, 100vw' %}
        <div class="av-meta"><span class="av-label av-label--red">{{ article.tags.first | replace: '-', ' ' | capitalize }}</span><span class="av-label">{{ article.published_at | date: '%B %Y' }}</span></div>
        <div class="av-sub av-sub--xs">{{ article.title }}</div>
      </a>
    {%- endfor -%}
  </div>
</section>
{%- endif -%}
{% schema %}
{ "name": "AV Earlier stories", "settings": [] }
{% endschema %}
```

`blog.articles` is capped at 50 outside `paginate`; the `offset: 7 limit: 3` loop reads within that cap. "All stories" links to page 2 of the paginated list, which is `/blogs/stories?page=2` — acceptable. Pagination is a literal 7 everywhere (page 1 untagged shows 6 because the featured article is skipped; tag pages and later pages show 7) — a literal keeps Theme Check's `PaginationSize` rule quiet.

- [ ] **Step 5: `sections/av-newsletter-line.liquid`**

```liquid
<section class="av-newsline av-reveal">
  <h2 class="av-statement av-statement--m">{{ section.settings.statement }}</h2>
  {% render 'av-newsletter-form', id: 'stories', placeholder: 'Your email', class: '' %}
</section>
{% schema %}
{ "name": "AV Newsletter line", "settings": [ { "type": "text", "id": "statement", "label": "Statement", "default": "One story a month, by letter." } ], "presets": [{ "name": "AV Newsletter line" }] }
{% endschema %}
```

- [ ] **Step 6: `sections/av-article.liquid`**

```liquid
<article class="av-article">
  <div class="av-article__body">
    <div class="av-meta"><span class="av-label av-label--red">{{ article.tags.first | replace: '-', ' ' | capitalize }}</span><span class="av-label">{{ article.published_at | date: '%-d %B %Y' }}</span>{% if article.metafields.av.read_time != blank %}<span class="av-label">{{ article.metafields.av.read_time }} min</span>{% endif %}</div>
    <h1 class="av-statement av-statement--l">{{ article.title }}</h1>
    {%- if article.metafields.av.video != blank -%}
      {% render 'av-video', loop_video: article.metafields.av.video.value, poster: article.image %}
    {%- elsif article.image != blank -%}
      {% render 'av-media', image: article.image, ratio: '16 / 10', sizes: '(min-width: 900px) 66vw, 100vw', loading: 'eager' %}
    {%- endif -%}
    <div class="av-body rte">{{ article.content }}</div>
    <a class="av-link" href="{{ blog.url }}">All stories</a>
  </div>
</article>
{% schema %}
{ "name": "AV Article", "settings": [] }
{% endschema %}
```

- [ ] **Step 7: Templates**

`templates/blog.json`:
```json
{ "sections": { "featured": { "type": "av-featured-article", "settings": {} }, "tabs": { "type": "av-tabs", "blocks": { "t1": { "type": "tab", "settings": { "label": "Weavers", "tag": "weavers" } }, "t2": { "type": "tab", "settings": { "label": "Embroidery", "tag": "embroidery" } }, "t3": { "type": "tab", "settings": { "label": "Motifs and design", "tag": "motifs-and-design" } }, "t4": { "type": "tab", "settings": { "label": "The house", "tag": "the-house" } } }, "block_order": ["t1", "t2", "t3", "t4"], "settings": {} }, "posts": { "type": "av-posts", "settings": {} }, "earlier": { "type": "av-earlier", "settings": {} }, "news": { "type": "av-newsletter-line", "settings": {} } }, "order": ["featured", "tabs", "posts", "earlier", "news"] }
```

`templates/article.json`:
```json
{ "sections": { "main": { "type": "av-article", "settings": {} } }, "order": ["main"] }
```

- [ ] **Step 8: Verify**

Create blog `stories` with 3+ articles tagged and one with `av.video`. `/blogs/stories`: featured full-width, tabs, alternating rows, newsletter line; `/blogs/stories/tagged/weavers`: no featured, filtered rows; article page 2/8/2 with 18px body. Theme check 0 errors.

- [ ] **Step 9: Commit**

```bash
git add sections/av-featured-article.liquid sections/av-tabs.liquid sections/av-posts.liquid sections/av-earlier.liquid sections/av-newsletter-line.liquid sections/av-article.liquid templates/blog.json templates/article.json
git commit -m "feat: Stories journal and article templates

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: About and Gallery

Reference artboards: `About.dc.html`, `Gallery.dc.html`.

**Files:**
- Create: `sections/av-video-block.liquid`, `sections/av-chapter.liquid`, `sections/av-video-pair.liquid`, `sections/av-chapter-split.liquid`, `sections/av-people-grid.liquid`, `sections/av-routes.liquid`, `sections/av-campaign.liquid`
- Create: `templates/page.about.json`, `templates/page.gallery.json`

- [ ] **Step 1: `sections/av-video-block.liquid`**

```liquid
<section class="av-video-block av-reveal">
  <div class="av-video-block__head"><div class="av-sub av-sub--s">{{ section.settings.title }}</div><div class="av-label">{{ section.settings.meta }}</div></div>
  {% render 'av-video', loop_video: section.settings.loop, film: section.settings.film, poster: section.settings.poster %}
</section>
{% schema %}
{ "name": "AV Video block", "settings": [
  { "type": "text", "id": "title", "label": "Title", "default": "The drop film" },
  { "type": "text", "id": "meta", "label": "Meta", "default": "Loom · hands · weaver voice in Tamil, subtitled · plays muted, sound on tap" },
  { "type": "video", "id": "loop", "label": "Muted loop" }, { "type": "video", "id": "film", "label": "Full film (sound on tap)" }, { "type": "image_picker", "id": "poster", "label": "Poster" }
], "presets": [{ "name": "AV Video block" }] }
{% endschema %}
```

- [ ] **Step 2: `sections/av-chapter.liquid`** (3/2/6 columns)

```liquid
<section class="av-chapter av-reveal">
  <div class="av-stack" style="gap:12px"><div class="av-numeral">{{ section.settings.numeral }}</div><h2 class="av-sub av-sub--m">{{ section.settings.title }}</h2></div>
  <div></div>
  <div class="av-chapter__text"><div class="av-body">{{ section.settings.text }}</div>{% if section.settings.link_label != blank %}<a class="av-link" href="{{ section.settings.link }}">{{ section.settings.link_label }}</a>{% endif %}</div>
</section>
{% schema %}
{ "name": "AV Chapter", "settings": [
  { "type": "text", "id": "numeral", "label": "Numeral", "default": "I" }, { "type": "text", "id": "title", "label": "Title", "default": "The loom decides first" },
  { "type": "richtext", "id": "text", "label": "Paragraphs", "default": "<p>[Paragraph — the veshti as a plain length of cloth: width, border, the kara.]</p><p>[Paragraph — yarn and dye.]</p><p>[Paragraph — time: loom hours per piece.]</p>" },
  { "type": "text", "id": "link_label", "label": "Link label", "default": "The craft, in detail" }, { "type": "url", "id": "link", "label": "Link" }
], "presets": [{ "name": "AV Chapter" }] }
{% endschema %}
```

- [ ] **Step 3: `sections/av-video-pair.liquid`**

```liquid
<section class="av-video-pair av-reveal">
  {%- for block in section.blocks -%}
    <div class="av-stack" style="gap:14px" {{ block.shopify_attributes }}>{% render 'av-video', loop_video: block.settings.loop, poster: block.settings.poster %}<div class="av-label">{{ block.settings.caption }}</div></div>
  {%- endfor -%}
</section>
{% schema %}
{ "name": "AV Video pair", "max_blocks": 2, "settings": [], "blocks": [ { "type": "clip", "name": "Clip", "settings": [ { "type": "video", "id": "loop", "label": "Silent loop" }, { "type": "image_picker", "id": "poster", "label": "Poster" }, { "type": "text", "id": "caption", "label": "Caption", "default": "Archive · the shuttle, one pass" } ] } ],
"presets": [ { "name": "AV Video pair", "blocks": [ { "type": "clip", "settings": { "caption": "Archive · the shuttle, one pass" } }, { "type": "clip", "settings": { "caption": "Archive · the kara, in gold" } } ] } ] }
{% endschema %}
```

- [ ] **Step 4: `sections/av-chapter-split.liquid`** (Kamalam)

```liquid
<section class="av-chapter av-chapter--split av-reveal">
  {% render 'av-media', image: section.settings.portrait, ratio: '600 / 880', sizes: '(min-width: 900px) 42vw, 100vw' %}
  <div class="av-chapter__text">
    <div class="av-stack" style="gap:12px"><div class="av-numeral">{{ section.settings.numeral }}</div><h2 class="av-sub av-sub--m">{{ section.settings.title }}</h2><div class="av-label">{{ section.settings.role }}</div></div>
    {%- if section.settings.quote != blank -%}<blockquote class="av-quote" style="margin:0">“{{ section.settings.quote }}”</blockquote>{%- endif -%}
    <div class="av-body">{{ section.settings.text }}</div>
    {%- if section.settings.film != blank or section.settings.poster != blank -%}
    <div class="av-stack" style="gap:12px;margin-top:12px">{% render 'av-video', loop_video: section.settings.film, poster: section.settings.poster %}<div class="av-label">{{ section.settings.video_caption }}</div></div>
    {%- endif -%}
  </div>
</section>
{% schema %}
{ "name": "AV Chapter split", "settings": [
  { "type": "image_picker", "id": "portrait", "label": "Portrait" },
  { "type": "text", "id": "numeral", "label": "Numeral", "default": "II" }, { "type": "text", "id": "title", "label": "Name", "default": "Kamalam Moorthy" },
  { "type": "text", "id": "role", "label": "Role line", "default": "Chief designer · Head of production · Weaver" },
  { "type": "textarea", "id": "quote", "label": "Pull quote", "default": "[A line from Kamalam, in her words, from the founder interview — about the cloth, not the brand.]" },
  { "type": "richtext", "id": "text", "label": "Paragraphs", "default": "<p>[Paragraph — who she is, how long she has woven, the unit she runs.]</p><p>[Paragraph — what she will not do.]</p>" },
  { "type": "video", "id": "film", "label": "Interview video" }, { "type": "image_picker", "id": "poster", "label": "Video poster" },
  { "type": "text", "id": "video_caption", "label": "Video caption", "default": "In her words · from the founder interview" }
], "presets": [{ "name": "AV Chapter split" }] }
{% endschema %}
```

- [ ] **Step 5: `sections/av-people-grid.liquid`** — from `weaver` metaobjects picked per block

```liquid
<section class="av-people av-reveal">
  <div class="av-people__head">
    <div class="av-stack" style="gap:12px"><div class="av-numeral">{{ section.settings.numeral }}</div><h2 class="av-sub av-sub--m">{{ section.settings.title }}</h2></div>
    <div class="av-body" style="max-width:560px">{{ section.settings.text }}</div>
  </div>
  <div class="av-grid av-grid--4">
    {%- for block in section.blocks -%}
      {%- assign w = block.settings.weaver -%}
      <div class="av-person" {{ block.shopify_attributes }}>
        {% render 'av-media', image: w.portrait.value, ratio: '1 / 1.2', sizes: '(min-width: 900px) 25vw, 100vw' %}
        <div class="av-sub av-sub--xs">{{ w.name | default: '[Weaver name]' }}</div>
        <div class="av-label">{{ w.role | default: '[Role]' }}{% if w.years != blank %} · {{ w.years }} years at the loom{% endif %}</div>
      </div>
    {%- endfor -%}
  </div>
</section>
{% schema %}
{ "name": "AV People grid", "max_blocks": 4, "settings": [
  { "type": "text", "id": "numeral", "label": "Numeral", "default": "III" }, { "type": "text", "id": "title", "label": "Title", "default": "Every piece carries a name" },
  { "type": "textarea", "id": "text", "label": "Text", "default": "The weaver's name is woven into the label and printed on the page. It is not a credit. It is the record of who made the cloth, kept where the buyer can see it." }
], "blocks": [ { "type": "person", "name": "Person", "settings": [ { "type": "metaobject", "metaobject_type": "weaver", "id": "weaver", "label": "Weaver" } ] } ],
"presets": [ { "name": "AV People grid", "blocks": [ { "type": "person" }, { "type": "person" }, { "type": "person" }, { "type": "person" } ] } ] }
{% endschema %}
```

- [ ] **Step 6: `sections/av-routes.liquid`** (closing image pair + three routes)

```liquid
<section class="av-reveal">
  <div class="av-wrap av-grid av-grid--7-5" style="align-items:end;gap:24px;padding-top:var(--av-section)">
    {% render 'av-media', image: section.settings.image_left, ratio: '820 / 640', sizes: '(min-width: 900px) 58vw, 100vw' %}
    {% render 'av-media', image: section.settings.image_right, ratio: '560 / 480', sizes: '(min-width: 900px) 42vw, 100vw' %}
  </div>
  <div class="av-routes">
    {%- for block in section.blocks -%}
      <div class="av-route" {{ block.shopify_attributes }}><div class="av-label">{{ block.settings.label }}</div><div class="av-sub av-sub--s">{{ block.settings.title }}</div><a class="av-link" href="{{ block.settings.url }}">{{ block.settings.link_label }}</a></div>
    {%- endfor -%}
  </div>
</section>
{% schema %}
{ "name": "AV Routes", "max_blocks": 3, "settings": [ { "type": "image_picker", "id": "image_left", "label": "Left image" }, { "type": "image_picker", "id": "image_right", "label": "Right image" } ],
"blocks": [ { "type": "route", "name": "Route", "settings": [ { "type": "text", "id": "label", "label": "Label" }, { "type": "text", "id": "title", "label": "Title" }, { "type": "text", "id": "link_label", "label": "Link label" }, { "type": "url", "id": "url", "label": "URL" } ] } ],
"presets": [ { "name": "AV Routes", "blocks": [ { "type": "route", "settings": { "label": "Read", "title": "Stories from the unit", "link_label": "Stories" } }, { "type": "route", "settings": { "label": "See", "title": "The pieces, on the people who wear them", "link_label": "Gallery" } }, { "type": "route", "settings": { "label": "Write", "title": "A conversation with Kamalam, for a piece made to you", "link_label": "Exclusive" } } ] } ] }
{% endschema %}
```

- [ ] **Step 7: `sections/av-campaign.liquid`** — one campaign metaobject; grid then credits

```liquid
{%- liquid
  assign c = section.settings.campaign
  assign imgs = c.images.value
-%}
{%- if c != blank -%}
<section class="av-campaign av-reveal">
  {%- if imgs.size > 0 -%}
  <div class="av-campaign__lead">
    {% render 'av-media', image: imgs[0], ratio: '920 / 900', sizes: '(min-width: 900px) 66vw, 100vw' %}
    <div class="av-campaign__stack">{% render 'av-media', image: imgs[1], ratio: '440 / 438', sizes: '33vw' %}{% render 'av-media', image: imgs[2], ratio: '440 / 438', sizes: '33vw' %}</div>
  </div>
  {%- endif -%}
  <div class="av-campaign__head">
    <div class="av-stack" style="gap:20px">
      <div class="av-label">{{ section.settings.label }}{% if c.season != blank %} · {{ c.season }}{% endif %}</div>
      <h2 class="av-sub av-sub--m">{{ c.title }}</h2>
      <div class="av-credits">
        {%- if c.photographer != blank -%}<div class="av-credit"><span class="av-label">Photographs</span><span class="av-credit__v">{{ c.photographer }}</span></div>{%- endif -%}
        {%- if c.wearers != blank -%}<div class="av-credit"><span class="av-label">Wearers</span><span class="av-credit__v">{{ c.wearers }} — named with consent</span></div>{%- endif -%}
        {%- if c.location != blank -%}<div class="av-credit"><span class="av-label">Location</span><span class="av-credit__v">{{ c.location }}</span></div>{%- endif -%}
        {%- if c.pieces.value.size > 0 -%}<div class="av-credit"><span class="av-label">Pieces</span><span class="av-credit__v">{% for p in c.pieces.value %}{{ p.title }}{% unless forloop.last %} · {% endunless %}{% endfor %}</span></div>{%- endif -%}
      </div>
    </div>
    <div class="av-body" style="max-width:600px">{{ c.story | newline_to_br }}</div>
  </div>
  {%- if imgs.size > 3 -%}
  <div class="av-grid av-grid--3 av-campaign__row3">{% for i in (3..5) %}{% if imgs[i] != blank %}{% render 'av-media', image: imgs[i], ratio: '4 / 5', sizes: '33vw' %}{% endif %}{% endfor %}</div>
  {%- endif -%}
  {%- if imgs.size > 6 or c.film != blank -%}
  <div class="av-grid av-grid--4-8">{% render 'av-media', image: imgs[6], ratio: '480 / 520', sizes: '33vw' %}{% if c.film != blank %}{% render 'av-video', loop_video: c.film.value, poster: imgs[7] %}{% else %}{% render 'av-media', image: imgs[7], ratio: '920 / 520', sizes: '66vw' %}{% endif %}</div>
  {%- endif -%}
  {%- if section.settings.archive_label != blank -%}
  <div class="av-earlier__head" style="padding-top:40px;border-top:1px solid var(--av-kumkum)"><span class="av-sub av-sub--s">Earlier campaigns</span><a class="av-link" href="{{ section.settings.archive_url }}">{{ section.settings.archive_label }}</a></div>
  {%- endif -%}
</section>
{%- endif -%}
{% schema %}
{ "name": "AV Campaign", "settings": [
  { "type": "metaobject", "metaobject_type": "campaign", "id": "campaign", "label": "Campaign" },
  { "type": "text", "id": "label", "label": "Label", "default": "Campaign 001" },
  { "type": "text", "id": "archive_label", "label": "Archive link label (last campaign only)" }, { "type": "url", "id": "archive_url", "label": "Archive URL" }
], "presets": [{ "name": "AV Campaign" }] }
{% endschema %}
```

Add `story` (multi-line) to the `campaign` metaobject definition alongside the spec's fields.

- [ ] **Step 8: Templates**

`templates/page.about.json`:

```json
{ "sections": {
  "intro": { "type": "av-page-intro", "settings": { "label": "About the house", "statement": "Cloth without end.", "text": "<p>Ananta means without end. Vastram means cloth. The name is a description of the work: a length of handwoven cloth with no seam, made on a loom that has been running in [town] for [how long], by weavers whose names we print on every piece.</p>", "note": "Ananta Vastram is a menswear house from Tamil Nadu. We make veshtis and the garments worn with them, in numbered editions, to order.", "large_body": true, "open": true } },
  "place": { "type": "av-full-bleed", "settings": { "left": "[Unit name], [town], Tamil Nadu", "right": "Photograph · [credit]" } },
  "film": { "type": "av-video-block", "settings": { "title": "The drop film", "meta": "Loom · hands · weaver voice in Tamil, subtitled · plays muted, sound on tap" } },
  "ch1": { "type": "av-chapter", "settings": { "numeral": "I", "title": "The loom decides first", "text": "<p>[Paragraph — the veshti as a plain length of cloth: width, border, the kara. What is fixed before a thread is thrown, and by whom.]</p><p>[Paragraph — yarn and dye: cotton count or silk grade, the zari, where the dye comes from. What we changed at the loom and what we refused to change.]</p><p>[Paragraph — time: loom hours per piece, why the number is what it is, and why it will not go down.]</p>", "link_label": "The craft, in detail", "link": "shopify://blogs/stories" } },
  "clips": { "type": "av-video-pair", "blocks": { "a": { "type": "clip", "settings": { "caption": "Archive · the shuttle, one pass" } }, "b": { "type": "clip", "settings": { "caption": "Archive · the kara, in gold" } } }, "block_order": ["a", "b"], "settings": {} },
  "ch2": { "type": "av-chapter-split", "settings": { "numeral": "II", "title": "Kamalam Moorthy", "role": "Chief designer · Head of production · Weaver", "quote": "[A line from Kamalam, in her words, from the founder interview — about the cloth, not the brand.]", "text": "<p>[Paragraph — who she is, how long she has woven, the unit she runs, what she is responsible for on every piece.]</p><p>[Paragraph — what she will not do: no shortcuts on yarn, no unnamed work, no piece she has not passed.]</p>", "video_caption": "In her words · from the founder interview" } },
  "ch3": { "type": "av-people-grid", "blocks": { "p1": { "type": "person", "settings": {} }, "p2": { "type": "person", "settings": {} }, "p3": { "type": "person", "settings": {} }, "p4": { "type": "person", "settings": {} } }, "block_order": ["p1", "p2", "p3", "p4"], "settings": { "numeral": "III", "title": "Every piece carries a name", "text": "The weaver's name is woven into the label and printed on the page. It is not a credit. It is the record of who made the cloth, kept where the buyer can see it." } },
  "ch4": { "type": "av-band", "blocks": {
    "i1": { "type": "item", "settings": { "title": "Numbered editions", "text": "Each drop is a fixed, honest count. When the number is reached the piece is finished. It is not re-run." } },
    "i2": { "type": "item", "settings": { "title": "Made to order", "text": "Nothing sits in a warehouse. A piece is begun when it is asked for, and you are told how long it will take." } },
    "i3": { "type": "item", "settings": { "title": "Worn by real people", "text": "There are no models. Every photograph on this site is of someone who owns the piece, and we name them." } },
    "i4": { "type": "item", "settings": { "title": "One price", "text": "The price is the price. There are no sales, no launch offers, and no marketplace listings." } }
  }, "block_order": ["i1", "i2", "i3", "i4"], "settings": { "mode": "list", "numeral": "IV", "heading": "How the house works" } },
  "close": { "type": "av-routes", "blocks": {
    "r1": { "type": "route", "settings": { "label": "Read", "title": "Stories from the unit", "link_label": "Stories", "url": "shopify://blogs/stories" } },
    "r2": { "type": "route", "settings": { "label": "See", "title": "The pieces, on the people who wear them", "link_label": "Gallery", "url": "shopify://pages/gallery" } },
    "r3": { "type": "route", "settings": { "label": "Write", "title": "A conversation with Kamalam, for a piece made to you", "link_label": "Exclusive", "url": "shopify://pages/exclusive" } }
  }, "block_order": ["r1", "r2", "r3"], "settings": {} }
}, "order": ["intro", "place", "film", "ch1", "clips", "ch2", "ch3", "ch4", "close"] }
```

`templates/page.gallery.json` (no intro section — Gallery starts with images):

```json
{ "sections": {
  "c1": { "type": "av-campaign", "settings": { "label": "Campaign 001" } },
  "c2": { "type": "av-campaign", "settings": { "label": "Campaign 002" } },
  "c3": { "type": "av-campaign", "settings": { "label": "Campaign 003", "archive_label": "The archive", "archive_url": "/blogs/stories/tagged/campaigns" } }
}, "order": ["c1", "c2", "c3"] }
```

- [ ] **Step 9: Verify**

Create pages `about`, `gallery` with their templates; metaobject `campaign` definition + one entry with 8 images. Preview both against the artboards. Theme check 0 errors.

- [ ] **Step 10: Commit**

```bash
git add sections/av-video-block.liquid sections/av-chapter.liquid sections/av-video-pair.liquid sections/av-chapter-split.liquid sections/av-people-grid.liquid sections/av-routes.liquid sections/av-campaign.liquid templates/page.about.json templates/page.gallery.json
git commit -m "feat: About chapters and Gallery campaigns

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Cart cleanup, setup guide, CI, README, GitHub

**Files:**
- Modify: `templates/cart.json`, `README.md`
- Create: `docs/setup.md`, `.github/workflows/theme-check.yml`

- [ ] **Step 1: `templates/cart.json`** — remove the `featured-collection` section from `sections` and `order`, leaving `cart-items` and `cart-footer`.

- [ ] **Step 2: `.github/workflows/theme-check.yml`**

```yaml
name: Theme Check
on: [push, pull_request]
jobs:
  theme-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm i -g @shopify/cli@latest
      - run: shopify theme check --fail-level error
```

- [ ] **Step 3: `docs/setup.md`** — the admin checklist. Sections: (1) Metaobject definitions `drop` (handle rule `drop-NNN`, one `current` at a time, status choices), `weaver`, `campaign` (with `story`); (2) Metafield definitions — product `av.*` list, collection `av.drop`, article `av.read_time`/`av.video`; (3) Products: one variant, inventory tracked, "continue selling when out of stock" OFF, tier tag; (4) Collections: one per drop (manual), automated `all` (condition + Newest first + template `products-all`), set `av.drop` on each drop collection; (5) Pages: About/Gallery/Exclusive with templates; (6) Blog `stories`, tags; (7) Menus: `av-house`, `av-shop`, `av-orders`, `av-contact` with the link lists from the footer artboard; (8) Theme settings: WhatsApp number, shipping line, currency line, logo override (Instagram is a link in the `av-contact` menu); (9) Policies (Privacy, Terms) so the footer prints them; (10) GitHub integration: connect repo, `develop` → unpublished, `main` → live, and the rule that publishing is a human action; (11) Fonts note: Montage SVG is built in; regenerate with `scripts/build-wordmark.py` if the wordmark changes.

- [ ] **Step 4: `README.md`** — replace with: what this is, the two CSS files, dev commands, the three JS files, link to `docs/setup.md` and the spec, "never publish from CLI".

- [ ] **Step 5: Push and open the GitHub repo**

```bash
gh repo create ananta-vastram-theme --private --source=. --remote=origin --push
git push -u origin develop
git checkout main && git merge --ff-only develop && git push origin main && git checkout develop
```
Then in Shopify admin → Online Store → Themes → Add theme → Connect from GitHub: `develop` (unpublished). Do **not** connect `main` to the live theme until the client approves.

- [ ] **Step 6: Final check**

```bash
shopify theme check && shopify theme push --unpublished --store anantavastram.myshopify.com --theme "Ananta Vastram develop" --json | head -3
```
Expected: 0 errors; a preview URL printed. Send that preview URL to the user.

- [ ] **Step 7: Commit**

```bash
git add templates/cart.json .github/workflows/theme-check.yml docs/setup.md README.md
git commit -m "chore: setup guide, Theme Check CI, README, cart cleanup

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Done when

- Every template above renders on the dev theme with the seeded data and matches its artboard at 1440 and 375.
- `shopify theme check` is clean; CI green on `develop`.
- `docs/setup.md` lets the client reproduce the admin data from nothing.
- Nothing has been published to the live theme.
