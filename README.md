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

### The live demos

`/live-demos` carries three demo blocks. Each is self-contained, each runs on synthetic data by
default, and each has a second path that calls a real model.

| Block | Demo | The simulated half | The live half |
|---|---|---|---|
| [61-content.html](pages/live-demos/61-content.html) | Denial Recovery | Five canned EOB scenarios | Paste your own EOB, lead-gated, `POST /` |
| [62-triage.html](pages/live-demos/62-triage.html) | Fax Triage | A busy morning of synthetic faxes | Paste your own fax, lead-gated, `POST /api/triage` |
| [63-benefits.html](pages/live-demos/63-benefits.html) | Benefit Check, CPT 95165 | The panel plotted on a calendar you can scrub | Read a payer policy, lead-gated, `POST /api/policy` |

All four routes live on **one Cloudflare Worker**, whose real source is
[backend/live-worker](backend/live-worker). It runs Cloudflare Workers AI (Llama) through the
`AI` binding, not Claude: the demos are badged "Built on Claude" because that is what Silstone
builds for clients, not a claim about the demo plumbing. See that folder's README before
touching it, and note the warning there about `backend/underpayment-worker`, which is an
undeployed scaffold that must never be deployed over the live Worker.

**Every live half degrades rather than breaks.** If its route is unreachable, demo 2 falls back
to a client-side heuristic, and demo 3 says so in the status line rather than showing a broken
panel. A demo that half-works on a preview URL is worth more than one that shows an error.

**The "notify me about the next demo" signup belongs to the LAST block on the page.** It moved
61 → 62 → 63 as demos were added; move it again if a block 64 lands, or the page ends up with
two of them.

Block 63's live half is the only one that reads a document nobody has to redact: a payer's
published medical policy is public, so it sits behind a lead gate without ever going near PHI.

Its earlier version asked for eight practice numbers and returned a modelled report. That was
dropped on 2026-09-10: entering numbers and getting prose back is a calculator, not a
demonstration, and it showed the agent doing nothing only an agent could do. Reading a policy
does.

#### Why block 63 is not another queue

Demos 1 and 2 are both document-shaped: something arrives, the agent reads it, you work a list.
Block 63 started out the same way and it was the wrong shape, because the subject is not a pile.
A series runs three to five years; the plan year, the dose cap and the authorization paying for
it do not. **That is a calendar problem, so the demo is a calendar.**

Every patient is a lane running left to right across a 42-month board, and the legend is split
into what the **bar** means and what the **markers** mean, because they answer different
questions. The bar is the state: teal funded, coral hatch for series with nothing paying for
them, violet stripes over teal where the payer pays for only part of every vial, amber stripes
over teal where it is covered but the patient carries it. The markers are the causes: a neutral
grey dot for a plan-year rollover (the one event that is not a problem), violet for an
authorization expiring, amber for a dose bank running out, coral for coverage ending.

Two rules hold that together. **Each hue means one thing** — coral is only ever "nothing is
paying", which is why a part-paid vial had to move off it. And **the legend swatches are layered
exactly as a lane draws them**, stripes over the funded teal rather than over the panel, so the
legend cannot show a colour the chart never produces. Three things follow from that
shape and none of them would work in a list:

- **The scrubber.** Drag the handle and the whole book walks into the future. Two of the four
  counters are read at the cursor, so you watch patients cross into their own gaps: two exposed
  today, four by next spring, then fewer as series finish. That sentence is the entire pitch and
  the chart makes it without anyone writing it down.
- **Approving an action heals the lane.** Sign the authorization renewal and the coral collapses
  to teal in place, with the months it recovered floating up off the button. The counter is
  measured as the gap it actually closed (`projectGain`), so the number and the bar can never
  disagree.
- **Some gaps do not close.** The COBRA termination and the exhausted benefit maximum have no
  action that recovers a month, so "Close every gap you can" leaves them coral and says so:
  *"91 patient-months recovered · 2 gaps a click cannot close."* A demo that healed everything
  would be a better advertisement and a worse description of the job.

The panel is weighted so most lanes are funded, with four guaranteed problems dealt on top. A
board showing half the practice in coral would not be believable.

#### The half you can run on a real document

Under the board sits the policy reader, and the two are the same story told twice. Every rule the
board enforces (Ambetter pays ten doses a vial, this plan wants a precert) came out of a payer's
medical policy. So: paste one in, and the agent pulls out the handful of sentences that decide
whether 95165 gets paid, **quoting the sentence each rule came from**.

Every quote is matched back against the pasted text server-side before it is shown, and there
are **three** answers, not two. A span copied as written is badged "Found in your document". One
that only matches after folding the characters an OCR engine confuses (`1`/`l`/`i`, `0`/`o`,
`5`/`s`) is badged "Matched through scan noise", because a faxed policy reads `al1quot` where the
model quotes `aliquot` and that is the same sentence, not an invented one. Anything that matches
neither is flagged rather than hidden, and is not allowed to move the board. A rule with no quote
at all is reported as something the policy never states, which is a finding in its own right.

The third sample is there to prove that distinction rather than assert it: a policy that arrived
by fax, half-scanned, with two pages missing and OCR damage throughout. It yields four rules,
three of them salvaged through the noise, and one flagged because the model stitched its quote
across an `[illegible]` gap. That last one is the check earning its keep.

