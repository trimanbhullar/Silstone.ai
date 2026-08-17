# Silstone.AI: Hostinger copy for descriptions and SEO

Everything here is copy-paste ready. Claims are limited to what your own content supports:
healthcare-native positioning, live in weeks, no EMR integration, HIPAA BAA on AWS Bedrock.
**No SOC 2 and no client names**, for the reasons in the main README.

---

## 1. Website name and description

**Where:** Settings (gear) → General

| Field | Value |
|---|---|
| Website name | `Silstone.AI` |
| Website description | see below |

**Website description** (short, used in the builder and some share cards):

```
AI agents for healthcare, built by people who have run healthcare. Custom agents on Claude, live in weeks, with no EMR integration.
```

**If Hostinger asks for a longer brief** (the AI site generator prompt, or an "about this site" field):

```
Silstone.AI is a healthcare-native AI studio. We design, build and deploy custom AI agents that automate back-office work for medical practices: payer underpayment recovery, credentialing portals, denials and appeals, prior authorization and inbound fax triage. We work from your exports, documents and portals rather than integrating with your EMR, so most builds are live in weeks. Anything touching PHI runs on AWS Bedrock under a full HIPAA Business Associate Agreement, with a human approving every action.
```

---

## 2. Page titles and meta descriptions

**Where:** Pages menu → hover a page → gear icon → Page settings → SEO
(or Settings → SEO, then pick the page)

### Home
- **Page title:** `AI Agents for Healthcare | Silstone.AI`
- **Description:**
```
Custom AI agents for healthcare practices, built by people who have run healthcare. Live in weeks, no EMR integration, PHI under a full HIPAA BAA.
```

### What we build
- **Page title:** `What We Build | Silstone.AI`
- **Description:**
```
A cited knowledge brain your staff can ask anything, plus custom agents that clear the fax pile, chase underpayments and run portals that have no API.
```

### Why Silstone
- **Page title:** `Why Silstone | Healthcare-Native AI Studio`
- **Description:**
```
Built inside healthcare, not adjacent to it. Years of practice operations plus years shipping healthcare software, in one small and senior team.
```

### Pricing
- **Page title:** `Pricing | Silstone.AI`
- **Description:**
```
Priced in three parts so incentives stay honest: a build fee to stand it up, a monthly subscription to run it, and an outcome slice tied to the result.
```

### Trust & security
- **Page title:** `Trust & Security | Silstone.AI`
- **Description:**
```
No EMR integration by design. PHI runs on AWS Bedrock under a full HIPAA BAA, with a human approving every action before anything is filed, sent or paid.
```

### Live Demos  (was "Resources"; slug is now /live-demos, 301 from /resources)
- **Page title:** `Live Demos | Try a Healthcare AI Agent | Silstone.AI`
- **Description:**
```
Run a free, interactive healthcare AI agent right in your browser, no signup. See how a Silstone agent answers questions and handles admin, built on Claude.
```

### Contact
- **Page title:** `Book a Scoping Call | Silstone.AI`
- **Description:**
```
Book a 20 minute scoping call. We will find where your time and money is leaking and tell you honestly whether we can help. No integration, no obligation.
```

---

## 3. Social share card

**Where:** Settings → Social share preview (Hostinger calls this the Open Graph image and text)

- **Title:** `AI agents for healthcare, built by people who have run healthcare`
- **Description:**
```
Custom agents on Claude that clear the fax pile, chase payer underpayments and run credentialing portals. Live in weeks, no EMR integration.
```
- **Image:** use `brand/hero-still.jpg` from this repo (1440x756, the dark wordmark still).
  Hostinger will crop to roughly 1200x630, and the wordmark sits centred, so it survives the crop.

---

## 4. Favicon

**Where:** Settings → General → Favicon

Use `brand/logo-mark.png`. It is the full lockup at 768x111, so **crop it to the square teal
circuit glyph on the left before uploading**, otherwise the wordmark will be illegible at 32x32.

---

## 5. Notes

- **Do not let Hostinger's AI rewrite these.** Its SEO assistant tends to add superlatives and
  invent credentials. Every line above is traceable to your own source content.
- **Descriptions are sized for Google**, which truncates around 155 characters on desktop. All
  seven land between 142 and 152, so none get cut mid-sentence.
- **Titles are under 60 characters** so they display in full in search results.
- **The `&` in "Trust & Security"** renders fine in Hostinger's SEO fields. Only the HTML blocks
  need `&amp;`.
- If you change the FAQ questions, update the JSON-LD in `sections/11-faq.html` to match, or the
  structured data will disagree with the visible page.
