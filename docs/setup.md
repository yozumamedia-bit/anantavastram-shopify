# Store setup — Ananta Vastram

Everything the theme reads from Shopify admin, in the order to create it. Until an item exists the matching part of the site renders an empty state (or nothing), never broken markup.

Admin paths are for the current Shopify admin (September 2026). `[brackets]` in theme copy are placeholders for facts still to be supplied.

---

## 1. Metaobject definitions

**Settings → Custom data → Metaobjects → Add definition.** For each definition, turn on **Storefronts access** (otherwise Liquid cannot read it) and set entries to **Active**. The *Field key* column is what the theme reads: Shopify builds the key from the field's name, so name each field so its key matches (or edit the key before saving).

> **Namespace.** Shopify requires a namespace of at least three characters, so every metafield the theme reads is under **`custom`** (`custom.edition_total`), not `av`. Changed 22 Oct 2026, along with the collection metaobject's type (`drop` → `collection_meta`).

### `collection_meta` — one per numbered collection (a "series": Collection 001, Kovil, Mullai …)
Turn on **Publish entries as web pages** (Options) with URL handle **`series`**: each entry gets its own page, `/pages/series/<entry handle>`, rendered by `templates/metaobject/collection_meta.json` — the **Story** and **Looks** tabs. The **Pieces** tab is the entry's Shopify collection.

| Field key | Type | Notes |
|---|---|---|
| `number` | Integer | 1, 2, 3 … — orders the collections, highest first |
| `name` | Single line text | e.g. Kovil. Empty → the page reads "Collection 001" |
| `theme` | Single line text | one line under the name: what the collection is built from |
| `season` | Single line text | e.g. Deepavali 2026 |
| `status` | Single line text | `teaser`, `reveal`, `current`, `open` or `closed` — the stage (below) |
| `opens_on` | Date | "Opens 14 November" on locked tabs and the notify band |
| `closes_on` | Date | "Orders close …" while open |
| `story` | Rich text or multi-line text | the paragraph on Collections and the homepage |
| `design_note` | Multi-line text | Kamalam's note, 80–150 words, on the Story tab |
| `ensemble_image` | File (image) | the opening photograph of the Story tab and the large image on Collections |
| `film` | File (video) | the collection film (Story tab); also the opening when there is no image |
| `collection` | Collection reference | the Shopify collection holding its pieces |
| `motifs` | Metaobject reference, **list** → `motif` | the motif plates |
| `weavers` | Metaobject reference, **list** → `weaver` | "The hands"; also "Woven by …" under each look |
| `looks` | Metaobject reference, **list** → `look` | the Looks tab, in order |
| `credits` | Multi-line text | one line per credit, "Role: names" — e.g. `Photography: Memory Lane Studios` |

**Stages** (`status`). The same series URL serves every stage, so a link posted with the first teaser never changes.

| Stage | Story | Looks | Pieces |
|---|---|---|---|
| `teaser` | live: motifs, note, film | locked, "Coming" | locked, "Opens [opens_on]", notify band |
| `reveal` | live | live | locked, notify band |
| `current` | live | live | live — the collection on sale now |
| `open` | live | live | live — an earlier collection still selling |
| `closed` | live | live | "All N placed" — kept as the record |

**Ordering.** Collections are ordered by `number`, highest first; the handle does not matter. The newest `current` entry is the large band on Collections; `open` and `closed` entries follow under "Past collections". An entry whose Shopify collection is empty is hidden from Collections and the homepage (its series page still works, for teasers).

### `look` — one per look on a series' Looks tab
| Field key | Type | Notes |
|---|---|---|
| `number` | Integer | Look 01, 02 … |
| `title` | Single line text | e.g. Red set |
| `images` | File, **list** (images) | first is the grid image; the panel shows up to three |
| `wearer_name` | Single line text | real wearers only, named with consent |
| `wearer_occupation` | Single line text | |
| `wearer_city` | Single line text | |
| `pieces` | Product reference, **list** | the products in the look, with price and edition state |
| `commission_piece` | Single line text | a piece shown but not sold, e.g. Gold groom set — prints "By commission" and links to Commissions |
| `commission_note` | Multi-line text | one line describing it |
| `consent_date` | Date | when the wearer agreed to be named |

