# Ananta Vastram — Shopify theme build spec

Date: 2026-09-14. Owner: Tharun Palla. Client approvers: Kamalam Moorthy, Jishnu.

This spec settles what `CLAUDE.md` (the brief) leaves open and fixes the technical shape of the build. Where the two disagree, this spec wins; where this spec is silent, the brief and the design canvas (https://claude.ai/code/artifact/00300329-5e1f-4940-9963-67387370613a) are the source of truth. Reproduce the canvas; do not invent sections.

## 1. Decisions made in this session

| Question | Decision |
|---|---|
| Repo location | `~/Documents/GitHub/anantavastram-shopify` (this repo). GitHub repo to create: `ananta-vastram-theme`. `~/projects/ananta-vastram-theme` is a dead copy. |
| "Products" nav link | `/collections/all` with template `collection.products-all.json`: a **compact list** — 4:5 image, name, tier, "N of N left", price — with a filter line All · Everyday · Occasion (by `av.tier`). Newest drop first; sold-out pieces last, at 0.45 opacity. This is a deliberate exception to the "never a grid or list" rule. |
| Product page | **Layout A**: 7/5 split. Media stacked in the left column and scrolling; right column sticky. Panel order: label (Drop · numeral · tier), name, price, description, edition line, availability, order button (or notify-me when sold out), WhatsApp link, four accordions (Description · How it is made · Shipping · Care), facts (Woven by, Drop, Edition, Kara colour). |
| Wordmark | SVG outlines generated from the client's Montage Serif OTF with fontTools, saved as `assets/av-wordmark.svg`, set as the default logo. The OTF never enters the repo (`*.otf`, `*.ttf` ignored). Cormorant Garamond 700 remains the text fallback when no logo is set. |
| `config/settings_data.json` | **Tracked**, not ignored. It carries the theme's default settings and Shopify's GitHub integration writes editor changes back to it. |
| Store | A Shopify store exists. Domain: `[to be supplied]`. Live-or-dev: `[to be supplied]`. On a live store all work happens on an unpublished theme; nothing is published without explicit instruction. |
| Verification | Real store via `shopify theme dev`, plus Theme Check locally and in CI. No static preview needed. |

## 2. Pages, templates, sections

All pages are JSON templates composed of new `av-*` sections. Dawn's own sections remain in the repo unused, except cart, customer account, search, 404 and password, which stay stock and pick up the palette through tokens only. Section settings are limited to content (images, video, text, links, references); layout and colour are fixed by the design.

| Page | Template | Sections in order |
|---|---|---|
| Every page | `layout/theme.liquid` | `av-opening` → `header-group` (`av-header`) → `content_for_layout` → `footer-group` (`av-footer`) |
| Home | `index.json` | `av-hero` · `av-credo` · `av-showcase-three` · `av-story` · `av-film-banner` · `av-drop-rows` ×2 · `av-exclusive-row` |
| Collections | `list-collections.json` | `av-page-intro` · `av-drop-index` |
| Single drop | `collection.json` | `av-drop-header` · `av-product-rows` |
| Products | `collection.products-all.json` (assigned to `all`) | `av-page-intro` (tier filter variant) · `av-product-list` |
| Product | `product.json` | `av-product` |
| Exclusive | `page.exclusive.json` | `av-page-intro` · `av-full-bleed` · `av-steps` · `av-cards` · `av-band` (terms) · `av-enquiry` |
| About | `page.about.json` | `av-page-intro` · `av-full-bleed` · `av-video-block` · `av-chapter` · `av-video-pair` · `av-chapter-split` · `av-people-grid` · `av-band` (01–04) · `av-full-bleed` ×2 · `av-routes` |
| Gallery | `page.gallery.json` | `av-campaign` ×3 · archive link (setting on the last campaign) |
| Stories | `blog.json` | `av-featured-article` · `av-tabs` · `av-posts` · `av-earlier` · `av-newsletter-line` |
| Article | `article.json` | `av-article` |

Section notes:

- `av-drop-rows` takes a `drop` metaobject reference; if blank it auto-selects by position (setting `auto_index`: 1 = newest, 2 = second newest, by `status` current/open then `number` desc). Renders `av-drop-band` then one `av-product-row` per product in the drop's collection.
- `av-exclusive-row` is the advert: same row anatomy, price text "On enquiry", link to the Exclusive page. Image, name, description, availability and shipping are section settings.
- `av-drop-index` loops `shop.metaobjects.drop.values`, sorted by `number` desc. The drop with `status = current` renders as the large band (7/5, ensemble image, chip "Current drop", counts, six tiles, "Enter the drop"). Others render as the compact past-drop band with chip "Pieces remaining" (`open`) or outline chip "Closed" (`closed`), then tiles. No commission content.
- `av-drop-header` reads the drop metaobject that references the current collection (`collection.metafields.av.drop`, set in admin) and shows season, theme name, design line, story, counts.
- `av-product` uses Dawn's `product-form.js` for add-to-cart and Dawn's `<details>` accordion markup restyled. Sold-out state: order button replaced by the notify-me form; edition line reads "All N placed".
- `av-tabs` filters by blog tag via `/blogs/stories/tagged/<tag>`; tags: weavers, embroidery, motifs-and-design, the-house.
- `av-posts` shows `blog.articles` with alternating 5/7 layout; an article with `av.video` renders the video in place of the image. `av-earlier` shows the next three after the posts shown above.

Shared snippets: `av-product-row`, `av-product-list-item`, `av-drop-tile`, `av-drop-band`, `av-edition-line`, `av-media` (responsive `image_tag`, fixed aspect ratio, ivory placeholder when blank), `av-video` (loop, tap for sound, optional full film), `av-icon` (inline SVG by name, stroke 1.5), `av-whatsapp-link`.

## 3. Data model

Created in Shopify admin by hand from `docs/setup.md`.

Metaobjects:

- `drop` — `number` (integer), `theme_name`, `season`, `status` (single-line, one of current / open / closed), `design_line`, `story` (multi-line), `ensemble_image` (file), `collection` (collection reference).
- `weaver` — `name`, `portrait` (file), `role`, `years` (integer), `unit`.
- `campaign` — `title`, `season`, `photographer`, `wearers` (multi-line), `location`, `images` (file list), `film` (file), `pieces` (product list).

Metafields, namespace `av`:

- Product: `drop` (metaobject ref), `numeral` (Roman, text), `tier` (everyday / occasion / exclusive), `weaver` (metaobject ref), `edition_total` (integer), `loom_hours` (integer), `motif_name_ta`, `motif_name_en`, `yarn`, `dye`, `kara_colour`, `lead_time_weeks` (integer), `how_made` (multi-line), `care` (multi-line).
- Collection: `drop` (metaobject ref).
- Article: `read_time` (integer, minutes), `video` (file).

Counts: each numbered piece is one product with one variant, inventory tracked, overselling off. Remaining = `variant.inventory_quantity`; edition = `av.edition_total`. `av-edition-line` renders "R of E left" / "Sold out" and is the only place this is computed. Drop-level counts (pieces, edition per piece, remaining of total) are summed in Liquid over the collection's products.

Theme settings added to `settings_schema.json` under a new "Ananta Vastram" group: `av_display_font` (font_picker, default Rubik Mono One), `av_wordmark_font` (font_picker, default Cormorant Garamond 700), `av_logo` (image_picker, default the generated SVG), `av_whatsapp_number`, `av_shipping_line`, `av_instagram_url`. Defaults land in `settings_data.json`. `theme.liquid` emits `--av-display-family` and `--av-wordmark-family` from the pickers.

Menus: `main-menu` is not used. Header and footer link groups are section settings (link lists) so the two-group structure cannot be broken from the navigation editor.

## 4. Forms and integrations

- Exclusive enquiry: `{% form 'contact' %}` with fields name, email, phone, occasion, date, city, language, notes. Arrives as store email. WhatsApp link beside the submit.
- Newsletter (footer and Stories line): `{% form 'customer' %}` with `contact[tags] = newsletter`.
- Notify-me: `{% form 'contact' %}` with hidden `product` field carrying the handle. A back-in-stock app can replace it later.
- WhatsApp: `https://wa.me/<number>?text=<prefilled>` from `av_whatsapp_number`; product pages pre-fill the piece name and URL.
- Currency: Dawn's localization form, INR default, rendered in the footer bottom line only.

## 5. JavaScript

Three files, vanilla, deferred, no dependencies:

- `av-opening.js` — on load, if `sessionStorage.avOpened` is unset and `prefers-reduced-motion` is not set: show overlay, wordmark fades in (CSS), hold, add `.is-leaving`, remove overlay on `transitionend`, set the flag. Otherwise remove the overlay immediately.
- `av-reveal.js` — IntersectionObserver adds `.is-in` to `.av-reveal` once.
- `av-video.js` — for `.av-video`: loops muted autoplay; the play button unmutes and, if a `data-film` source is set, swaps to the full film with controls.

Header mobile drawer is a native `<dialog>` opened and closed by two buttons; no library.

## 6. Content rules and empty states

No lorem ipsum. Unknown facts stay as `[bracketed]` placeholders in default settings so the client sees them. No discount UI, "Sale", or urgency copy anywhere. Kara colours appear only in photography. Every section degrades quietly: a missing metaobject or reference renders nothing; a blank image renders the ivory placeholder; a blank metafield omits its label and line.

## 7. Repository, tooling, CI

- Branches: `develop` for work, `main` for the published theme. Shopify GitHub integration: `main` → live theme, `develop` → unpublished theme.
- Tooling: Shopify CLI 3 (`shopify theme dev --store <domain>`), Theme Check (`theme-check:recommended`). `shopify theme check` runs before every commit.
- CI: `.github/workflows/theme-check.yml` runs Theme Check on push and pull request.
- `.gitignore`: `.DS_Store`, `node_modules/`, `.shopify/`, `.superpowers/`, `*.otf`, `*.ttf`. `settings_data.json` is tracked.
- `docs/setup.md`: metaobject and metafield definitions, pages to create (About, Gallery, Exclusive) with template assignment, collection `all` template assignment, blog `stories` with tags, WhatsApp number, GitHub integration steps.

## 8. Build order

1. `layout/theme.liquid`: link the two CSS files, font settings and custom properties, opening overlay, the three scripts. New theme settings and defaults. Wordmark SVG generation.
2. `av-header`, `av-footer`; header and footer groups repointed.
3. Homepage sections and `index.json`.
4. `av-page-intro`, `av-drop-index`, `av-drop-header`, `av-product-rows`, tiles; `list-collections.json`, `collection.json`.
5. `av-product`, `product.json`.
6. `av-product-list`, `collection.products-all.json`.
7. Exclusive sections and `page.exclusive.json`.
8. Blog and article sections and templates.
9. About and Gallery sections and templates.
10. `docs/setup.md`, CI workflow, README.

Each step ends with `shopify theme check` clean and a visual check in the dev preview against the matching artboard at 1440px and 390px.

## 9. Out of scope

Checkout customisation, third-party apps, multi-currency beyond the INR selector, reviews, discounts of any kind, Tamil locale, the campaign archive page (link only), account page redesign beyond tokens.
