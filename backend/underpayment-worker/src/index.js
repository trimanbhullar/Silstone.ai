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
