# Silstone.AI — Design System

Silstone.AI (Silstone Group) is a small B2B AI consultancy / product studio. Their positioning:
**"Your On-Demand AI Product Team"** — they partner with founders, product leaders, and
engineering teams to design, build, and ship AI-powered features that work in production.
They work across industries (biotech, finance, manufacturing, healthcare, logistics, retail,
energy) delivering AI strategy consulting, agents/copilots, prediction engines, document
processing, and automation pipelines. Typical engagement: Prototype (2–4wk) → MVP (6–10wk) →
Full system (2–4mo). Contact: sales@silstonegroup.com / +1 613 558 5913.

**Products represented:** the company has one public-facing surface — its marketing website
(home, blog, contact). There is no separate app product, docs site, or internal tool exposed
publicly. This design system therefore centers on the marketing site's brand system, componentized
so it can be reused for new landing pages, decks, or one-off assets in the same voice.

## Sources

- **Live site:** https://www.silstone.ai/ (also `/blog-list`, `/contact`) — read via text
  extraction and image downloads on 2026-07-10. No Figma file, GitHub repo, or codebase was
  provided or mentioned by the user; the live site is the sole source of truth.
- The site is built on **Hostinger's website builder** (per its own `meta-generator` tag), a
  no-code SaaS site builder — meaning there is no underlying component codebase to inspect;
  everything here was reconstructed from the rendered page content, downloaded images, and
  sampled pixel colors.
- Partner reference: **aicobuilders.com** (co-branding lockup shown on the homepage).

## No logo generated — real assets used

The real Silstone.AI wordmark (a teal circuit-node icon + "SILSTONE" in white + ".AI" in teal)
was downloaded directly from the live site and lives at `assets/logo-mark.png` and
`assets/hero-still.jpg`. No logo was invented.

## ⚠️ Font substitution flag

The live site does not expose downloadable webfont files (Hostinger serves rendered pages, not
a font asset pipeline we could inspect), and no codebase/Figma was attached. The wordmark uses a
geometric, wide-tracked sans-serif. **We substituted the closest Google Fonts match: Poppins for
display/headings, Inter for body/UI.** See `tokens/typography.css` for details. **If you have the
real brand font files, please share them** and we'll swap the `@font-face` declarations in
`tokens/fonts.css` — every component already reads from `var(--font-display)` / `var(--font-body)`,
so real fonts will propagate everywhere automatically.

## Index

- `styles.css` — root stylesheet, imports every token file below. Link this one file from any
  consuming project.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css` (also holds radius/shadow/motion), `fonts.css`.
- `assets/` — `logo-mark.png` (transparent wordmark), `hero-still.jpg` (dark hero reference still),
  `partner-logo-dark.png` (AI Co-Builder partner lockup), `footer-logos.png` (small footer mark).
- `guidelines/` — foundation specimen cards (colors, type, spacing, radius/shadow, brand marks).
- `components/core/` — `Button`, `Badge`, `Card`.
- `components/feedback/` — `FaqItem`.
- `components/navigation/` — `NavBar`, `Footer`.
- `ui_kits/marketing-site/` — full click-through recreation of the marketing site: `Hero`,
  `Offerings`, `CaseStudy`, `FaqSection`, `ContactPage`, `BlogListPage`, tied together in `index.html`.
- `SKILL.md` — portable skill file for use in Claude Code / other agent contexts.

### Components built

Button, Badge, Card, FaqItem, NavBar, Footer — a standard-set build, since no component library
source was attached (brand-guidelines-only run). Sized to what the marketing site actually uses;
no drawer/dialog/table/etc. were added because the source site doesn't use them.

### Intentional additions

- **Badge** — the site doesn't have a literal "badge" component, but repeatedly uses small
  uppercase pill labels above headings ("What we do", case-study tags). Extracted as a reusable
  primitive.
- **Card** — same reasoning: offering tiles, the case-study teaser, and blog previews all share
  one dark bordered surface with a hover state. Extracted as one component.

## Content fundamentals

See below. See also `guidelines/type-emphasis.html` for a live specimen of the bold-word pattern.

**Tone:** confident, plain-spoken B2B — "we" as the actor, "you/your" for the reader ("**Your**
On-Demand AI Product Team"). No jargon-stacking, no hype adjectives ("revolutionary",
"game-changing") — copy stays grounded ("practical, secure, scalable, and built for real
adoption").

**Casing:** sentence case for body copy and FAQ answers; Title Case for headings ("What we do."
"How it works." "What we build." — note the trailing periods, an intentional quirk). The wordmark
itself is set in full caps with wide tracking.

**Bolding as rhythm, not just emphasis:** the hero paragraph bolds nearly every key noun/adjective
("**founders**", "**product leaders**", "**engineering teams**", "**AI-powered**", "**work in
production**") — it reads almost like it's staccato-highlighting the pitch's keywords rather than
emphasizing one or two words. Reuse this pattern in any hero/pitch copy for the brand.

**Structure:** headings are short declarative fragments ("What we do.", "How it works.", "What we
build."), often followed by a question restating the point ("What AI solutions can Silstone
deliver?"). FAQ questions are asked in second person, direct and skeptical ("Do you only build
chatbots?", "What makes Silstone.AI different?") — answers open with a flat "No." / "Not at
all." / "Absolutely." before elaborating.

**Numbers/specificity:** timelines and metrics are stated plainly and precisely — "Prototype → 2–4
weeks", "speed up delivery by up to 40%" — never vague ("faster", "soon").

**Person:** "we" for the company, "you/your" for the client. No first-person-singular ("I").

**Emoji:** none used anywhere on the site. Do not add emoji to Silstone.AI materials.

**CTAs:** short, verb-first — "Book a strategy call", "Get in touch", "Explore All Offerings →",
"Discover How We Work →". Arrow (→) used to suffix link-style CTAs, never button CTAs.

## Visual foundations

**Overall vibe:** dark, technical, understated — a black canvas with a single teal accent,
closer to a deep-tech/security product than a typical colorful SaaS marketing site. Confident
minimalism over decoration.

**Color:** near-black canvas (`--bg-canvas` / true black `--bg-canvas-true-black` for hero/footer),
single teal accent (`--teal-500`, sampled at `rgb(38,215,209)` / `#2DD9D3`) used sparingly for the
wordmark's ".AI", CTAs, links, and hover states. No secondary brand hue — everything else is white
text on black/near-black surfaces. This is a monochrome-plus-one-accent system; resist the urge to
add a second brand color.

