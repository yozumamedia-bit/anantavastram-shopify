# Ananta Vastram — Shopify theme

Custom Shopify Online Store 2.0 theme for Ananta Vastram, a luxury handwoven Tamil menswear label (veshtis, kurtas, wedding sets). Built on **Dawn v9.0.0** (this repo is a stripped Dawn; no Dawn git history). Owner: Tharun Palla, Yozuma Media & Analytics. Client approvers: Kamalam Moorthy (chief designer, weaver), Jishnu.

**Design source of truth:** the design canvas at
https://claude.ai/code/artifact/00300329-5e1f-4940-9963-67387370613a
(artboards: Opening, Homepage, About, Collections, Exclusive, Gallery, Stories, Type pairings). Reproduce it; do not invent new sections without asking.

## Stack decisions (settled — don't relitigate)
- Liquid theme on Dawn. No headless, no Hydrogen, no Tailwind, no Bootstrap, no jQuery.
- Plain CSS with custom properties. `assets/av-base.css` (tokens, type roles, header, footer, opening) and `assets/av-sections.css` (one block per section). Both already written — extend, don't restyle.
- Fonts via Shopify's font picker (Shopify CDN, no Google Fonts call): heading = Marcellus, body = Karla, display = Rubik Mono One, wordmark stand-in = Cormorant Garamond 700. Production wordmark is **Montage Serif** (licence to be confirmed) — support an SVG logo upload in header/opening settings.
- Minimal JS, Dawn's Web Component style. Files: `av-opening.js` (once-per-session sequence via `sessionStorage`), `av-reveal.js` (IntersectionObserver adds `.is-in` to `.av-reveal`), `av-video.js` (tap-for-sound on loops).
- Shopify CLI 3 for dev (`shopify theme dev --store <dev store>`); Theme Check as linter; GitHub integration: `main` → live theme, `develop` → unpublished theme. No Shopify store exists yet (Sep 2026) — build blind, verify when the Partner dev store is created.

## Palette (proposed — ratify with client)
kumkum `#9E1B1E` · kumkum-deep `#7A1216` · ivory `#F5EFE3` · ink `#4A4541` · greys `#6B6560` `#A8A29B` `#D9D2C5` · dark `#1E1A17`.
Rule: red header/footer/bands, ivory page, red text. Kara colours appear only in product photography, never in UI chrome.

## Type roles (classes in av-base.css)
`.av-statement` Marcellus (credo, page openings, About headline) · `.av-sub` Rubik Mono One (sub-headings, collection names, chapter titles) · `.av-name` / `.av-price` Rubik Mono One (product names 22px, prices 18px) · `.av-body` Karla 300 · `.av-label` Karla 11px tracked uppercase · `.av-numeral` Marcellus Roman numerals.

## Header (every page)
Red pane, sticky. Left = brand only: **Stories · Gallery · About**. Centre = wordmark (white). Right = commerce only: **Collections · Products · Exclusive** + search, account, bag icons (inline SVG, stroke 1.5). Mobile: burger → full-screen red drawer with the two groups. No Tamil script in the header.
Footer: red; brand + newsletter; columns **The house** (Stories, Gallery, About) · **Shop** (Collections, Products, Exclusive) · **Orders** · **Contact**; legal line + INR selector.

## Opening sequence (once per session)
Fixed red overlay, wordmark fades in (1.6s), holds ~1s, overlay slides up (`translateY(-100%)`, 900ms) and the sticky header appears beneath. `sessionStorage.avOpened = 1` prevents replay. Respect `prefers-reduced-motion`. No loader graphic (an infinity line was tried and rejected).

## Page structures
**Homepage (`templates/index.json`)**, in order:
1. `av-hero` — one full-viewport still, no text, no button.
2. `av-credo` — label + Marcellus statement + hairline.
3. `av-showcase-three` — three tall images, Roman-numeral captions only.
4. `av-story` — image left, text right, one text link.
5. `av-film-banner` — full-bleed: 2/3 silent loop (tap opens drop film with sound) + 1/3 tall still; caption line below.
6. `av-drop-banner` + `av-product-rows` — collection name band, then products **one per row, three columns**: image (520px) | numeral+tier, name, description, "How it is made" | price, edition, availability, shipping, "View the piece". Never a grid. Homepage shows the two most recent drops.
7. `av-drop-banner` + one row for **Exclusive** (advert; price "On enquiry", link to Exclusive page).
8. Footer.

