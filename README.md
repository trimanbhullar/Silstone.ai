# Silstone.AI website rebuild: Hostinger handoff

Homepage rebuilt as **13 paste-ready, self-contained embed blocks**. There is **no global
code** to install: the stylesheet + runtime is baked into every block. No build step for the
site, no CDN dependency except Google Fonts.

---

## 1. Add the blocks

Every file in [sections/](sections/) and [pages/](pages/) is one complete Hostinger **Embed
code** element that needs nothing else — the styles and runtime are baked in at the top of the
file (between the `SIL:GLOBAL` markers), so a single paste works on its own and renders in
Preview. There is **no "Custom code" / Integrations step at all**, and nothing else to paste.

For each block, add an **Embed code** element, set it to **full width**, and paste the matching
file from `sections/…` (homepage) or `pages/…` (inner pages), in order:

| # | File | Suggested height |
|---|------|------------------|
| 01 | [01-nav.html](sections/01-nav.html) | 76 px |
| 02 | [02-hero.html](sections/02-hero.html) | 940 px |
| 03 | [03-trust-strip.html](sections/03-trust-strip.html) | 210 px |
| 04 | [04-outcomes.html](sections/04-outcomes.html) | 960 px |
| 05 | [05-why-different.html](sections/05-why-different.html) | 960 px |
| 06 | [06-how-it-works.html](sections/06-how-it-works.html) | 870 px |
| 07 | [07-what-we-build.html](sections/07-what-we-build.html) | 1000 px |
| 08 | [08-capabilities.html](sections/08-capabilities.html) | 790 px |
| 09 | [09-wedge.html](sections/09-wedge.html) | 710 px |
| 10 | [10-pricing.html](sections/10-pricing.html) | 680 px |
| 11 | [11-faq.html](sections/11-faq.html) | 990 px |
| 12 | [12-cta.html](sections/12-cta.html) | 550 px |
| 13 | [13-footer.html](sections/13-footer.html) | 450 px |

Heights are measured at 1280 px wide; sections grow taller on mobile, so let the
block auto-size if Hostinger allows it.

## 2b. Add the inner pages

Same method, one Hostinger page per folder in [pages/](pages/). Every inner page is
**nav (01) + its own blocks + final CTA (12) + footer (13)**, so blocks 01, 12 and 13 get
reused on all seven pages.

| Hostinger page | Blocks | Heights |
|---|---|---|
| `/what-we-build` | [20-hero](pages/what-we-build/20-hero.html), [21-products](pages/what-we-build/21-products.html), [22-catalog](pages/what-we-build/22-catalog.html) | 560 / 1320 / 900 px |
| `/why-silstone` | [30-hero](pages/why-silstone/30-hero.html), [31-disciplines](pages/why-silstone/31-disciplines.html), [32-how-we-work](pages/why-silstone/32-how-we-work.html) | 420 / 1120 / 620 px |
| `/pricing` | [40-hero](pages/pricing/40-hero.html), [41-tiers](pages/pricing/41-tiers.html), [42-start](pages/pricing/42-start.html) | 460 / 1150 / 480 px |
| `/trust-and-security` | [50-hero](pages/trust-and-security/50-hero.html), [51-pillars](pages/trust-and-security/51-pillars.html) | 460 / 900 px |
| `/resources` | [60-hero](pages/resources/60-hero.html), [61-content](pages/resources/61-content.html) | 420 / 800 px |
| `/contact` | [70-hero](pages/contact/70-hero.html), [71-form](pages/contact/71-form.html) | 440 / 900 px |

### The two forms are not connected yet

