# Underpayment demo backend (Cloudflare Worker)

Turns the "run on your own EOB" flow into a **real** analysis: the browser sends
an EOB, this Worker calls Claude, and returns JSON the demo animates.

The `ANTHROPIC_API_KEY` lives only in Cloudflare's encrypted secrets — it is
never shipped to the browser.

> ⚠️ **Public demo, not for real PHI.** Run this on sample / de-identified EOBs.
> Real patient data needs a HIPAA BAA covering Anthropic **and** your host — that
> path is Bedrock/Vertex behind a login, not this public endpoint.

---

## Deploy (5 minutes)

```bash
cd "backend/underpayment-worker"
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY   # paste your Anthropic key when prompted
npx wrangler deploy
```

`wrangler deploy` prints your endpoint, e.g.
`https://silstone-underpayment-demo.<your-subdomain>.workers.dev`.
(Optionally map it to `demo.silstone.ai/underpayment` via the `routes` line in
`wrangler.toml`.)

Test it:

```bash
curl -X POST https://silstone-underpayment-demo.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"eob":"D2392 Composite 1 surf  billed 230.00 paid 110.00 CO-45\nD4342 SRP quadrant billed 385.00 paid 0.00 OA-23"}'
```

You should get back `{ payer, docLines, findings, claims }`.

---

## Wire it into the demo

The demo's animation (`drRun`) reads a data object shaped exactly like this
Worker's response. Two changes turn the canned demo into a live one.

### 1. Let the animation accept live data

In the demo's `<script>` (the `(function(){ ... })();` block), change the top of
`drRun` so it uses live data when present:

```js
var drLiveData = null;            // add near `var drSel = null;`

async function drRun(){
  var data = drLiveData || D[drSel];   // <-- was: var data = D[drSel];
  if(!data) return;
  // ...rest of drRun unchanged...
}
```

### 2. Add the "analyze my EOB" call

Add this function inside the same IIFE, and expose it (next to the other
`window.dr* = dr*` lines):

```js
// Point this at your deployed Worker URL:
var DR_ENDPOINT = "https://silstone-underpayment-demo.<your-subdomain>.workers.dev";

async function drRunOwnEob(eobText){
  var msg = document.getElementById('drLiveMsg');
  if(msg){ msg.textContent = 'Analyzing…'; msg.className = 'dr-live-msg'; }
  try{
    var r = await fetch(DR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eob: eobText })
    });
    var data = await r.json();
    if(!r.ok || data.error){ throw new Error(data.error || 'Analysis failed'); }
    if(msg){ msg.textContent = ''; }
    drLiveData = data;      // feed the real result into the animation
    drSel = null;           // ignore any selected sample card
    await drRun();
    drLiveData = null;      // reset for next run
  }catch(e){
    if(msg){ msg.textContent = 'Could not analyze that EOB — try the sample data. (' + e.message + ')'; msg.className = 'dr-live-msg is-warn'; }
    drLiveData = null;
  }
}
window.drRunOwnEob = drRunOwnEob;
```

### 3. Give people somewhere to paste

Inside the "own data" panel (the lead gate, after email capture — or a new panel),
add a textarea, a submit button, and the "no real PHI" notice:

```html
<label class="sil-sr" for="drEobText">Paste your EOB</label>
<textarea id="drEobText" rows="6"
  placeholder="Paste EOB text here (sample or de-identified data only)"></textarea>
<button type="button" class="dr-rbtn"
  onclick="drRunOwnEob(document.getElementById('drEobText').value)">
  Analyze my EOB
</button>
<p class="dr-priv">Use sample or de-identified data only — please don't paste real patient information.</p>
<p class="dr-live-msg" id="drLiveMsg" role="status" aria-live="polite"></p>
```

That's the whole integration. The lead-capture form (Web3Forms) stays as-is; this
just adds a real analysis path beside it.

---

## Before you go live

- **Bot check + rate limit.** Add [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
  and a KV-backed per-IP limit in `src/index.js` (marked with a TODO) so nobody
  can run up your Claude bill from the public endpoint.
- **Model / cost.** Default is `claude-sonnet-5` (~$3/$15 per M tokens). For a
  cheaper/faster pass set `CLAUDE_MODEL = "claude-haiku-4-5"` in `wrangler.toml`;
  for maximum quality use `claude-opus-5`.
- **PDF upload (optional).** The Worker already accepts `{ "pdf_base64": "..." }`
  (a base64 PDF, no `data:` prefix, no newlines) so you can let people drop an
  EOB PDF instead of pasting text.

---

## The other two routes on this Worker

One Worker backs all three live demos. The default POST path is the EOB analyzer
above; two extra routes hang off it.

| Route | Demo | Model | Key |
|---|---|---|---|
| `POST /` | Denial Recovery ([61-content.html](../../pages/live-demos/61-content.html)) | `CLAUDE_MODEL` (Sonnet 5) | `ANTHROPIC_API_KEY` |
| `POST /api/triage` | Fax Triage ([62-triage.html](../../pages/live-demos/62-triage.html)) | `OPENAI_MODEL` (GPT-4o-mini) | `OPENAI_API_KEY` |
| `POST /api/allergy` | Benefit Check ([63-benefits.html](../../pages/live-demos/63-benefits.html)) | `ALLERGY_MODEL` (Opus 5) | `ANTHROPIC_API_KEY` |

### `POST /api/allergy` — the CPT 95165 exposure map

Takes a practice profile, returns a modelled map of where the manual benefit
work goes. No PHI: eight practice-level numbers, nothing patient-level.

```bash
curl -X POST https://dental-denial-agent.denial-agent.workers.dev/api/allergy \
  -H "Content-Type: application/json" \
  -d '{"profile":{"patients":140,"visitsPerWeek":110,"vialsPerWeek":30,
       "payers":9,"denialsPerMonth":14,"claimValue":95,"hourlyCost":28,
       "whoVerifies":"the front desk"}}'
```

Returns `{ headline, hoursPerMonth, costPerMonth, atRiskPerMonth, sinks[],
lapseRisk, quickWins[], noEmr[], profile }`. Every field is clamped and echoed
back in `profile`, so the front end renders what was actually modelled rather
than what was typed.

It uses the Messages API over plain `fetch` with `output_config.format` set to
the response schema, rather than the Anthropic SDK the EOB route imports. That
is deliberate: it makes the block paste-able into the dashboard Worker with no
bundler, exactly like the `/triage` route.

**The demo works without this route.** If it 404s or times out, the front end
falls back to a client-side estimator whose per-task minute assumptions are
written into the source, and labels the result "Offline estimate" instead of
"Claude". Shipping the route is what turns it into a real answer.

**To add it to the deployed Worker:** paste
[../allergy-benefits-route.snippet.js](../allergy-benefits-route.snippet.js) at
module scope in the dashboard editor and add the one route branch it documents.
`wrangler deploy` from this folder does it for you, since `src/index.js` already
carries the same code.
