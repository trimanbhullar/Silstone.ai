// ===========================================================================
// Silstone — Allergy benefit-exposure route  (POST /api/allergy)   [Claude]
// ---------------------------------------------------------------------------
// Paste-in snippet for the ALREADY-DEPLOYED Worker that powers the live demos
// (dental-denial-agent.denial-agent.workers.dev). Powers demo 3, the CPT 95165
// Immunotherapy Benefit Agent: the front end sends a short practice profile
// (how many patients are on immunotherapy, how many injection visits a week,
// how many vials get mixed, how many denials get chased) and this route asks
// Claude to map where the manual benefit-verification work is actually going,
// in hours and dollars a month.
//
// Self-contained: calls the Anthropic Messages API with fetch (no SDK), so it
// can be pasted into any Worker. It uses the SAME ANTHROPIC_API_KEY secret the
// EOB route already uses and does not depend on that route's Anthropic client.
//
// ── HOW TO ADD IT ────────────────────────────────────────────────────────
// Cloudflare dashboard → Workers & Pages → dental-denial-agent → Edit code:
//   1. Paste everything below (the consts + the two functions) at module
//      scope, near the top of the Worker.
//   2. Inside the Worker's `fetch(request, env)` handler, AFTER parsing the
//      JSON body, add this route branch alongside the /triage one:
//
//         if (new URL(request.url).pathname.endsWith("/allergy")) {
//           return handleAllergy(body, env, headers, request);   // headers = your CORS headers
//         }
//
//   3. Ensure your CORS allow-list includes https://www.silstone.ai and
//      https://silstone.ai. The demo POSTs { "profile": { ... } } and expects
//      the JSON described by EXPOSURE_SCHEMA back.
//   4. Redeploy. Nothing else to configure — ANTHROPIC_API_KEY is already set.
//
// If this route is missing or unreachable the demo still works: the front end
// falls back to a documented client-side estimator, and labels the result as
// such. Shipping this route is what makes it a real Claude answer.
//
// ── OPTIONAL HARDENING (same switches as /triage) ─────────────────────────
//   Rate limit: bind a KV namespace as RATE_LIMIT (default 20 req/IP/hour,
//     override with ALLERGY_RATE_MAX). No-op when unbound.
//   Turnstile:  set TURNSTILE_SECRET and send { "turnstileToken": "<token>" }.
//     No-op when unset.
//
// The `json(obj, status, headers)` helper referenced below already exists in
// the deployed Worker (it wraps a JSON Response with the CORS headers).
// ===========================================================================

const EXPOSURE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string", description: "One sentence naming the single biggest place this practice loses time on 95165 benefit work." },
    hoursPerMonth: { type: "number", description: "Total staff hours per month spent on 95165 benefit verification, dose tracking, prior auth and denial chasing." },
    costPerMonth: { type: "number", description: "hoursPerMonth multiplied by the staff hourly cost given in the profile, in dollars." },
    atRiskPerMonth: { type: "number", description: "Dollars of 95165 revenue per month exposed to denial or to a series lapsing mid-treatment, using the average claim value given." },
    sinks: {
      type: "array",
      description: "4 to 6 time sinks, largest first. Together their hoursPerMonth should add up to hoursPerMonth above.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          task: { type: "string", description: "Short label, e.g. 'Pre-visit coverage checks'." },
          hoursPerMonth: { type: "number" },
          whoDoesIt: { type: "string", description: "Which role in this practice carries it, from the profile." },
          why: { type: "string", description: "One line: why this work exists and what makes it slow." },
          automatable: { type: "string", enum: ["full", "partial", "human"], description: "full = an agent can run it end to end, partial = agent prepares and a human approves, human = stays with a person." },
        },
        required: ["task", "hoursPerMonth", "whoDoesIt", "why", "automatable"],
      },
    },
    lapseRisk: {
      type: "object",
      additionalProperties: false,
      description: "The mid-treatment lapse exposure: series run 3 to 5 years, plan years and authorizations do not.",
      properties: {
        headline: { type: "string" },
        detail: { type: "string", description: "Two or three sentences on how a lapse happens in a practice this size and what it costs." },
        patientsAtRisk: { type: "number", description: "Modelled count of immunotherapy patients likely to hit a plan change, benefit cap or auth expiry in the next 12 months." },
      },
      required: ["headline", "detail", "patientsAtRisk"],
    },
    quickWins: {
      type: "array",
      description: "Exactly 3 changes, highest value first, that need no EMR integration.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          detail: { type: "string", description: "One or two sentences on what the agent does and what a human still approves." },
          hoursBack: { type: "number", description: "Modelled staff hours returned per month by this change alone." },
        },
        required: ["title", "detail", "hoursBack"],
      },
    },
    noEmr: {
      type: "array",
      description: "2 to 4 short lines naming what the agent works from instead of an EMR integration (payer portals, the schedule, the mixing log, the remittance file, a shared inbox).",
      items: { type: "string" },
    },
  },
  required: ["headline", "hoursPerMonth", "costPerMonth", "atRiskPerMonth", "sinks", "lapseRisk", "quickWins", "noEmr"],
};