The contact form and the resources email capture both have `action="FORM_ENDPOINT"`.
**Until you change that, they refuse to submit and show a notice** rather than silently
swallowing a real enquiry. Fix by either deleting the `<form>` and dropping Hostinger's
native Form element in its place (easiest, submissions land in Hostinger's inbox), or
pointing `action` at Formspree / Getform / your own endpoint.

The contact form also carries an off-screen honeypot field that silently rejects bots.

The contact page's booking panel is a placeholder: paste your Calendly or Cal.com embed
snippet over that card, or point its button at your booking URL.

**Before publishing:** update the `href` values in the nav and footer to your real
Hostinger page slugs. They currently point at `/what-we-build`, `/why-silstone`,
`/pricing`, `/trust-and-security`, `/resources`, `/contact`.

### Seeing the blocks render

Each block is self-contained, so it renders inline **or** when Hostinger sandboxes it in an
iframe — either way the styles travel with it. It is also visible even if a script never runs:
every "start hidden" animation state is gated behind a `.sil-js` class the runtime adds, so
with no JS the content shows static instead of stuck invisible.

Note that Hostinger's **editing canvas** often shows a generic placeholder box for any Embed
element regardless of its content. That is a builder limitation, not a problem with the block:
use **Preview** or the published page to see it actually render.

## 2c. Full-width sections in Hostinger (edge-to-edge backgrounds)

Hostinger's Website Builder puts every block on a **grid whose container is capped at
~1224px**, so a section background stops short of the screen edges (black bars on the sides)
no matter what the embed's own CSS does — the cap lives on Hostinger's own wrapper, which the
embed can't reach from the inside, and which we can't add an id/class to. The fix is one global
rule that targets **Hostinger's own layout classes** (present on every section, every page), so
there is nothing to add to our blocks and no per-section id to look up.

Paste this **once** into **Settings → Integrations → Custom code**, Save, then **Update
Website**:

```html
<style>
.block-layout, .block-layout--layout {
  max-width: none !important;
  padding-inline: 0 !important;
}
</style>
```

That uncaps the grid site-wide. Our blocks already fill their container (`.sil-root` is
`width:100%`) with the content re-centred at 1200px by `.sil-container`, so every section then
paints edge to edge.

> - This is the **only** thing that goes in Integrations Custom code — it styles Hostinger's
>   grid, not our blocks. The blocks stay self-contained and pasted individually.
> - It **won't show in the editor canvas** — Hostinger sandboxes that. Check the **live URL**
>   after Update Website.
> - It stretches the header/nav too, which is fine here (the nav centres its own content). If a
>   Hostinger element you *don't* want stretched is affected, target a narrower class instead —
>   inspect that section for a unique class and use `.that-class div:nth-of-type(2) { … }`.
> - To go full-width on desktop only, wrap the rule in `@media (min-width: 920px) { … }`.

## 3. Preview locally

```bash
python build-preview.py
```

Writes `preview.html` (homepage) and `preview-<page>.html` for each inner page, mirroring
how Hostinger assembles them. Open any of them in a browser to check changes before pasting.

## Adjusting vertical spacing

Spacing between text and elements is set in **one place**: section 15 of
[assets/silstone.css](assets/silstone.css). Change these four values and the whole site
re-spaces consistently, then re-run `python build-embeds.py`.

```css
--rhythm-tight: var(--space-4);            /* 16px - inside a tight cluster */
--rhythm:       var(--space-5);            /* 20px - heading to body        */
--rhythm-loose: var(--space-6);            /* 24px - label to display type  */
--rhythm-block: clamp(48px, 5.5vw, 72px);  /* heading block to content      */
```

Those rules use compound sibling selectors so they outrank the `.sil-mt-*` utilities in
the markup. That is deliberate: the utilities set a floor, section 15 sets the real rhythm,
so you never have to edit 20 files to retune spacing.

**Captions under buttons** get their own rule at 24px. A pill button has no optical margin below
it, so the standard 20px reads as almost touching. This covers both a caption directly after a
button and one after a button wrapped in its own row div.

---

## Colour system

The palette is the **original Silstone HTML palette**: near-black canvas, violet lead, warm coral
and amber, mint used sparingly.

**Brand teal is threaded through in small doses** so the wordmark reads as part of the system
rather than a leftover, without going back to teal-dominant. It appears in exactly six places:

- the **nav** active underline, link hover, and the hairline under the stuck header
- the **LIVE pill** and one window dot in the hero graphic, plus a teal note in its ambient mesh
- the **"Built on Claude"** chip in the trust strip
- the **footer badges** and link hover, the other place the wordmark sits
- one stop in the **headline gradient**, so display type sweeps violet → teal → coral
- the whole **Trust & security** page, via `.acc-teal`

Everything else stays violet-led.

**Each section carries its own accent.** Put one class on a `.sil-section` and its eyebrow, icons,
tags, meters, chart accents, card rim, cursor glow and ambient mesh all re-tint together:

| Class | Hue | Used on |
|---|---|---|
| *(none)* | Violet `#7C6BF0` | Hero, What we build, Pricing, Final CTA, page heroes |
| `.acc-peri` | Periwinkle `#A594FF` | Outcomes, Capabilities, FAQ, tier tables, contact form |
| `.acc-coral` | Coral `#FF9E7A` | Why we're different, Why Silstone |
| `.acc-amber` | Amber `#EFC178` | How it works, The wedge, Resources, Start with a number |
| `.acc-teal` | Brand teal `#2DD9D3` | Trust & security |
| `.acc-mint` | Mint `#5EE0A8` | Available, currently unused |

A single card can override too: `style="--sec-rgb:255,158,122"`. That is how the four capability
cards each carry a different hue.

### Trios

**Any group of three cycles violet → coral → teal.** Add `sil-trio` to the container and its three
children each re-derive their own accent, so the whole item (eyebrow, tag, icon tile, meter, card
rim, hover glow) follows:

```html
<div class="sil-grid c3 sil-trio"> … three cards … </div>
```

Where something sits between the items in the DOM, put `sil-trio-1` / `-2` / `-3` on the items
directly instead. The How it works steps use this because connector arrows are interleaved between
the cards, which would throw off `:nth-child`.

Currently applied to: the three proof cards on Why we're different, the three How it works steps,
the three pricing parts, the three footer badges, and both three-item lists on What we build.

### Longer sequences

`sil-seq` walks the full palette across six items, cool to warm to cool:
**violet → periwinkle → coral → amber → mint → teal**, repeating every six. Used on the six-step
engagement timeline so each step is distinct and the row reads as progress rather than repetition.

```html
<ol class="sil-timeline sil-seq"> … six steps … </ol>
```

## Text inside shapes

Two rules learned the hard way while building the Venn diagram:

**A circle is only as wide as its diameter at the vertical centre.** Near the top or bottom there
is far less room, so a label that looks centred will spill past the curve. All three Venn labels
sit on the centreline (`y=100`, matching `cy`) for this reason.

**Only single words go inside a shape.** Descriptions live in the legend below the diagram, where
normal typography rules apply. The earlier version had six of ten labels breaking outside their
circles because it tried to fit three lines of text into each one.

There is a containment check in the session notes: for each SVG label, measure the furthest corner
of its bounding box from the circle centre and compare against `r`. If corner distance exceeds the
radius, it is clipping.

Everything is tuned low on purpose: glows around 20% opacity, ambient mesh under 15%, section
tints at 5%. Colour should register as a shift in mood between sections, not as decoration.

Colour never carries meaning alone: every accent is paired with a label, position or value, so
nothing is lost for a colour-blind reader.

### Contrast

All accent-on-dark pairings were measured with the translucent tints properly composited:
eyebrows land between **7.0:1 and 12.6:1**, status chips **6.8:1 to 11.6:1**, teal elements
**11.4:1 to 13.2:1**, nav links **7.3:1**, primary button **5.4:1**, body copy **7.1:1**.
`--text-quaternary` was lifted from `#6A6A75` to `#7A7A86` because the original measured 3.7:1,
below the 4.5:1 bar for the small mono footnotes.

## Design system compliance

Built from the official system in [design-system/](design-system/) (your zip, copied in for
reference). Kept as-is: dark canvas with an alternating section rhythm, Poppins display + Inter
body + IBM Plex Mono labels, pill buttons, cards as dark surface + 1px hairline that lights on
hover, the FAQ `+` glyph rotating to a cross, Title Case headings with trailing periods, the
bold-word emphasis rhythm in pitch copy, and no emoji anywhere.

Departed from it deliberately, at your direction: the guide specifies a strict monochrome-plus-teal
system with no gradients. This build leads violet with warm support hues and uses gradients for
headline text, ambient mesh and the hero graphic.

## Your feedback, addressed

- **Fold 1 needs a visual.** The hero carries a live canvas graphic: documents flow into the agent,
  completed actions flow out. Nodes lean toward your cursor, links warm up, the panel tilts in 3D,
  and the stat tiles tick. Pauses when scrolled off screen; respects `prefers-reduced-motion`.
- **Remove em dashes.** Zero em dashes across all 14 files, verified by grep. Prose was rewritten
  rather than just re-punctuated.
- **Add FAQs.** Your 5 questions, used verbatim, plus `FAQPage` JSON-LD so they are eligible for
  Google's FAQ rich results. **See "Open items" for a conflict in question 3 that needs resolving
  before publish.**
- **More graphs and pictures.** Cumulative recovery line chart, hours-returned bar meters,
  contracted-vs-paid grouped bar chart with variance labels, an animated engagement timeline, a
  two-disciplines Venn, a knowledge-brain ingest-to-citation flow, and an agent action queue.

## Two things I changed on purpose

**No client logo row.** Your reference screenshot showed Cleveland Clinic, HCA, Banner Health,
UCLA Health, Waystar and MedArrive under "TRUSTED BY". Those came from an AI-generated mockup.
Naming real health systems you do not have signed logo-use agreements with is a legal and
reputational risk, so section 03 is a non-attributive trust strip instead. Swap in real logos once
you have written permission.

**No SOC 2 claim.** The same screenshot claimed "HIPAA & SOC 2 Compliant" and "50+ Healthcare
Clients". Your own source content claims only a HIPAA BAA on AWS Bedrock, so that is all the site
claims. Add SOC 2 back when you hold the attestation.

## Open items

- **FAQ question 3 contradicts the rest of the site.** Your copy says agents integrate with
  "CRMs, ERPs, **EHRs**, APIs...". EHR and EMR are the same system, and **"No EMR integration" is
  stated as a core promise in four other sections** (hero prop, trust strip chip, capabilities
  guardrail, footer strapline). A prospect who reads both will notice. Either keep the promise and
  use the drop-in replacement commented into [11-faq.html](sections/11-faq.html), or, if the offer
  genuinely now includes EHR integration, strip the no-EMR claims from sections 02, 03, 08 and 13.
  Pick one; right now the page argues with itself.
- **The new FAQ copy is cross-industry, the rest of the page is healthcare-native.** Your questions
  talk about "your business" and generic automation; every other section talks about practices,
  payers and remittances. Not wrong, just a register shift a reader may feel. Worth a pass if the
  homepage is meant to stay healthcare-only.
- **SOC 2 wording is fine as written.** I flagged the earlier screenshot for claiming "SOC 2
  Compliant" outright. Your FAQ says you "build solutions that support compliance frameworks such
  as HIPAA, GDPR, and SOC 2", which is a claim about what you build, not a claim to hold the
  attestation. Kept verbatim. Do not shorten it to "SOC 2 compliant" unless you hold the report.
- **Fonts are substitutes.** The design system flags that real Silstone webfont files were never
  supplied, so Poppins and Inter stand in for the wordmark's geometric sans. If you have the real
  files, swap the `@import` at the top of [assets/silstone.css](assets/silstone.css) for
  `@font-face` rules and everything follows (then re-run `python build-embeds.py`).
- **Logo is inlined** as a base64 data URI in the nav and footer so it works with zero setup
  (~11 KB each). Upload `brand/logo-mark.png` to Hostinger's media library and replace the two
  `src` values to trim that.
- **Verify the metrics.** `$312K`, `1,900+`, `3 wks`, `40+`, and the sample review figures come
  straight from your source HTML. If any are modelled rather than measured, both sections have a
  footnote slot ready.
- **Wire up the two forms** before launch. See "The two forms are not connected yet" above.
- **Add your booking embed** on the contact page.

## Files

```
sections/              homepage, 13 self-contained embed blocks (paste these)
pages/                 six inner pages, self-contained blocks (paste these)
assets/                silstone.css + silstone.js -- the shared source of truth
SEO-COPY.md            site + page descriptions, titles, social card, favicon
brand/                 real logo + hero still from the design system
build-embeds.py        re-bakes assets/ into every section + page in place
build-preview.py       local preview assembler
design-system/         your zip, unpacked, for reference
preview*.html          generated, not for Hostinger
```