### `motif` — one per motif plate
| Field key | Type |
|---|---|
| `name_en` | Single line text |
| `name_ta` | Single line text (Tamil) |
| `source` | Single line text — the temple, text or place it is drawn from |
| `source_image` | File (image) — the source |
| `plate_image` | File (image) — the motif on the cloth |
| `note` | Multi-line text — one line |

### `weaver` — the hands, on series pages, About and product pages
| Field key | Type |
|---|---|
| `name` | Single line text |
| `unit_or_village` | Single line text |
| `district` | Single line text |
| `in_their_words` | Multi-line text — one line, recorded at the loom |
| `portrait` | File (image) |
| `consent_date` | Date |
| `role` | Single line text — About page only |
| `years` | Integer (years at the loom) — About page only |

> **Shortcut for the About and Gallery pages.** Both work without metaobjects: on About, each person in chapter III has its own name, role, years and portrait fields; on Gallery, each campaign section has title, season, credits, film and eight image slots. Fill those in the theme editor to get the pages up first.

### `campaign` — Gallery page
| Field key | Type |
|---|---|
| `title` | Single line text |
| `season` | Single line text |
| `photographer` | Single line text |
| `wearers` | Multi-line text (names, with consent) |
| `location` | Single line text |
| `images` | File, **list** (images; 8 fill the full layout: 3 lead, 3 row, 2 closing) |
| `film` | File (video) — optional, replaces the last image |
| `pieces` | Product reference, **list** |
| `story` | Multi-line text |
| `consent_date` | Date |

---

## 2. Metafield definitions

**Settings → Custom data**, pick the owner type, **Add definition**. Namespace **`custom`** for all. Turn on storefront access where offered.

