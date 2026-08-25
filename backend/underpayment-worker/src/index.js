/**
 * Silstone — Underpayment / Denial demo backend (Cloudflare Worker)
 *
 * Accepts an EOB (pasted text or a base64 PDF), asks Claude to extract every
 * claim line, classify each as correct / downgrade / denial, estimate a win
 * probability, and total the recoverable gap — then returns JSON in the exact
 * shape the front-end demo animates.
 *
 * The ANTHROPIC_API_KEY lives only in the Worker's encrypted secrets, so it is
 * never exposed to the browser (which is why this backend has to exist at all).
 *
 * ⚠️ PUBLIC DEMO — NOT FOR REAL PHI. This endpoint is meant to run on sample or
 * de-identified EOBs. Do not route real patient data here without a HIPAA BAA
 * covering both Anthropic and your hosting. See README.md.
 */

import Anthropic from "@anthropic-ai/sdk";

// The response contract — mirrors the front-end demo's data model so the result
// drops straight into the PARSE → SCAN → CLASSIFY → REVEAL animation.
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    payer: { type: "string", description: "Payer / plan name from the EOB, e.g. 'Delta Dental PPO'." },
    docLines: {
      type: "array",
      description: "6–12 short raw lines lifted from the EOB, for the on-screen scan. Keep them terse.",
      items: { type: "string" },
    },
    findings: {
      type: "array",
      description: "3–5 plain-language findings, most important first.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string", enum: ["amber", "coral", "mint"], description: "amber=downgrade, coral=denial, mint=positive/no-action" },
          text: { type: "string" },
        },
        required: ["type", "text"],
      },
    },
    claims: {
      type: "array",
      description: "One entry per claim line on the EOB.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "A short reference id, e.g. 'EOB-4401'." },
          code: { type: "string", description: "Procedure / CPT / CDT code, e.g. 'D2392'." },
          description: { type: "string" },
          billed: { type: "number", description: "Amount billed, in dollars." },
          paid: { type: "number", description: "Amount paid, in dollars." },
          adjustmentCode: { type: "string", description: "Adjustment/remark code, e.g. 'CO-45', 'OA-23', or '---' if none." },
          category: { type: "string", enum: ["correct", "downgrade", "denial"] },
          winProbability: { type: "number", description: "0..1 estimated probability of recovering the gap on appeal (1 for correct lines)." },
        },
        required: ["id", "code", "description", "billed", "paid", "adjustmentCode", "category", "winProbability"],
      },
    },
  },
  required: ["payer", "docLines", "findings", "claims"],
};

const SYSTEM = `You are a dental/medical revenue-integrity analyst. You read an Explanation of Benefits (EOB) and find every line where the payer paid less than the provider is owed.

For each claim line:
- category "downgrade": paid at a reduced/alternate-benefit rate (e.g. composite billed, paid as amalgam; CO-45 alternate benefit). There is a recoverable gap = billed - paid.
- category "denial": paid 0 (or effectively denied) with an adjustment/remark code (e.g. OA-23 missing documentation). Recoverable gap = billed - paid.
- category "correct": paid appropriately; no action. winProbability = 1.

Estimate winProbability (0..1) for downgrades/denials based on how appealable the pattern is with standard documentation (composite downgrades ~0.8; SRP denials for missing charting ~0.65; non-covered benefits low).

Rules:
- Use real numbers from the EOB. Never invent totals you can't see.
- docLines: quote 6–12 short lines actually present in the EOB for the scan animation.
- findings: 3–5 concise, specific findings, most important first; use type amber for downgrades, coral for denials, mint for a positive/no-action note.
- Output ONLY the structured object requested.`;

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allow = allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

// ===========================================================================
// Fax-triage route  (POST /api/triage)  — SELF-CONTAINED, OpenAI (GPT-4o-mini).
// Reads one inbound clinic fax and returns how urgently a human must act, plus
// the extracted fields, in the shape the Triage demo animates. Uses the
// OPENAI_API_KEY Worker secret via fetch (no SDK), so this block can be pasted
// into any Worker — it does not depend on the EOB route's Anthropic client.
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, headers);

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "Server not configured: ANTHROPIC_API_KEY secret is missing." }, 500, headers);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Body must be JSON." }, 400, headers);
    }

    // Route: /api/triage runs the fax-triage prompt; anything else is the EOB analyzer.
    if (new URL(request.url).pathname.endsWith("/triage")) {
      return handleTriage(body, env, headers, request);
    }

    const eob = (body.eob || "").toString();
    const pdf = body.pdf_base64; // optional base64 PDF (no data: prefix, no newlines)

    if (!eob && !pdf) return json({ error: "Provide `eob` text or `pdf_base64`." }, 400, headers);
    if (eob.length > 20000) return json({ error: "EOB too long for the demo (20k character limit)." }, 413, headers);

    // NOTE: add a Cloudflare Turnstile check and KV-backed per-IP rate limit here
    // before going live, so nobody can run up your Claude bill. See README.md.

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const userContent = [];
    if (pdf) {
      userContent.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: pdf },
      });
    }
    userContent.push({
      type: "text",
      text: eob ? `Analyze this EOB:\n\n${eob}` : "Analyze the attached EOB PDF.",
    });

    try {
      const resp = await client.messages.create({
        model: env.CLAUDE_MODEL || "claude-sonnet-5",
        max_tokens: 4000,
        system: SYSTEM,
        output_config: { format: { type: "json_schema", schema: RESULT_SCHEMA } },
        messages: [{ role: "user", content: userContent }],
      });

      if (resp.stop_reason === "refusal") {
        return json({ error: "The request was declined. Try sample data." }, 422, headers);
      }

      const textBlock = resp.content.find((b) => b.type === "text");
      const data = JSON.parse(textBlock ? textBlock.text : "{}");
      return json(data, 200, headers);
    } catch (err) {
      return json({ error: "Analysis failed.", detail: String(err && err.message ? err.message : err) }, 502, headers);
    }
  },
};