const SYSTEM_ALLERGY = `You are an allergy practice operations analyst. You are given a short profile of one allergy practice and you map where its staff time goes on CPT 95165 benefit work, then quantify it.

Background you must reason from:
- 95165 is professional supervision of preparing antigens for allergen immunotherapy, billed in doses. Medicare treats a dose as a 1 mL aliquot; commercial payers vary, and several cap the doses they will pay per vial or per plan year regardless of what was mixed. That mismatch is where the money leaks.
- The injections themselves are 95115/95117 and are billed separately, so a single patient generates repeated claims across two code families.
- Immunotherapy runs 3 to 5 years. Plan years, deductibles, benefit maximums and prior authorizations do not. A series started under one plan routinely finishes under another, and the practice finds out through a denial after the antigen is already mixed and the visit already given.
- The manual work is: verifying commercial coverage before visits, tracking doses used against each payer's cap, renewing prior authorizations, re-verifying after a plan change, and chasing denials (CO-197 precert absent, CO-151 information does not support this many services, N362 units exceed the maximum, CO-119 benefit maximum reached).
- No EMR integration is available. The agent works from payer portals, the appointment schedule, the antigen mixing log, the remittance file and a shared inbox.

Rules:
- Use the numbers in the profile. Derive everything from them; never invent a figure the profile does not support, and never quote a benchmark from another practice.
- Be conservative. If a number is uncertain, choose the low end and say so in the text.
- Per-task minute assumptions should be defensible for this kind of work: a full commercial benefit verification runs roughly 15 to 25 minutes, a pre-visit spot check 3 to 6, dose-cap reconciliation per vial mixed 4 to 8, a prior authorization 20 to 30, and a worked denial 25 to 45.
- sinks must sum to hoursPerMonth. costPerMonth must equal hoursPerMonth times the staff hourly cost given.
- This is a modelled estimate, not an audit. Write in that register: plain, specific, no hype, no em dashes.
- Output only the structured object requested.`;

// Optional per-IP rate limit — no-op unless a KV namespace is bound as RATE_LIMIT.
async function allergyRateLimited(request, env) {
  if (!env.RATE_LIMIT) return false;
  const ip = request.headers.get("CF-Connecting-IP") || "anon";
  const key = "alg:" + ip;
  const max = parseInt(env.ALLERGY_RATE_MAX || "20", 10);
  const used = parseInt((await env.RATE_LIMIT.get(key)) || "0", 10);
  if (used >= max) return true;
  await env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 3600 }); // rolling 1h window
  return false;
}

async function handleAllergy(body, env, headers, request) {
  const p = body.profile || body;
  const num = (v, d) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : d;
  };
  const profile = {
    patients: Math.min(num(p.patients, 120), 20000),
    visitsPerWeek: Math.min(num(p.visitsPerWeek, 90), 5000),
    vialsPerWeek: Math.min(num(p.vialsPerWeek, 25), 2000),
    payers: Math.min(num(p.payers, 8), 200),
    denialsPerMonth: Math.min(num(p.denialsPerMonth, 12), 5000),
    hourlyCost: Math.min(num(p.hourlyCost, 28), 500),
    claimValue: Math.min(num(p.claimValue, 95), 100000),
    whoVerifies: String(p.whoVerifies || "the front desk").slice(0, 80),
  };

  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Server not configured: ANTHROPIC_API_KEY secret is missing." }, 500, headers);
  }
  if (await allergyRateLimited(request, env)) {
    return json({ error: "Rate limit reached — please try again shortly." }, 429, headers);
  }
  // Reuses the /triage Turnstile helper when that snippet is also installed.
  if (typeof triageTurnstileOK === "function" && !(await triageTurnstileOK(body, request, env))) {
    return json({ error: "Verification failed — please retry." }, 403, headers);
  }

  const userText =
    `Map the 95165 benefit workload for this allergy practice.\n\n` +
    `Patients currently on allergen immunotherapy: ${profile.patients}\n` +
    `Injection visits per week: ${profile.visitsPerWeek}\n` +
    `Antigen vials mixed per week: ${profile.vialsPerWeek}\n` +
    `Distinct commercial payers billed: ${profile.payers}\n` +
    `95165 denials worked per month: ${profile.denialsPerMonth}\n` +
    `Who does the verification today: ${profile.whoVerifies}\n` +
    `Loaded staff cost per hour: $${profile.hourlyCost}\n` +
    `Average paid value of one 95165 claim: $${profile.claimValue}\n\n` +
    `There is no EMR integration. Return the structured exposure map.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: env.ALLERGY_MODEL || "claude-opus-5",
        max_tokens: 3000,
        system: SYSTEM_ALLERGY,
        output_config: {
          effort: "medium",
          format: { type: "json_schema", schema: EXPOSURE_SCHEMA },
        },
        messages: [{ role: "user", content: userText }],
      }),
    });

    if (!r.ok) {
      const detail = (await r.text()).slice(0, 300);
      return json({ error: "Mapping failed.", detail }, 502, headers);
    }
    const out = await r.json();
    if (out.stop_reason === "refusal") {
      return json({ error: "The request was declined. Try the sample numbers." }, 422, headers);
    }
    const block = (out.content || []).find((b) => b.type === "text");
    const data = JSON.parse((block && block.text) || "{}");
    data.profile = profile; // echo back what was actually modelled
    return json(data, 200, headers);
  } catch (err) {
    return json({ error: "Mapping failed.", detail: String(err && err.message ? err.message : err) }, 502, headers);
  }
}