### Products
| Key | Type | Used for |
|---|---|---|
| `custom.collection` | Metaobject reference → `collection_meta` | label "Collection 001", the collection fact (links to the series page), edition line |
| `custom.numeral` | Single line text | "No. IV" |
| `custom.tier` | Single line text, choices `everyday`, `occasion`, `commission` | label; also add the same word as a **tag** (§3) |
| `custom.weaver` | Metaobject reference → `weaver` | "Woven by …" |
| `custom.edition_total` | Integer | the edition's size — "3 of 8 left"; hides edition lines when empty |
| `custom.edition_placed` | Integer | pieces placed so far (0 when empty). Remaining = `edition_total − edition_placed`; the piece is sold out when this reaches `edition_total`. Raise it by one as each number is placed |
| `custom.lead_time_weeks` | Integer | "Made to order. 6 weeks from confirmation." |
| `custom.loom_hours` | Integer | Materials and motif accordion |
| `custom.motif_name_ta` | Single line text | motif (Tamil) |
| `custom.motif_name_en` | Single line text | motif (English) |
| `custom.yarn` | Single line text | Materials and motif |
| `custom.dye` | Single line text | Materials and motif |
| `custom.kara_colour` | Single line text | Kara fact |
| `custom.cloth_weight` | Single line text | e.g. `320 g` |
| `custom.cloth_width` | Single line text | e.g. `122 cm` |
| `custom.cloth_length` | Single line text | e.g. `4 m` |
| `custom.worn_with` | Product reference, **list** | "Worn with" on the product page (up to 3) |
| `custom.how_made` | Multi-line text | How it is made |
| `custom.care` | Multi-line text | Care accordion (falls back to the product section's default care text) |
| `custom.hsn` | Single line text | HSN code for the GST invoice app; not shown on the site |

`custom.zari`, `custom.dimensions` and `custom.border_width` also exist in the admin for Kamalam's records; the theme does not print them yet.

### Collections
| Key | Type |
|---|---|
| `custom.series` | Metaobject reference → `collection_meta` (set on each numbered collection: its page becomes that series' **Pieces** tab) |

### Blog posts (articles)
| Key | Type |
|---|---|
| `custom.read_time` | Integer (minutes) |
| `custom.video` | File — **restrict to Video**; the row and article show the video instead of the image |

### Blogs
| Key | Type |
|---|---|
| `custom.featured_article` | Article reference — the featured story on the Stories page. Leave empty to feature the newest article. |

---

## 3. Products

For every numbered piece:
1. **One variant.** Price in INR.
2. **Inventory:** "Track quantity" **on**, quantity = pieces in stock. **Sold out means the edition is complete**, not stock at 0: a piece is sold out when `custom.edition_placed` reaches `custom.edition_total` (or when Shopify itself stops the sale). So for a piece with an open edition, "Continue selling when out of stock" must be **ON** — at 0 it reads "Made to order" on tiles, rows and the list, and stays orderable; the counts ("3 of 8 left", "pieces remain") come from the two metafields. Once the edition is complete the theme shows "Sold out", "All 8 placed" and the notify-me form. A piece with no `custom.edition_total` keeps the plain inventory rule: tracked and at 0 is sold out.
3. **Tag** with its tier: `everyday` or `occasion` (drives the Products page filter tabs).
4. Add to its numbered collection.
5. Fill the `custom.*` metafields (§2). Upload photographs in order — the first is the lead image.

## 4. Collections

- **One manual collection per numbered collection** (e.g. "Collection 001"), default template, with `custom.series` pointing at its `collection_meta` entry, and the entry's `collection` field pointing back at the collection.
- **Products page:** `/collections/all` works without any setup — Shopify's automatic all-products collection renders the compact list, and `/collections/all/everyday` and `/collections/all/occasion` filter by tag. To control its sort order, create a collection with handle **`all`** (title "Products"), automated, condition *Inventory stock is greater than -1* (if rejected, use *Product price is greater than 0*), sort **Newest**, theme template **`collection.products-all`**.

## 5. Pages

**Online Store → Pages → Add page**, then choose the theme template in the page's *Theme template* box.

| Page | Handle | Template |
|---|---|---|
| About | `about` | `page.about` |
| Gallery | `gallery` | `page.gallery` |
| Commissions | `commissions` | `page.commissions` |
| Contact (footer "Write to us") | `contact` | `page.contact` — Shopify creates this page by default; it already uses this template. Paste the Google Calendar appointment link into the enquiry section's **Booking link** in the theme editor |
| Care | `care` | default — optional, appears in footer when it exists |
| Size and measure | `size-and-measure` | default — optional |
| Visit the unit | `visit-the-unit` | default — optional |

Then open each page in **Online Store → Themes → Customize** to add images, videos, the four weavers (About, chapter III — name, role, years, portrait, or a weaver entry) and the campaigns (Gallery, one per section — eight images plus credits, or a campaign entry).

## 6. Blog

- **Online Store → Blog posts → Manage blogs → Add blog**: title "Stories", handle **`stories`**.
- Tag posts with the section handles: `weavers`, `embroidery`, `motifs-and-design`, `the-house` (the tabs). Tag campaign write-ups `campaigns` for the Gallery archive link.
- The first tag on a post is its red section label.

## 7. Policies

**Settings → Policies.** Write the **Refund**, **Shipping**, **Privacy** and **Terms of service** policies. The footer links Shipping and Returns under *Orders* and prints Privacy/Terms in the bottom line.

## 8. Theme settings

**Online Store → Themes → Customize → Theme settings.**
- **Ananta Vastram:** WhatsApp number (digits with country code, e.g. `919876543210` — every WhatsApp link, including the floating button, stays hidden until this is set); floating WhatsApp button on/off; header transparent over the homepage hero on/off (turns red on scroll); price note under prices ("Inclusive of all taxes"); shipping line (printed once under each collection banner and collection header, and in the product page's Shipping accordion — never per row); footer currency line; optional logo image (overrides the built-in Montage wordmark).
- **Product photographs:** upload at least two per piece — tiles, list rows and product rows fade to the second photograph on hover.
- **Social media:** Instagram URL (footer *Contact* column).
- **Store details** (Settings → General): store email receives contact-form enquiries and notify-me requests.
- **Account icon:** "Show the account icon" stays off until Collection 001 is on sale.
- **Favicon** (Theme settings → Favicon): upload the mark as a square PNG, at least 180×180. Without it the browser tab shows a globe.

**Before the link is shared (sharing previews):**
- **Online Store → Preferences:** homepage meta description, under 155 characters, plain voice, no "luxury" or "eco". This is also the description WhatsApp and Instagram show. Optionally a social sharing image (1200×630); without one the theme uses `assets/av-share.png`, the white wordmark on kumkum.
- **Spam protection** (Online Store → Preferences) stays **on**: the enquiry and contact forms post natively so Shopify's hCaptcha token travels with them. A visitor may occasionally see the hCaptcha challenge before the sent page; if they close it without solving, the form unlocks after a moment so they can Send again.
- **Password page** (Customize → Password page): one line under the wordmark and the letter sign-up. Sign-ups land in Customers tagged `newsletter`.
- **Enquiries:** the Commissions form tags senders `commissions`, the Contact form `contact`. Shopify sends every contact-form message to the store contact email (Settings → General → Store contact details); to reach Kamalam, either use an address she reads or set a forward from that inbox to hers.

## 9. Menus (optional)

The header and footer ship with built-in links, so no menus are required. To edit links, create menus in **Online Store → Navigation** with these handles — the theme is already pointed at them, so no editor step is needed:
- `av-house` — header left and footer *The house* (Stories · Gallery · About).
- `av-shop` — header right and footer *Shop* (Collections · Products · Commissions).
- `av-orders`, `av-contact` — footer *Orders* and *Contact* columns.
Any other menu can be picked in the header/footer sections in the theme editor. A missing or empty menu falls back to the built-in links.

## 10. Content in the theme editor

- **Home:** hero still; credo; three showcase images; story image and text; film banner (silent loop, full film, poster, still); collection rows pick the two newest open collections automatically (or choose one); Commissions band — eyebrow, full-bleed image, statement, link.
- **Product template:** default shipping and care text.
- Replace every `[bracketed]` placeholder as facts arrive.

## 10a. Tamil text

Motif names in Tamil (`custom.motif_name_ta`) render in **Noto Sans Tamil**, self-hosted as `assets/noto-sans-tamil-300-700.woff2` (Tamil subset only, variable 300–700, SIL OFL — licence in `assets/noto-sans-tamil-OFL.txt`). Nothing to set up; it loads only for Tamil characters.

## 11. Wordmark

The Montage Serif wordmark is built into the theme as SVG outlines (`snippets/av-wordmark.liquid`). To regenerate after a wordmark change, with the licensed OTF locally (never commit it):

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools
.venv/bin/python scripts/build-wordmark.py path/to/MontageSerif.otf
```

`git diff snippets/av-wordmark.liquid` is empty when regenerated from the same font. Confirm the Montage Serif licence covers logo/outline use.

## 12. GitHub and publishing

1. **Online Store → Themes → Add theme → Connect from GitHub**, pick the repository and branch **`develop`** — this creates an unpublished theme that updates on every push.
2. Preview it, check the pages below, then merge `develop` into `main` and connect `main` as the theme to publish.
3. **Publishing is a human decision in admin.** The CLI is never used to publish (`theme push --live` / `theme publish`).

## Check after setup

- `/` — hero, credo, showcase, story, film, two collection rows (shipping line once under each banner), Commissions band.
- `/collections` — current collection band first, six tiles (name, price, "N of N left"), past collections below with the outline chip.
- `/blogs/stories` — featured story, then three rows (5/7, 7/5, full-width), then the Earlier grid of six.
- `/collections/drop-001` — collection header with counts, one piece per row.
- `/collections/all`, `/collections/all/occasion` — compact list, sold-out pieces last.
- A product — sticky panel, order button adds to cart; set a piece to 0 to see the notify-me form.
- `/pages/commissions` — send a test enquiry; it arrives at the store email.
- `/pages/about`, `/pages/gallery`, `/blogs/stories`, `/blogs/stories/tagged/weavers`, an article.
- Phone width: burger menu, product image rail, stacked rows.
