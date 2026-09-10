var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.js
var index_default = {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/analyze") {
        return await handleAnalyze(request, env, corsHeaders);
      }
      if (url.pathname === "/api/email") {
        return await handleEmail(request, env, corsHeaders);
      }
      if (url.pathname === "/api/triage") {
        return await handleTriage(request, env, corsHeaders);
      }
      if (url.pathname === "/api/policy") {
        return await handlePolicy(request, env, corsHeaders);
      }
      return json({ error: "Not found" }, 404, corsHeaders);
    } catch (err) {
      return json({ error: err.message }, 500, corsHeaders);
    }
  }
};
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}
__name(json, "json");
async function handleAnalyze(request, env, corsHeaders) {
  const { document } = await request.json();
  if (!document || document.trim().length < 20) {
    return json({ error: "Please provide a valid EOB document." }, 400, corsHeaders);
  }
  if (document.length > 15e3) {
    return json({ error: "Document too large. Please limit to 15,000 characters." }, 400, corsHeaders);
  }
  const result = await callWorkersAI(env.AI, document);
  return json(result, 200, corsHeaders);
}
__name(handleAnalyze, "handleAnalyze");
async function callWorkersAI(ai, documentText) {
  const systemPrompt = `You are a dental claims analyst for a revenue cycle management company called Silstone.AI. 
You parse Explanation of Benefits (EOB) / Electronic Remittance Advice (ERA) documents from dental insurance payers.

The document may be in any of these formats:
- Tab-separated columns (copy/paste from PDF)
- CSV or spreadsheet export
- HTML table (copy/paste from insurer portal)
- Plain text with space-aligned columns

For each claim line in the document, determine:
- category: "correct" (paid as billed), "downgrade" (paid at alternate benefit rate), or "denial" (not paid)
- winProbability: estimated probability of winning an appeal (0.0 to 1.0). Correct claims = 1.0.
- reasoning: brief clinical/policy explanation
- For downgrades: what the original code was vs what it was downcoded to
- For denials: what documentation is missing and how to fix it

Also generate:
- findings: key observations (color-coded: "mint" for good, "amber" for downgrades, "coral" for denials)
- summary: aggregate stats (total billed, total paid, recoverable, counts by category)

IMPORTANT: Return ONLY valid JSON, no markdown fences, no extra text.

Return this exact JSON structure:
{
  "payer": "payer name from document",
  "memberName": "member name if visible",
  "providerName": "provider name if visible",
  "findings": [
    { "type": "amber|coral|mint", "text": "description of finding" }
  ],
  "claims": [
    {
      "id": "claim number from document",
      "code": "CDT code",
      "description": "procedure description",
      "billed": 0.00,
      "paid": 0.00,
      "adjustmentCode": "adjustment code from document",
      "category": "correct|downgrade|denial",
      "winProbability": 0.0,
      "reasoning": "why this category",
      "downgradeCode": "if downgrade, what it was downcoded to",
      "downgradeDesc": "if downgrade, description of alternate code",
      "denialReason": "if denial, reason stated in document"
    }
  ],
  "summary": {
    "totalBilled": 0.00,
    "totalPaid": 0.00,
    "recoverable": 0.00,
    "denialCount": 0,
    "downgradeCount": 0,
    "correctCount": 0,
    "avgWinRate": 0.0
  }
}`;
  const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this EOB document:

${documentText}` }
    ],
    max_tokens: 4096,
    temperature: 0.1
  });
  if (response.errors && response.errors.length > 0) {
    throw new Error(`Workers AI error: ${response.errors[0].message}`);
  }
  let raw = "";
  if (typeof response === "string") {
    raw = response;
  } else if (response.result) {
    raw = response.result.response ?? response.result.output ?? response.result.text ?? "";
    if (typeof raw !== "string") raw = JSON.stringify(raw);
    if (!raw) raw = JSON.stringify(response.result);
  } else if (response.response) {
    raw = typeof response.response === "string" ? response.response : JSON.stringify(response.response);
  } else {
    raw = JSON.stringify(response);
  }
  const content = String(raw);
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}
__name(callWorkersAI, "callWorkersAI");
async function handleTriage(request, env, corsHeaders) {
  const body = await request.json();
  const fax = (body.fax || body.document || "").toString();
  if (!fax || fax.trim().length < 10) {
    return json({ error: "Please provide fax text." }, 400, corsHeaders);
  }
  if (fax.length > 15e3) {
    return json({ error: "Fax too large. Please limit to 15,000 characters." }, 400, corsHeaders);
  }
  const result = await callTriageAI(env.AI, fax);
  return json(result, 200, corsHeaders);
}
__name(handleTriage, "handleTriage");
async function callTriageAI(ai, faxText) {
  const systemPrompt = `You are a clinical fax-triage agent for a medical practice (Silstone.AI). You read ONE inbound fax and decide how urgently a human must act on it, then extract the key fields.

Priority bands:
- "P1" (critical): STAT/panic lab values, critical imaging wet-reads, positive pathology, and EVERY hospital discharge summary or ED visit note that asks for follow-up \u2014 anything where delay risks patient harm.
- "P2" (urgent): prior-authorization denials or info-requests with deadlines, urgent referrals, abnormal (non-panic) results.
- "P3" (routine): routine referrals, normal results, records/ROI requests.
- "P4" (low): prescription refills, insurance/EOB/billing documents, FYI copies.
- "FILTER": marketing/advertisements, spam, blank cover sheets, misdirected faxes with no clinical content.

Rules:
- Judge urgency on clinical content, not how the sender labels it. When torn between two bands, pick the more urgent one.
- A hospital discharge summary or ED note is ALWAYS P1 when any follow-up is requested, even if the language is calm and the window is days rather than hours \u2014 the transitional-care window is time-critical and easy to miss in a fax pile.
- "confidence" is your genuine certainty in the priority band, between 0.55 and 0.97. Never return 1.0 and never return 0. Use 0.90+ only when the document states its own type unambiguously; use 0.60-0.75 when the fax is sparse, ambiguous, or partly illegible.
- Extract patient name and DOB only if clearly present; otherwise use "\u2014" and "".
- "urgencyMarker" is a short phrase copied verbatim from the fax that drives the priority (a panic value, a deadline, "DENIED", "STAT"), or "".
- You are assistive only; do not diagnose or give medical advice.

IMPORTANT: Return ONLY valid JSON, no markdown fences, no extra text.

Return this exact JSON structure:
{
  "priority": "P1|P2|P3|P4|FILTER",
  "docType": "short label, e.g. 'STAT lab result', 'Prior-auth denial', 'Prescription refill', 'Marketing fax'",
  "sender": "sending organization, or 'Unknown'",
  "patient": "patient full name, or '\u2014'",
  "dob": "MM/DD/YYYY, or ''",
  "reason": "one short line: why this priority",
  "urgencyMarker": "verbatim phrase driving urgency, or ''",
  "confidence": 0.0,
  "fields": [ { "key": "label", "value": "extracted value" } ]
}`;
  const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Triage this inbound clinic fax:

${faxText}` }
    ],
    max_tokens: 1200,
    temperature: 0.1
  });
  if (response.errors && response.errors.length > 0) {
    throw new Error(`Workers AI error: ${response.errors[0].message}`);
  }
  let raw = "";
  if (typeof response === "string") {
    raw = response;
  } else if (response.result) {
    raw = response.result.response ?? response.result.output ?? response.result.text ?? "";
    if (typeof raw !== "string") raw = JSON.stringify(raw);
    if (!raw) raw = JSON.stringify(response.result);
  } else if (response.response) {
    raw = typeof response.response === "string" ? response.response : JSON.stringify(response.response);
  } else {
    raw = JSON.stringify(response);
  }
  const content = String(raw);
  let parsed;
  try {
    parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
  } catch (e) {
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Failed to parse AI response as JSON");
    parsed = JSON.parse(m[0]);
  }
  const bands = ["P1", "P2", "P3", "P4", "FILTER"];
  if (!bands.includes(parsed.priority)) parsed.priority = "P3";
  let c = typeof parsed.confidence === "number" ? parsed.confidence : 0.8;
  if (!isFinite(c) || c <= 0) c = 0.6;
  if (c > 1) c = c > 1.5 ? 0.8 : 1;
  parsed.confidence = Math.max(0.55, Math.min(0.97, c));
  if (!Array.isArray(parsed.fields)) parsed.fields = [];
  return parsed;
}
__name(callTriageAI, "callTriageAI");
async function handleEmail(request, env, corsHeaders) {
  const { email, name, results } = await request.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Valid email required" }, 400, corsHeaders);
  }
  if (!results) {
    return json({ error: "Analysis results required" }, 400, corsHeaders);
  }
  const html = buildEmailHTML(name || "there", results);
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: "Silstone.AI <onboarding@resend.dev>",
      to: [email],
      subject: `Your Denial Recovery Analysis \u2014 $${results.summary?.recoverable?.toLocaleString() || "0"} Recoverable`,
      html
    })
  });
  if (!resendResponse.ok) {
    const err = await resendResponse.text();
    console.log("Email send failed:", err);
    return json({ success: true, message: "Results captured. Email delivery may be delayed." }, 200, corsHeaders);
  }
  return json({ success: true, message: "Results sent to your email." }, 200, corsHeaders);
}
__name(handleEmail, "handleEmail");
function buildEmailHTML(name, results) {
  const s = results.summary || {};
  const claims = results.claims || [];
  const findings = results.findings || [];
  const claimRows = claims.map((c) => {
    const catColor = c.category === "denial" ? "#FF9E7A" : c.category === "downgrade" ? "#EFC178" : "#5EE0A8";
    const catBg = c.category === "denial" ? "rgba(255,158,122,0.12)" : c.category === "downgrade" ? "rgba(239,193,120,0.12)" : "rgba(94,224,168,0.12)";
    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1C1C25;font-family:'IBM Plex Mono',monospace;font-size:13px;color:#F6F6F8;">${c.code}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1C1C25;font-size:13px;color:#9B9BA6;">${c.description}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1C1C25;font-family:'IBM Plex Mono',monospace;font-size:13px;color:#F6F6F8;text-align:right;">$${(c.billed || 0).toFixed(2)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1C1C25;font-family:'IBM Plex Mono',monospace;font-size:13px;color:${c.paid === 0 ? "#FF9E7A" : "#F6F6F8"};text-align:right;">$${(c.paid || 0).toFixed(2)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1C1C25;text-align:center;">
          <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;background:${catBg};color:${catColor};border:1px solid ${catColor}33;">${c.category}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1C1C25;font-family:'IBM Plex Mono',monospace;font-size:13px;color:#A594FF;text-align:right;">${c.winProbability ? Math.round(c.winProbability * 100) + "%" : "-"}</td>
      </tr>`;
  }).join("");
  const findingItems = findings.map((f) => {
    const color = f.type === "coral" ? "#FF9E7A" : f.type === "amber" ? "#EFC178" : "#5EE0A8";
    return `<li style="padding:6px 0;font-size:14px;color:#9B9BA6;line-height:1.5;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color};margin-right:10px;vertical-align:middle;"></span>${f.text}</li>`;
  }).join("");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#08080B;font-family:'Inter',-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080B;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        
        <!-- Header -->
        <tr><td style="padding:0 0 32px;text-align:center;">
          <div style="font-family:'Poppins',sans-serif;font-weight:600;font-size:18px;letter-spacing:0.12em;text-transform:uppercase;color:#F6F6F8;">SIL<span style="color:#2DD9D3;">STONE</span></div>
        </td></tr>

        <!-- Title -->
        <tr><td style="padding:0 0 24px;text-align:center;">
          <h1 style="margin:0;font-family:'Poppins',sans-serif;font-size:28px;font-weight:700;color:#F6F6F8;line-height:1.2;">Your Denial Recovery Analysis</h1>
          <p style="margin:12px 0 0;font-size:15px;color:#9B9BA6;">Hi ${name}, here are the full results from your EOB analysis.</p>
        </td></tr>

        <!-- Summary Cards -->
        <tr><td style="padding:0 0 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="25%" style="padding:16px;text-align:center;background:#101014;border:1px solid rgba(255,255,255,0.07);border-radius:12px 0 0 12px;">
                <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;margin-bottom:6px;">Recoverable</div>
                <div style="font-family:'Poppins',sans-serif;font-size:24px;font-weight:700;color:#5EE0A8;">$${(s.recoverable || 0).toLocaleString()}</div>
              </td>
              <td width="25%" style="padding:16px;text-align:center;background:#101014;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
                <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;margin-bottom:6px;">Denials</div>
                <div style="font-family:'Poppins',sans-serif;font-size:24px;font-weight:700;color:#FF9E7A;">${s.denialCount || 0}</div>
              </td>
              <td width="25%" style="padding:16px;text-align:center;background:#101014;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);">
                <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;margin-bottom:6px;">Downgrades</div>
                <div style="font-family:'Poppins',sans-serif;font-size:24px;font-weight:700;color:#EFC178;">${s.downgradeCount || 0}</div>
              </td>
              <td width="25%" style="padding:16px;text-align:center;background:#101014;border:1px solid rgba(255,255,255,0.07);border-radius:0 12px 12px 0;">
                <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;margin-bottom:6px;">Win Rate</div>
                <div style="font-family:'Poppins',sans-serif;font-size:24px;font-weight:700;color:#A594FF;">${s.avgWinRate ? Math.round(s.avgWinRate * 100) + "%" : "-"}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Findings -->
        ${findings.length > 0 ? `
        <tr><td style="padding:0 0 32px;">
          <h2 style="margin:0 0 16px;font-family:'Poppins',sans-serif;font-size:18px;font-weight:600;color:#F6F6F8;">Key Findings</h2>
          <ul style="margin:0;padding:0;list-style:none;background:#101014;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px 20px;">
            ${findingItems}
          </ul>
        </td></tr>` : ""}

        <!-- Claims Table -->
        <tr><td style="padding:0 0 32px;">
          <h2 style="margin:0 0 16px;font-family:'Poppins',sans-serif;font-size:18px;font-weight:600;color:#F6F6F8;">Claim Classification</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#101014;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;">
            <thead>
              <tr style="background:#08080B;">
                <th style="padding:10px 16px;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;text-align:left;border-bottom:1px solid rgba(255,255,255,0.07);">Code</th>
                <th style="padding:10px 16px;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;text-align:left;border-bottom:1px solid rgba(255,255,255,0.07);">Description</th>
                <th style="padding:10px 16px;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;text-align:right;border-bottom:1px solid rgba(255,255,255,0.07);">Billed</th>
                <th style="padding:10px 16px;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;text-align:right;border-bottom:1px solid rgba(255,255,255,0.07);">Paid</th>
                <th style="padding:10px 16px;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">Status</th>
                <th style="padding:10px 16px;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#7A7A86;text-align:right;border-bottom:1px solid rgba(255,255,255,0.07);">Win%</th>
              </tr>
            </thead>
            <tbody>${claimRows}</tbody>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 0 0;border-top:1px solid rgba(255,255,255,0.07);text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:#7A7A86;">Powered by <strong style="color:#A594FF;">Silstone.AI</strong> \u2014 Denial Recovery Agent</p>
          <p style="margin:0;font-size:12px;color:#7A7A86;">This analysis is for informational purposes. Always verify against payer-specific policies.</p>
          <p style="margin:16px 0 0;"><a href="https://www.silstone.ai/contact" style="font-size:13px;color:#A594FF;text-decoration:none;">Talk to us about automating this \u2192</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
__name(buildEmailHTML, "buildEmailHTML");
async function handlePolicy(request, env, corsHeaders) {
  const body = await request.json();
  const text = (body.policy || body.document || body.text || "").toString();
  if (!text || text.trim().length < 120) {
    return json({ error: "Please paste a payer policy (at least a paragraph)." }, 400, corsHeaders);
  }
  if (text.length > 18e3) {
    return json({ error: "Policy too large. Please limit to 18,000 characters." }, 400, corsHeaders);
  }
  const result = await callPolicyAI(env.AI, text);
  return json(result, 200, corsHeaders);
}
__name(handlePolicy, "handlePolicy");
/*
 * The rules an allergen-immunotherapy policy can decide, and what it costs you
 * when you bill against one without knowing it. `key` is the contract with the
 * front end, which uses it to re-run the coverage board under these rules.
 */
var NO_PRECERT = /(^|[^a-z])(not|no|without|never)[ ]+(required|require[sd]?|necessary)/i;
var POLICY_RULES = [
  { key: "doseDefinition", label: "How a dose is defined", consequence: "Bill more units than the payer's definition allows and the extras come back CO-151." },
  { key: "dosesPerVial", label: "Doses paid per vial", consequence: "Every dose past this number on a single vial is denied, on this vial and the next." },
  { key: "dosesPerYear", label: "Doses paid per plan year", consequence: "Once the bank is empty the rest of the plan year returns N362, units exceed the maximum." },
  { key: "precert", label: "Precertification required", consequence: "A vial mixed without an authorization on file is denied CO-197, after the antigen is already made." },
  { key: "benefitMax", label: "Annual benefit maximum", consequence: "Claims past the maximum return CO-119 and become patient responsibility until the plan year rolls over." },
  { key: "documentation", label: "Documentation required", consequence: "A request without these on file is pended or denied for medical necessity." },
  { key: "appealWindow", label: "Appeal window", consequence: "Miss it and the denial is final, whatever the chart says." }
];
async function callPolicyAI(ai, policyText) {
  const systemPrompt = `You are a payer-policy analyst for an allergy practice (Silstone.AI). You read ONE commercial payer's medical policy covering allergen immunotherapy and you extract the rules that decide whether CPT 95165 gets paid.

CPT 95165 is professional supervision of preparing antigens for allergen immunotherapy, billed in doses. Medicare treats a dose as a 1 mL aliquot. Commercial payers write their own definitions, and several cap the doses they will pay per vial or per plan year regardless of how much antigen was actually mixed. Those definitions are what you are looking for.

Extract only these rule keys, and only when the policy actually states them:
- "doseDefinition"  how this payer defines one dose or unit of 95165
- "dosesPerVial"    the maximum doses paid from a single multi-dose vial
- "dosesPerYear"    the maximum doses paid per plan year or per member per year
- "precert"         whether precertification / prior authorization is required
- "benefitMax"      an annual dollar maximum on immunotherapy
- "documentation"   what the payer requires in the record to support the service
- "appealWindow"    how long the practice has to appeal an adverse determination

For every rule you return you MUST supply "quote": a span copied WORD FOR WORD from the policy text, exactly as written, that states the rule. Do not paraphrase inside "quote". Do not join text from two different places. Do not correct spelling or punctuation. If you cannot find a verbatim span that states a rule, leave that rule out entirely.

Also return "notFound": the keys from the list above that this policy does not state. A policy that is silent on a rule is an important finding, not a failure.

Set "confidence" per rule between 0.55 and 0.97 for how certain you are the quote establishes the rule.

Write "value" as the rule in plain words, under 90 characters, as an instruction the billing team could follow.

IMPORTANT: Return ONLY valid JSON, no markdown fences, no extra text.

Return this exact JSON structure:
{
  "payer": "payer or plan name as written in the policy, or 'Unknown'",
  "policyRef": "policy number or title if present, else ''",
  "summary": "two sentences: what this policy pays for and the single rule most likely to cost this practice money",
  "rules": [ { "key": "one of the keys above", "value": "the rule in plain words", "quote": "verbatim span from the policy", "confidence": 0.0 } ],
  "notFound": [ "key" ]
}`;
  const response = await ai.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Extract the 95165 rules from this payer policy:

${policyText}` }
    ],
    max_tokens: 2200,
    temperature: 0.1
  });
  if (response.errors && response.errors.length > 0) {
    throw new Error(`Workers AI error: ${response.errors[0].message}`);
  }
  let raw = "";
  if (typeof response === "string") {
    raw = response;
  } else if (response.result) {
    raw = response.result.response ?? response.result.output ?? response.result.text ?? "";
    if (typeof raw !== "string") raw = JSON.stringify(raw);
    if (!raw) raw = JSON.stringify(response.result);
  } else if (response.response) {
    raw = typeof response.response === "string" ? response.response : JSON.stringify(response.response);
  } else {
    raw = JSON.stringify(response);
  }
  const content = String(raw);
  let parsed;
  try {
    parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
  } catch (e) {
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Failed to parse AI response as JSON");
    parsed = JSON.parse(m[0]);
  }
  return verifyPolicy(parsed, policyText);
}
__name(callPolicyAI, "callPolicyAI");
/*
 * A citation nobody checked is just a confident-looking sentence. Every quote
 * is matched back against the document the reader actually pasted, on
 * whitespace-and-case-normalised text so ordinary reflow does not cause a false
 * negative. A rule whose quote is not in the document is returned with
 * verified:false and the front end shows it as unverified rather than hiding
 * it: the reader should see when the model reached past its evidence.
 */
