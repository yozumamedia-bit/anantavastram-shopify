# Store setup — Ananta Vastram

Everything the theme reads from Shopify admin, in the order to create it. Until an item exists the matching part of the site renders an empty state (or nothing), never broken markup.

Admin paths are for the current Shopify admin (September 2026). `[brackets]` in theme copy are placeholders for facts still to be supplied.

---

## 1. Metaobject definitions

**Settings → Custom data → Metaobjects → Add definition.** For each definition, turn on **Storefronts access** (otherwise Liquid cannot read it) and set entries to **Active**.

### `drop` — one per numbered collection (the metaobject keeps the key `drop`; customers read "Collection 001")
| Field key | Type | Notes |
|---|---|---|
| `number` | Integer | 1, 2, 3 … |
| `theme_name` | Single line text | e.g. the collection's idea |
| `season` | Single line text | e.g. Pongal 2027 |
| `status` | Single line text, **choices**: `current`, `open`, `closed` | exactly one collection `current` at a time |
| `design_line` | Single line text | "The design · …" line |
| `story` | Multi-line text | paragraph from Kamalam |
| `ensemble_image` | File (image) | large image on Collections |
| `collection` | Collection reference | the Shopify collection holding its pieces |

**Ordering.** Collections (`drop` entries) are ordered by their `number` field, highest first — the handle does not matter. Give every entry a number. Rules the pages rely on:
- The newest entry with status `current` is the large band on Collections and is always shown first. If more than one is `current`, the newest wins and the others show under "Past collections".
- `open` = past collection still selling; `closed` = past collection kept as a record. A collection with no stock left shows "Closed" regardless.
- An entry whose Shopify collection is empty is hidden.

> **Shortcut for the About and Gallery pages.** Both work without metaobjects: on About, each person in chapter III has its own name, role, years and portrait fields; on Gallery, each campaign section has title, season, credits, film and eight image slots. Fill those in the theme editor to get the pages up first. Metaobjects are still the way to reuse a weaver across product pages and to keep campaign records in one place — when an entry is chosen, the section's own fields are ignored.

### `weaver` — people on the About page and product pages
| Field key | Type |
|---|---|
| `name` | Single line text |
| `portrait` | File (image) |
| `role` | Single line text |
| `years` | Integer (years at the loom) |
| `unit` | Single line text (weaving unit / place) |

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

---

## 2. Metafield definitions

**Settings → Custom data**, pick the owner type, **Add definition**. Namespace `av` for all. Turn on storefront access where offered.

### Products
| Key | Type | Used for |
|---|---|---|
| `av.drop` | Metaobject reference → `drop` | label "Collection 001", collection fact link, edition line |
| `av.numeral` | Single line text | "No. IV" |
| `av.tier` | Single line text, choices `everyday`, `occasion`, `commission` | label; also add the same word as a **tag** (§3) |
| `av.weaver` | Metaobject reference → `weaver` | "Woven by …" |
| `av.edition_total` | Integer | the edition's size — "3 of 8 left"; hides edition lines when empty |
| `av.edition_placed` | Integer | pieces placed so far (0 when empty). Remaining = `edition_total − edition_placed`; the piece is sold out when this reaches `edition_total`. Raise it by one as each number is placed |
| `av.lead_time_weeks` | Integer | "Made to order. 6 weeks from confirmation." |
| `av.loom_hours` | Integer | Materials and motif accordion |
| `av.motif_name_ta` | Single line text | motif (Tamil) |
| `av.motif_name_en` | Single line text | motif (English) |
| `av.yarn` | Single line text | Materials and motif |
| `av.dye` | Single line text | Materials and motif |
| `av.kara_colour` | Single line text | Kara fact |
| `av.cloth_weight` | Single line text | Materials and motif — e.g. `320 g` |
| `av.cloth_width` | Single line text | Materials and motif — e.g. `122 cm` |
| `av.cloth_length` | Single line text | Materials and motif — e.g. `4 m` |
| `av.worn_with` | Product reference, **list** | "Worn with" — the other pieces of the set on the product page (up to 3) |
| `av.how_made` | Multi-line text | How it is made |
| `av.care` | Multi-line text | Care accordion (falls back to the product section's default care text) |

### Collections
| Key | Type |
|---|---|
| `av.drop` | Metaobject reference → `drop` (set on each numbered collection; drives the collection page header and counts) |

### Blog posts (articles)
| Key | Type |
|---|---|
| `av.read_time` | Integer (minutes) |
| `av.video` | File — **restrict to Video**; the row and article show the video instead of the image |

### Blogs
| Key | Type |
|---|---|
| `av.featured_article` | Article reference — the featured story on the Stories page. Leave empty to feature the newest article. If your admin does not offer an article reference type, leave it out: the newest article is featured. |

---

## 3. Products

For every numbered piece:
1. **One variant.** Price in INR.
2. **Inventory:** "Track quantity" **on**, quantity = pieces in stock. **Sold out means the edition is complete**, not stock at 0: a piece is sold out when `av.edition_placed` reaches `av.edition_total` (or when Shopify itself stops the sale). So for a piece with an open edition, "Continue selling when out of stock" must be **ON** — at 0 it reads "Made to order" on tiles, rows and the list, and stays orderable; the counts ("3 of 8 left", "pieces remain") come from the two metafields. Once the edition is complete the theme shows "Sold out", "All 8 placed" and the notify-me form. A piece with no `av.edition_total` keeps the plain inventory rule: tracked and at 0 is sold out.
3. **Tag** with its tier: `everyday` or `occasion` (drives the Products page filter tabs).
4. Add to its numbered collection.
5. Fill the `av.*` metafields (§2). Upload photographs in order — the first is the lead image.

## 4. Collections

- **One manual collection per numbered collection** (e.g. "Collection 001"), default template, with `av.drop` pointing at the `drop` entry.
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
