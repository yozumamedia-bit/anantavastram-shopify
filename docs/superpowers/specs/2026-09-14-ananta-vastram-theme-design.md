# Ananta Vastram — Shopify theme build spec

Date: 2026-09-14. Owner: Tharun Palla. Client approvers: Kamalam Moorthy, Jishnu.

This spec settles what `CLAUDE.md` (the brief) leaves open and fixes the technical shape of the build. Where the two disagree, this spec wins; where this spec is silent, the brief and the design canvas (https://claude.ai/code/artifact/00300329-5e1f-4940-9963-67387370613a) are the source of truth. Reproduce the canvas; do not invent sections.

## 1. Decisions made in this session

| Question | Decision |
|---|---|
| Repo location | `~/Documents/GitHub/anantavastram-shopify` (this repo). GitHub repo to create: `ananta-vastram-theme`. `~/projects/ananta-vastram-theme` is a dead copy. |
| "Products" nav link | `/collections/all` with template `collection.products-all.json`: a **compact list** — 4:5 image, name, tier, "N of N left", price. This is a deliberate exception to the "never a grid or list" rule. **Filter line** All · Everyday · Occasion uses Shopify's native tag URLs (`/collections/all/everyday`, `current_tags`); products carry a tag equal to their `av.tier` value in addition to the metafield (documented in `docs/setup.md`). Liquid cannot read query strings, and metafield filters need an app, so tags are the only zero-dependency mechanism. **Order**: the `all` collection's default sort is set to "Newest first" in admin; the section paginates `collection.products` by 50 and within a page makes two passes — available pieces first, then sold-out pieces at 0.45 opacity — so sold-out is last across the page, not per drop. |
| Product page | **Layout A**: 7/5 split. Media stacked in the left column and scrolling; right column sticky. Panel order: label (Drop · numeral · tier), name, price, `product.description` (kept to two or three sentences by content rule), edition line, availability, order button (or notify-me when sold out), WhatsApp link, four accordions **How it is made · Materials and motif · Shipping · Care** (overrides the brief's "Description" accordion, which would duplicate the panel text; Materials and motif lists yarn, dye, motif names, loom hours from metafields), facts (Woven by, Drop, Edition, Kara colour). |
| Wordmark | Rendered by one snippet, `snippets/av-wordmark.liquid`, used by header, opening and footer. Chain: if `settings.av_logo` (image picker) is set → `<img>`; else → the inline SVG outlines generated from the client's Montage Serif OTF with fontTools (a standalone, deferrable task; until it runs, the snippet holds the Cormorant Garamond 700 text wordmark). An image picker cannot default to a theme asset, which is why the SVG is inlined in the snippet rather than "set as default". The OTF never enters the repo (`*.otf`, `*.ttf` ignored). |
| `config/settings_data.json` | **Tracked**, not ignored (currently ignored and untracked — un-ignoring and adding it is an explicit step). It carries the theme's defaults: `type_header_font` Marcellus, `type_body_font` Karla, the wordmark picker, and Dawn's colour scheme populated with the palette (background ivory, text kumkum, accent kumkum) so the stock cart/account/search/404 pages pick up the palette without custom CSS. Shopify's GitHub integration writes editor changes back to it. |
| Store | `anantavastram.myshopify.com` (admin `xmqcfe-vp`). Treated as **live** until told otherwise: all work happens on an unpublished theme via `shopify theme dev` / `theme push --unpublished`; nothing is published without explicit instruction. |
| Verification | Real store via `shopify theme dev`, plus Theme Check locally and in CI. No static preview needed. |

## 2. Pages, templates, sections

All pages are JSON templates composed of new `av-*` sections. Dawn's own sections remain in the repo unused, except cart, customer account, search, 404 and password, which stay stock and pick up the palette through Dawn's colour-scheme settings only. `templates/cart.json` loses its `featured-collection` grid. Cart type is **page** (`settings.cart_type = page`); the custom header has no drawer integration. The bag link in `av-header` carries `id="cart-icon-bubble"`; its contents come from `snippets/av-cart-bubble.liquid` (AV bag icon plus `.av-cart-count`), which is also the sole content of `sections/cart-icon-bubble.liquid` — Dawn's `cart.js` re-fetches that section through the Section Rendering API on every quantity change and replaces the link's contents, so both must emit identical AV markup (a section cannot be rendered inside a section, hence the shared snippet). Add-to-cart on the product page navigates to `/cart` (Dawn's `product-form.js` fallback when no drawer or notification element exists); no notification is added. The search icon links to `/search` (Dawn's stock search page, restyled by colour scheme); predictive search stays off. Section settings are limited to content (images, video, text, links, references); layout and colour are fixed by the design.

| Page | Template | Sections in order |
|---|---|---|
| Every page | `layout/theme.liquid` | `snippets/av-opening.liquid` (a snippet, not a section: no editor content beyond the wordmark) → `header-group` (`av-header`) → `content_for_layout` → `footer-group` (`av-footer`) |
| Home | `index.json` | `av-hero` · `av-credo` · `av-showcase-three` · `av-story` · `av-film-banner` · `av-drop-rows` ×2 · `av-exclusive-row` |
| Collections | `list-collections.json` | `av-page-intro` · `av-drop-index` |
| Single drop | `collection.json` | `av-drop-header` · `av-product-rows` |
| Products | `collection.products-all.json` (assigned to `all`) | `av-page-intro` (tier filter variant) · `av-product-list` |
| Product | `product.json` | `av-product` |
| Exclusive | `page.exclusive.json` | `av-page-intro` · `av-full-bleed` · `av-steps` · `av-cards` · `av-band` (terms) · `av-enquiry` |
| About | `page.about.json` | `av-page-intro` · `av-full-bleed` · `av-video-block` · `av-chapter` · `av-video-pair` · `av-chapter-split` · `av-people-grid` · `av-band` (01–04) · `av-routes` (closing image pair + three routes) |
| Gallery | `page.gallery.json` | `av-campaign` ×3 · archive link (setting on the last campaign) |
| Stories | `blog.json` | `av-featured-article` · `av-tabs` · `av-posts` · `av-earlier` · `av-newsletter-line` |
| Article | `article.json` | `av-article` |

Section notes:

- `av-drop-rows` takes a `drop` metaobject reference; if blank it auto-selects by position (setting `auto_index`: 1 = newest, 2 = second newest, using the handle iteration below and skipping `closed` drops). Renders `av-drop-band` then one `av-product-row` per product in the drop's collection.
- `av-exclusive-row` is the advert: same row anatomy, price text "On enquiry", link to the Exclusive page. Image, name, description, availability and shipping are section settings.
- **Drop ordering.** Sorting metaobjects by a field in Liquid is not reliable, so drops are addressed by handle: every `drop` metaobject has handle `drop-NNN` (three digits, matching `number`). Sections loop `for i in (1..50) reversed`, build the handle, read `shop.metaobjects.drop[handle]`, and skip blanks. Deterministic, newest first, no sort filter. `docs/setup.md` mandates the handle.
- `av-drop-index` iterates drops newest first as above. Exactly one drop should have `status = current` (setup.md says so; if several do, each renders as a large band). The drop with `status = current` renders as the large band (7/5, ensemble image, chip "Current drop", counts, six tiles, "Enter the drop"). Others render as the compact past-drop band with chip "Pieces remaining" (`open`) or outline chip "Closed" (`closed`), then tiles. No commission content.
- `av-drop-header` reads the drop metaobject that references the current collection (`collection.metafields.av.drop`, set in admin) and shows season, theme name, design line, story, counts.
- `av-product` uses Dawn's `product-form.js` for add-to-cart and Dawn's `<details>` accordion markup restyled. Sold-out state: order button replaced by the notify-me form; edition line reads "All N placed".
- `av-featured-article` shows the section's `article` setting, else `blog.articles.first`. `av-tabs` filters by blog tag via `/blogs/stories/tagged/<tag>`; tags: weavers, embroidery, motifs-and-design, the-house.
- `av-posts` shows the first six articles of `blog.articles` excluding the featured one, alternating 5/7; an article with `av.video` renders the video in place of the image. `av-earlier` shows the following three. On a `/tagged/` URL (and on page 2 onwards) the featured section is hidden and `av-posts` paginates all matching articles, 7 per page; `av-earlier` is hidden.

Shared snippets: `av-product-row`, `av-product-list-item`, `av-drop-tile`, `av-drop-banner` (matches the existing `.av-drop-banner` CSS), `av-edition-line` (takes `product` and `context: tile | row | page`; renders "R of E left", "Sold out", or on the product page "All E placed"), `av-media` (responsive `image_tag`, fixed aspect ratio, ivory placeholder when blank), `av-video` (loop, tap for sound, optional full film), `av-icon` (inline SVG by name, stroke 1.5), `av-whatsapp-link`, `av-wordmark`.

CSS: `av-base.css` and `av-sections.css` are extended, not restyled. Blocks that do not exist yet and must be added: `av-product` (stacked media, sticky panel, accordions, notify form), `av-product-list` (compact list and filter line), mobile drawer `<dialog>` states.

## 3. Data model

Created in Shopify admin by hand from `docs/setup.md`.

Metaobjects:

- `drop` — handle `drop-NNN` (required, see §2), `number` (integer), `theme_name`, `season`, `status` (single-line with choices validation: current / open / closed), `design_line`, `story` (multi-line), `ensemble_image` (file), `collection` (collection reference).
- `weaver` — `name`, `portrait` (file), `role`, `years` (integer), `unit`.
- `campaign` — `title`, `season`, `photographer`, `wearers` (multi-line), `location`, `images` (file list), `film` (file), `pieces` (product list).

Metafields, namespace `av`:

- Product: `drop` (metaobject ref), `numeral` (Roman, text), `tier` (everyday / occasion / exclusive), `weaver` (metaobject ref), `edition_total` (integer), `loom_hours` (integer), `motif_name_ta`, `motif_name_en`, `yarn`, `dye`, `kara_colour`, `lead_time_weeks` (integer), `how_made` (multi-line), `care` (multi-line).
- Collection: `drop` (metaobject ref).
- Article: `read_time` (integer, minutes), `video` (file).

Products also carry one tag equal to their `av.tier` value (`everyday` / `occasion` / `exclusive`) for the Products page filter.

Counts: each numbered piece is one product with one variant, inventory tracked, overselling off. Remaining = `variant.inventory_quantity`; edition = `av.edition_total`. `av-edition-line` renders "R of E left" / "Sold out" and is the only place this is computed. Drop-level counts (pieces, edition per piece, remaining of total) are summed in Liquid over the collection's products.

Fonts: Shopify's library has no Rubik Mono One and no Cormorant Garamond (verified on shopify.dev). The display face therefore ships self-hosted as `assets/rubik-mono-one-400.woff2` (SIL OFL, licence file alongside), declared by `@font-face` in `theme.liquid` and preloaded; the wordmark text fallback uses Shopify's Cormorant 700 (`cormorant_n7`). No Google Fonts runtime call. Theme settings added to `settings_schema.json` under a new "Ananta Vastram" group: `av_wordmark_font` (font_picker, default `cormorant_n7`), `av_logo` (image_picker, no default; see §1), `av_whatsapp_number`, `av_shipping_line`, `av_currency_line`. (Instagram is a footer menu link, not a setting.) Defaults land in `settings_data.json`. `theme.liquid` emits the `font_face` declaration for the wordmark picker, the `@font-face` and preload for the self-hosted display font, and the custom property `--av-wordmark-family`; `--av-font-display` is fixed to 'Rubik Mono One' directly in `av-base.css`.

Menus: `main-menu` is not used. Header and footer link groups are `link_list` section settings, one per group (header: `av-house`, `av-shop`; footer: `av-house`, `av-shop`, `av-orders`, `av-contact`), so the two-group structure cannot be broken from the navigation editor. The client creates these menus in admin; `docs/setup.md` lists them.

## 4. Forms and integrations

- Exclusive enquiry: `{% form 'contact' %}` with fields name, email, phone, occasion, date, city, language, notes. Arrives as store email. WhatsApp link beside the submit.
- Newsletter (footer and Stories line): `{% form 'customer' %}` with `contact[tags] = newsletter`.
- Notify-me: `{% form 'contact' %}` with hidden `product` field carrying the handle. A back-in-stock app can replace it later.
- WhatsApp: `https://wa.me/<number>?text=<prefilled>` from `av_whatsapp_number`; product pages pre-fill the piece name and URL.
- Currency: one market, INR only, so no localization form — the footer bottom line prints a static theme setting `av_currency_line` ("India (INR ₹)"). Dawn's localization form can be swapped in if a second market is ever added.

## 5. JavaScript

`layout/theme.liquid` **keeps** Dawn's `constants.js`, `pubsub.js`, `global.js`, the `window.shopUrl / routes / cartStrings / variantStrings / accessibilityStrings` block, the `:root` custom-property block and `base.css`; the stock cart, search, account and password templates and `product-form.js` depend on them. Dawn's `predictive-search.js` stays behind its existing setting. Removed from `theme.liquid`: nothing else; the announcement bar and cart drawer render are dropped from the header group and body respectively.

Three new files, vanilla, deferred, no dependencies:

- `av-opening.js` — on load, if `sessionStorage.avOpened` is unset and `prefers-reduced-motion` is not set: add `html.av-opening-active` (locks scroll), wordmark fades in (CSS), hold, add `.is-leaving`, on `transitionend` remove the overlay and the html class, set the flag. Otherwise remove the overlay immediately.
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
- `docs/setup.md`: metaobject and metafield definitions (including the `drop-NNN` handle rule and status choices), tier tags on products, pages to create (About, Gallery, Exclusive) with template assignment, an automated collection with handle `all` (condition: inventory stock is greater than −1 so every product qualifies; fallback if admin rejects a negative value: product price is greater than 0), sorted "Newest first" and assigned `collection.products-all`, the six `link_list` menus, blog `stories` with tags, WhatsApp number, GitHub integration steps.
- "Theme Check before every commit" is a convention enforced by CI, not a git hook.

## 8. Build order

0. Wordmark SVG generation from the Montage OTF at `.superpowers/fonts/montage-serif.otf` (git-ignored copy; family "Montage Serif Font", 119 glyphs, 1000 upem) using fontTools from a scratch venv, output `snippets/av-wordmark.liquid` with inline `<svg>` outlines of "ANANTA VASTRAM". Standalone step; until it runs the snippet shows the Cormorant text.
1. `layout/theme.liquid`: link the two CSS files, font settings and custom properties, opening overlay, the three new scripts alongside Dawn's retained ones. New theme settings; `settings_data.json` un-ignored, added, and populated with fonts, palette and cart type.
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