function verifyPolicy(d, policyText) {
  const norm = /* @__PURE__ */ __name((s2) => String(s2 || "").toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[\s ]+/g, " ").trim(), "norm");
  const haystack = norm(policyText);
  const known = POLICY_RULES.map((r) => r.key);
  const meta = /* @__PURE__ */ __name((k) => POLICY_RULES.find((r) => r.key === k), "meta");
  const seen = {};
  const rules = (Array.isArray(d.rules) ? d.rules : []).filter((r) => r && known.includes(r.key) && !seen[r.key] && (seen[r.key] = 1)).map((r) => {
    const quote = String(r.quote || "").trim();
    const n = norm(quote);
    // a quote has to be a real span, not a stray word or the whole document
    const usable = n.length >= 12 && n.length <= 600;
    const verified = usable && haystack.includes(n);
    if (!usable) return null;   // no quote means the policy is silent, not that the citation failed
    const m = meta(r.key);
    const conf = Number(r.confidence);
    // "precertification is NOT required" is a different finding from
    // "precertification is required", and it must not carry the warning that
    // belongs to the opposite reading
    let consequence = m.consequence;
    if (r.key === "precert" && NO_PRECERT.test(`${r.value} ${quote}`)) {
      consequence = "Nothing to obtain here, which is worth having in writing before you rely on it: the same payer may still require one for a non-participating provider.";
    }
    return {
      key: r.key,
      label: m.label,
      value: String(r.value || "").trim().slice(0, 140) || m.label,
      quote,
      verified,
      consequence,
      confidence: Number.isFinite(conf) ? Math.max(0.5, Math.min(0.97, conf)) : 0.7
    };
  }).filter(Boolean);
  const found = rules.map((r) => r.key);
  const notFound = known.filter((k) => !found.includes(k)).map((k) => ({ key: k, label: meta(k).label }));
  const verifiedCount = rules.filter((r) => r.verified).length;
  return {
    payer: String(d.payer || "").trim().slice(0, 90) || "Unknown payer",
    policyRef: String(d.policyRef || "").trim().slice(0, 90),
    summary: String(d.summary || "").trim().slice(0, 600),
    rules,
    notFound,
    stats: { extracted: rules.length, verified: verifiedCount, silent: notFound.length },
    // what the front end needs to re-run the coverage board under this policy
    apply: buildApply(rules)
  };
}
__name(verifyPolicy, "verifyPolicy");
/*
 * Turn the prose rules into the few machine-readable numbers the board can be
 * re-run against. Only verified rules are allowed to change the simulation:
 * an unverified read may be shown to the reader, but it may not move a chart.
 */
function buildApply(rules) {
  const out = { dosesPerVial: null, dosesPerYear: null, precert: null, benefitMax: null };
  const firstInt = /* @__PURE__ */ __name((s2) => {
    const m = String(s2).replace(/,/g, "").match(/\d+(\.\d+)?/);
    return m ? Math.round(parseFloat(m[0])) : null;
  }, "firstInt");
  for (const r of rules) {
    if (!r.verified) continue;
    const hay = `${r.value} ${r.quote}`;
    if (r.key === "dosesPerVial") out.dosesPerVial = firstInt(hay);
    if (r.key === "dosesPerYear") out.dosesPerYear = firstInt(hay);
    if (r.key === "benefitMax") out.benefitMax = firstInt(hay);
    if (r.key === "precert") {
      out.precert = !NO_PRECERT.test(hay);
    }
  }
  if (out.dosesPerVial !== null && (out.dosesPerVial < 1 || out.dosesPerVial > 60)) out.dosesPerVial = null;
  if (out.dosesPerYear !== null && (out.dosesPerYear < 1 || out.dosesPerYear > 600)) out.dosesPerYear = null;
  return out;
}
__name(buildApply, "buildApply");

export {
  index_default as default
};
//# sourceMappingURL=index.js.map
