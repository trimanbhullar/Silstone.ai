# The live demo backend (this is the one that is actually deployed)

`worker.js` in this folder **is** the Worker serving all three live demos at
`https://dental-denial-agent.denial-agent.workers.dev`. It was pulled down from
Cloudflare on 2026-09-10 and is now kept here so the source is version
controlled rather than living only in the dashboard.

```bash
cd backend/live-worker
npx wrangler deploy --no-bundle
```

`--no-bundle` matters: `worker.js` is already the bundled artifact Cloudflare
serves, and re-bundling it would only add noise to the diff.

---

## Routes

| Route | Demo | What it does |
|---|---|---|
| `POST /api/analyze` | [Denial Recovery](../../pages/live-demos/61-content.html) | Reads a pasted EOB, classifies every claim line |
| `POST /api/triage` | [Fax Triage](../../pages/live-demos/62-triage.html) | Reads one inbound fax, assigns a priority band |
| `POST /api/policy` | [Benefit Check](../../pages/live-demos/63-benefits.html) | Reads a payer's immunotherapy policy, extracts the 95165 rules |
| `POST /api/email` | shared | Sends a demo result on by email (Resend) |

Anything else returns `404 {"error":"Not found"}`.

## What it runs on

**Cloudflare Workers AI**, model `@cf/meta/llama-4-scout-17b-16e-instruct`, via
the `AI` binding. There is no Anthropic or OpenAI key on this account and none
is needed.

> The demo pages are badged "Built on Claude". That is a statement about what
> Silstone builds for clients, not about this Worker. Deliberate, per the
> 2026-09-10 decision: production solutions run on Claude, the marketing demos
> run on whatever is cheapest to host. Noted here so nobody "fixes" the badge or
> goes looking for an `ANTHROPIC_API_KEY` that was never there.

Bindings, both of which must survive any deploy:

| Binding | Type | Notes |
|---|---|---|
| `AI` | Workers AI | declared in `wrangler.toml` |
| `RESEND_API_KEY` | secret | set in the dashboard, **not** in `wrangler.toml`; wrangler preserves it |

## `POST /api/policy`, the newest route

Takes `{ "policy": "<text>" }` and returns the rules that decide whether CPT
95165 gets paid, each with the sentence it came from:

```json
{
  "payer": "Meridian Health Plan",
  "policyRef": "MP-ALL-014",
  "summary": "...",
  "rules": [{ "key": "dosesPerVial", "label": "Doses paid per vial",
              "value": "max 10 doses per vial", "quote": "<verbatim span>",
              "verified": true, "confidence": 0.95, "consequence": "..." }],
  "notFound": [{ "key": "benefitMax", "label": "Annual benefit maximum" }],
  "stats": { "extracted": 5, "verified": 5, "silent": 2 },
  "apply": { "dosesPerVial": 10, "dosesPerYear": null, "precert": true, "benefitMax": null }
}
```

Three things in there are worth not breaking:

- **`verified` is checked, not claimed.** Every quote is matched back against
  the text the reader pasted, on whitespace-and-case-normalised strings so
  ordinary reflow does not cause a false negative. A quote that is not in the
  document comes back `verified: false` and the demo shows it flagged rather
  than hiding it. A citation nobody checked is just a confident-looking
  sentence.
- **No quote means silent, not unverified.** A rule the model returns with no
  usable quote is moved to `notFound`. "This policy never states a per-vial cap"
  is a finding; "the citation failed" is a different one, and they must not look
  alike.
- **Only verified rules reach `apply`.** `apply` is what the front end re-runs
  its coverage board against, so an unverified read may be shown to a reader but
  may never move a chart.

## Testing a route

```bash
curl -s -X POST https://dental-denial-agent.denial-agent.workers.dev/api/policy \
  -H "Content-Type: application/json" \
  -d "{\"policy\": \"$(cat some-policy.txt)\"}" | python -m json.tool
```

---

## Do not deploy `../underpayment-worker`

That folder is an **undeployed scaffold** and has drifted a long way from
reality: it targets a different Worker name (`silstone-underpayment-demo`),
routes differently, returns different error strings, and calls the Anthropic and
OpenAI APIs with secrets this account does not have. Running `wrangler deploy`
in it would either publish a second, broken Worker or, if you changed the name,
overwrite the one all three demos depend on. It is kept only for the prompt text
in it. **This folder is the source of truth.**