Then "Re-run the board under this policy" applies the extracted rules to the whole panel: a
ten-dose vial cap gives every lane the leak stripe, an annual cap turns funded lanes into ones
that run dry before the plan year rolls over, a precert requirement stops the vials due to be
re-mixed. A banner says what changed and what it declined to model, and Restore puts the panel
back exactly.

The runway maths needs one number no policy contains: how fast a dose bank is actually drawn
down. That is **an input, not an assumption baked into the code** - a doses-a-month control sits
in the apply bar and again in the banner, so you can argue with it while looking at what it
produced. Changing it re-runs the policy from the untouched panel rather than stacking a second
pass on the first. On the sample panel, one dose a month leaves seven lanes unfunded and twelve
leaves all sixteen.

### Light mode on the live demos

The site is dark everywhere except the **live demos**, which carry a Light/Dark switch. The
reason is the audience: a lot of the people we send to `/live-demos` are older physicians, and a
dense claim table or fax queue on a near-black canvas is genuinely harder for them to read than
the same table on paper.

**The scope is the interactive surfaces, and nothing else.** Flipping a switch turns the document
window, the claim table, the stat tiles and the queue into light cards on the dark page. It does
not touch a single sentence you are *reading*: the heading, the intro copy, the captions,
"Analysis Complete", the "why not just paste this into ChatGPT" explainer, the section, the nav
and the footer all keep the page's own ink in both modes. The switch changes the thing you
operate, not the page you read.

Each demo has its own switch and its own remembered setting, since the demos are read one at a
time. A demo opts in with `data-sil-themed="<id>"` on its container — but **that attribute is
only a flag.** The palette is set on the *cards inside* the demo, never on the container, and
that is what keeps the prose out of it.

| Demo | container (the flag) | id / storage key |
|---|---|---|
| [61-content.html](pages/live-demos/61-content.html) — Denial Recovery | `#drDemo` | `denial-recovery` |
| [62-triage.html](pages/live-demos/62-triage.html) — Fax Triage | `#trgDemo` | `fax-triage` |
| [63-benefits.html](pages/live-demos/63-benefits.html) — Benefit Check | `#bvDemo` | `benefit-check` |

**Adding a demo** means adding its cards to the surface list at the top of section 18 in
[silstone.css](assets/silstone.css) — and only its cards. Anything left off the list keeps the
dark page's ink, which is exactly how the prose stays put. Deliberately absent today: `.drd-why`
and `.drd-book-cta` (marketing copy that happens to sit in a card), `.drd-steps` and the
`.*-controls` rows (bare chrome with no surface of their own).

Below the palette, four things are worth knowing, because each one cost a real bug:

- **a card owns its ink as well as its ground.** `color` is set on `.sil-root`, far outside the
  card, so text that inherits it rather than naming `--text-primary` kept the page's near-white
  on a white card.
- **surfaces drawn as a border or a wash need a ground.** `.drd-table` is a border with no fill,
  and the caution notes are a translucent tint — fine over a dark section, invisible once they
  carry dark ink on the dark page. Both get a real background in light mode.
- **aliases derived on the container have to be re-derived on the card.** `--p1: var(--coral-500)`
  resolves up on `.trg-demo`, against the dark ramp, and inherits down as a finished colour, so
  the swap never reaches it. Every `--alias: var(--ramp-step)` a demo declares on its container
  needs repeating in the palette block. This is the easiest one to forget.
- **each block's own `<style>` is inlined after this sheet**, so an override that merely ties on
  specificity loses. The rules correcting baked-in dark-ground colours carry a doubled
  `[data-sil-theme][data-sil-themed]` prefix to win.

Behaviour, in [silstone.js](assets/silstone.js):

- with **no** stored choice a demo follows the reader's OS setting, so someone who already runs
  everything in light mode never has to find the switch
- each demo carries a tiny inline bootstrap that reads its own key and sets the flag *while the
  demo is still parsing*, so a returning reader never sees the wrong theme paint first
- in the Hostinger embed flow each block is its own iframe, so the same demo open twice stays in
  step through the `storage` event — keyed by id, so one demo never disturbs another

Both modes are measured per demo, each run to completion with every hidden state forced open,
compositing translucent tints against their real backgrounds. At rest: **0 pairings below the
WCAG AA bar** in either mode, worst case 4.6:1 light and 4.7:1 dark across demos 2 and 3, and
4.9:1 on the benefit board. Dark mode is otherwise untouched — the containers stay fully
transparent, with no padding or radius added, and every card keeps the exact background it
always had.

Getting there needed one token moved. `--text-quaternary` was tuned against `--bg-canvas`, where
it measures 4.7:1, but the demos spend it on `--bg-surface-raised` and `--bg-surface-3` — lighter
grounds — so every mono label on a card sat at 4.25 to 4.48:1, under the bar by a hair, in all
three demos. Section 18 now lifts it to `#878793` **inside demo panels only**, which clears the
whole set without touching the token anywhere else on the site, where it is still used against
the canvas it was measured on. Light mode sets its own on the cards and already measured 5.8:1.

One known exception, pre-existing and outside the panels' resting state: while demo 1's scan
animation is running, a flagged document line puts `--text-tertiary` on a warm tint at
**3.84:1** for a few seconds. It is a transient view of demo 1's animation, not a resting
pairing, and fixing it means retuning that demo's scan styling.

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
