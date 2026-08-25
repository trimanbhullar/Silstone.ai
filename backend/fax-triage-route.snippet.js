// ===========================================================================
// Silstone — Fax-triage route  (POST /api/triage)   [OpenAI / GPT-4o-mini]
// ---------------------------------------------------------------------------
// Paste-in snippet for the ALREADY-DEPLOYED Worker that powers the live demos
// (dental-denial-agent.denial-agent.workers.dev) — the one linked to your
// OpenAI API key. Self-contained: uses OPENAI_API_KEY via fetch (no SDK) and
// does not depend on the EOB route.
//
// Includes optional bill-protection that is OFF until you configure it:
//   • Per-IP rate limit  — active only if a KV namespace is bound as RATE_LIMIT.
//   • Turnstile check     — active only if the TURNSTILE_SECRET secret is set.
// With neither configured, the route just works (fine for a first ship).
//
// ── HOW TO ADD IT ────────────────────────────────────────────────────────
// Cloudflare dashboard → Workers & Pages → dental-denial-agent → Edit code:
//   1. Paste everything below (the consts + the three functions) at module
//      scope, near the top of the Worker.
//   2. Inside the Worker's `fetch(request, env)` handler, AFTER parsing the JSON
//      body, add this route branch BEFORE the EOB logic (note: pass `request`):
//
//         if (new URL(request.url).pathname.endsWith("/triage")) {
//           return handleTriage(body, env, headers, request);   // headers = your CORS headers
//         }
//
//   3. Ensure your CORS allow-list includes https://www.silstone.ai and
//      https://silstone.ai. The demo POSTs { "fax": "<text>" } and expects the
//      JSON described by TRIAGE_SCHEMA back.
//   4. The OPENAI_API_KEY secret is already set on this Worker. Redeploy.
//
// ── OPTIONAL HARDENING (recommended before heavy public traffic) ──────────
//   Rate limit:  Dashboard → Storage & Databases → KV → create a namespace →
//     bind it to this Worker as variable name RATE_LIMIT. Default 20 req/IP/hr;
//     override with the TRIAGE_RATE_MAX var.
//   Turnstile:   Add a Turnstile widget to the demo's paste form, send its token
//     as { "turnstileToken": "<token>" } alongside "fax", and set the
//     TURNSTILE_SECRET secret here. (Ask Claude to add the front-end widget once
//     you have the Turnstile site key.)
//
// The `json(obj, status, headers)` helper referenced below already exists in the
// deployed Worker (it wraps a JSON Response with the CORS headers). Rename the
// calls if yours is named differently.
// ===========================================================================

const TRIAGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    priority: { type: "string", enum: ["P1", "P2", "P3", "P4", "FILTER"], description: "P1 critical/STAT, P2 urgent same-day, P3 routine, P4 low/batch, FILTER junk/spam/cover-only." },
    docType: { type: "string", description: "Short human label, e.g. 'STAT lab result', 'Prior-auth denial', 'Prescription refill', 'Marketing fax'." },
    sender: { type: "string", description: "Best guess of the sending organization, or 'Unknown'." },
    patient: { type: "string", description: "Patient full name if clearly present, else '—'." },
    dob: { type: "string", description: "Patient DOB (MM/DD/YYYY) if present, else ''." },
    reason: { type: "string", description: "One short line: why this priority." },
    urgencyMarker: { type: "string", description: "The exact key phrase from the fax that drives the urgency (a panic value, a deadline, 'DENIED', 'STAT'...), else ''." },
    confidence: { type: "number", description: "0..1 confidence in the classification." },
    fields: {
      type: "array",
      description: "3-5 extracted key/value fields (ordering provider, codes, deadline, result, pharmacy, etc.).",
      items: { type: "object", additionalProperties: false, properties: { key: { type: "string" }, value: { type: "string" } }, required: ["key", "value"] },
    },
  },
  required: ["priority", "docType", "sender", "patient", "dob", "reason", "urgencyMarker", "confidence", "fields"],
};

const SYSTEM_TRIAGE = `You are a clinical fax-triage agent for a medical practice. You read ONE inbound fax and decide how urgently a human needs to act on it, then extract the key fields.

Priority bands:
- P1 (critical): STAT/panic lab values, critical imaging wet-reads, positive pathology, hospital discharge needing urgent follow-up — anything where delay risks patient harm.
- P2 (urgent): prior-authorization denials or info-requests with deadlines, urgent referrals, abnormal (non-panic) results.
- P3 (routine): routine referrals, normal results, records/ROI requests.
- P4 (low): prescription refills, insurance/EOB/billing documents, FYI copies.
- FILTER: marketing/advertisements, spam, blank cover sheets, misdirected faxes with no clinical content.

Rules:
- Judge urgency on clinical content, not on how the sender labels it. When torn between two bands, pick the more urgent one.
- Extract patient name and DOB only if clearly present; otherwise return '—' and ''.
- 'urgencyMarker' is a short phrase copied verbatim from the fax that drives the priority (a panic value, a deadline, 'DENIED', 'STAT'...), or '' if none.
- You are assistive only: do not diagnose or give medical advice. Return only the JSON.`;

// Optional per-IP rate limit — no-op unless a KV namespace is bound as RATE_LIMIT.
async function triageRateLimited(request, env) {
  if (!env.RATE_LIMIT) return false;
  const ip = request.headers.get("CF-Connecting-IP") || "anon";
  const key = "trg:" + ip;
  const max = parseInt(env.TRIAGE_RATE_MAX || "20", 10);
  const used = parseInt((await env.RATE_LIMIT.get(key)) || "0", 10);
  if (used >= max) return true;
  await env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 3600 }); // rolling 1h window
  return false;
}

// Optional Turnstile check — no-op (returns true) unless TURNSTILE_SECRET is set.
async function triageTurnstileOK(body, request, env) {
  if (!env.TURNSTILE_SECRET) return true;
  const token = body.turnstileToken || body["cf-turnstile-response"];
  if (!token) return false;
  const form = new URLSearchParams();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const d = await r.json();
    return !!(d && d.success);
  } catch {
    return false;
  }
}

async function handleTriage(body, env, headers, request) {
  const fax = (body.fax || body.text || "").toString();
  if (!fax) return json({ error: "Provide `fax` text." }, 400, headers);
  if (fax.length > 20000) return json({ error: "Fax too long for the demo (20k character limit)." }, 413, headers);
  if (!env.OPENAI_API_KEY) return json({ error: "Server not configured: OPENAI_API_KEY secret is missing." }, 500, headers);

  if (await triageRateLimited(request, env)) {
    return json({ error: "Rate limit reached — please try again shortly." }, 429, headers);
  }
  if (!(await triageTurnstileOK(body, request, env))) {
    return json({ error: "Verification failed — please retry." }, 403, headers);
  }

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0,
        max_tokens: 900,
        messages: [
          { role: "system", content: SYSTEM_TRIAGE },
          { role: "user", content: `Triage this inbound clinic fax:\n\n${fax}` },
        ],
        response_format: { type: "json_schema", json_schema: { name: "fax_triage", strict: true, schema: TRIAGE_SCHEMA } },
      }),
    });

    if (!r.ok) {
      const detail = (await r.text()).slice(0, 300);
      return json({ error: "Triage failed.", detail }, 502, headers);
    }
    const out = await r.json();
    const content = out.choices && out.choices[0] && out.choices[0].message && out.choices[0].message.content;
    const data = JSON.parse(content || "{}");
    return json(data, 200, headers);
  } catch (err) {
    return json({ error: "Triage failed.", detail: String(err && err.message ? err.message : err) }, 502, headers);
  }
}