**Type:** geometric sans display face (substituted: Poppins) for headings, set bold and tight; a
neutral workhorse sans (substituted: Inter) for body copy. Headings use tight/negative tracking;
the wordmark uses very wide tracking. No serif anywhere.

**Backgrounds:** the homepage hero uses a full-bleed muted looping video background (dark, subtle
motion, opacity-reduced so text stays legible) rather than a static image or gradient. No hand-drawn
illustration, no repeating pattern/texture, no gradient meshes. Section backgrounds alternate
between near-black and true-black — a very restrained rhythm, not a multi-color system.

**Gradients:** effectively none — the one soft gradient-adjacent effect is the teal "glow" shadow
token (`--shadow-accent-glow`) used sparingly on hover/focus, not a decorative background gradient.

**Animation:** minimal and functional — the hero's looping muted video is the only built-in motion;
otherwise the site is static. Component-level transitions we've added (hover/focus) use quick,
linear-ish easing (`--ease-standard`, 120–200ms) with no bounce/overshoot — consistent with the
brand's serious, technical register.

**Hover states:** primary buttons lighten to `--teal-400` (`--accent-hover`); secondary/outline
buttons flip their border+text to teal; ghost/text links darken slightly on the accent; cards get
a teal-tinted border (`--border-accent`) rather than a shadow lift. Never an opacity-fade-only
hover — always a clear color shift.

**Press/active states:** buttons darken one step further (`--accent-active` / `--teal-600`); no
scale/shrink transform observed or added — color change carries the feedback, not motion.

**Borders:** thin 1px hairlines in `--border-subtle` (`--ink-600`) separating cards/sections on the
dark surface; borders shift to teal only on hover/focus, never as a static decorative accent
(i.e., avoid the "card with colored left border" AI-slop pattern — not present in the source).

**Shadows:** very restrained — soft, low-opacity black drop shadows for elevation
(`--shadow-sm/md/lg`), plus one teal "glow" composite shadow reserved for hover/focus emphasis.
No inner shadows observed.

**Corner radii:** buttons are full pill radius (`--radius-pill`); cards/inputs use a moderate
16px-ish radius (`--radius-lg`) — rounded but not aggressively rounded; small elements (chips,
tags) also pill-shaped.

**Cards:** dark surface (`--bg-surface`, one step lighter than canvas), 1px subtle border, generous
internal padding, border brightens to teal on hover — no drop shadow by default, no colored
left-border accent.

**Transparency/blur:** the hero video is dimmed via opacity, not blurred; no frosted-glass/backdrop-
blur panels observed on the source site — omit blur effects unless a future asset shows them.

**Imagery color vibe:** what imagery exists (hero video, case-study visuals) is cool-toned and
dark/moody, consistent with the black-canvas/teal-accent system — no warm tones, no visible grain.

**Layout:** centered, generous-whitespace marketing sections, `max-width` content column
(~1200px), consistent horizontal gutter that scales with viewport. Sticky/fixed elements: header
appears to scroll normally with the page (not observed to be sticky-fixed); no other fixed
overlays observed.

## Iconography

The site uses **no custom icon system** — no SVG icon sprite, no icon font, no PNG icon set was
found anywhere on the live pages. The only iconographic marks present are the **brand mark itself**
(a small teal circuit/node glyph baked into the logo lockup, see `assets/logo-mark.png`) and a
plain **"+" / "×" toggle glyph** used for the FAQ accordion (implemented as plain text glyphs in
`FaqItem.jsx`, not an icon asset). No emoji, no Unicode-symbol icons, are used as UI iconography
anywhere on the site. If a future need arises for a fuller icon set (e.g. per-offering icons), we
recommend Lucide (CDN) as the closest stroke-style match to the brand's clean, geometric feel —
flagged here as a substitution recommendation, not yet implemented, since the source site simply
doesn't use icons for its offering tiles today (text-only cards).

## Caveats

- Only the public marketing site was available (no Figma, no codebase, no attached assets) — this
  system is reconstructed from the live rendered site, not a canonical source file.
- Font substitution (Poppins/Inter) is a placeholder — see flag above.
- The site has essentially one product surface (marketing site); there was no separate app/product
  UI to build a second UI kit for.