**Collections (`templates/list-collections.json` or page)** — index of numbered drops, newest first. Intro statement; current drop: ensemble image | season, chip "Current drop", theme name, "The design · [motif]" line, paragraph, counts (pieces / edition / remaining); six-tile strip with per-piece **"N of N left"** (inventory quantity vs edition-total metafield; sold-out tiles opacity .45, stay listed). Past drops: same band compact, chip "Pieces remaining" or "Closed", still orderable while stock remains. No commission content here.

**Product (`templates/product.json`)** — to design; follow the row anatomy + Dawn accordions (Description · How it is made · Shipping · Care) + weaver name, drop number, edition count, kara colour name. WhatsApp block. Notify-me for sold-out numbered pieces.

**Exclusive (`templates/page.exclusive.json`)** — made-to-order line (renamed from "Made to order"; not a collection). Statement "One piece, for one person, made once."; full-bleed exemplar (gold groom set) with wearer/weaver credit; four steps (conversation → cloth and motif → the loom → fitting and delivery); two "what can be made" cards; red terms band (capacity, deposit, lead time, price never discounted); enquiry form (name, email/phone, occasion, date, city, language, notes) + WhatsApp link.

**About (`templates/page.about.json`)** — editorial chapters: statement "Cloth without end." + name meaning; full-bleed unit photo with place/credit; drop film block; I The loom decides first; two archive loops; II Kamalam Moorthy (portrait, italic pull-quote, interview video — portrait pending her sign-off); III Every piece carries a name (4 weaver portraits); IV How the house works (red band, 01–04: numbered editions, made to order, worn by real people, one price); closing two images + routes (Stories / Gallery / Exclusive).

**Gallery (`templates/page.gallery.json`)** — starts directly with images (no intro). Last three campaigns, each: image grid (lead 8/4 + stacked, row of three, 4/8 + loop) then title/season/credits (photographs, wearers named with consent, location, pieces). Link to campaign archive. No prices.

**Stories (`templates/blog.json`, `article.json`)** — journal. Featured article full-width image + Marcellus headline; tabs All · Weavers · Embroidery · Motifs and design · The house (article tags); posts as alternating 5/7 rows (image | section·date·read time, Rubik title, dek, Read); a video post uses an article video metafield; "Earlier" 3-up grid; monthly letter sign-up line. Article page: 2/8/2 grid, 18px body.

## Data model (create in Shopify admin; document in docs/setup.md)
Metaobjects: `drop` (number, theme_name, season, status[current|open|closed], design_line, story, ensemble_image, collection ref) · `weaver` (name, portrait, role, years, unit) · `campaign` (title, season, photographer, wearers, location, images, film).
Product metafields (namespace `av`): drop (ref), numeral, tier[everyday|occasion|exclusive], weaver (ref), edition_total (int), loom_hours, motif_name_ta, motif_name_en, yarn, dye, lead_time_weeks. Remaining = `variant.inventory_quantity`. Inventory tracked, no overselling.
Article metafields: read_time, video. Blog tags = sections.

## Content rules
No lorem ipsum. Facts not yet known stay as bracketed placeholders `[weaver name]`. No discount UI anywhere, ever. No "Sale", no urgency copy. Real wearers only, named. Copy voice: plain, specific, no explicit luxury/eco claims.

## Build order
1. `layout/theme.liquid`: link av-base.css + av-sections.css, font settings, opening overlay, reveal script.
2. `sections/av-header.liquid`, `av-footer.liquid`; point `header-group.json` / `footer-group.json` at them.
3. Homepage sections + `index.json`.
4. Collection/drop templates + tiles.
5. Product template.
6. Exclusive page sections + template.
7. Blog/article templates.
8. About, Gallery.
9. `docs/setup.md`, `.github/workflows/theme-check.yml`, README.
Run `shopify theme check` before every commit.
