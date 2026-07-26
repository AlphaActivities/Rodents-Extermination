import { createClient } from "npm:@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://rodentsexterminsulationllc.com",
  "https://www.rodentsexterminsulationllc.com",
  "http://localhost:5173",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Vary": "Origin",
  };
}

const MAX_BODY_BYTES = 16_384;

// ── Approved service values (must match Contact.tsx) ──────────
const APPROVED_SERVICES = [
  "Attic Insulation",
  "Radiant Barrier",
  "Rodent Control",
  "Wildlife Removal",
  "Sanitation & Cleanup",
  "Commercial Services",
] as const;

// ── Quality classes ───────────────────────────────────────────
type Quality =
  | "likely_customer"
  | "needs_review"
  | "solicitation"
  | "spam"
  | "duplicate"
  | "out_of_area";

// ── Helpers ───────────────────────────────────────────────────
function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function hashIp(ip: string, pepper: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + ":" + pepper);
  // Simple non-crypto hash — sufficient for rate-limit grouping
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i];
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

// ── Solicitation keywords ─────────────────────────────────────
const SOLICITATION_TERMS = [
  "ai agent", "ai employee", "seo services", "marketing services",
  "website services", "lead generation", "demo", "promotional song",
  "sell you", "grow your business", "outsourcing", "backlink",
  "guest post", "content writing", "digital marketing",
];

// ── Main ──────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  // Body size limit
  const contentLength = req.headers.get("Content-Length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return json({ error: "Request too large" }, 413, origin);
  }

  let payload: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: "Request too large" }, 413, origin);
    }
    payload = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON" }, 400, origin);
  }

  // ── Parse allowlist only ────────────────────────────────────
  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const service_name = String(payload.service_name ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const property_zip = String(payload.property_zip ?? "").trim();
  const landing_page = String(payload.landing_page ?? "").trim().slice(0, 2048);
  const page_path = String(payload.page_path ?? "").trim().slice(0, 512);
  const referrer = String(payload.referrer ?? "").trim().slice(0, 2048);
  const recaptcha_token = String(payload.recaptcha_token ?? "").trim();
  const bot_field = String(payload.bot_field ?? "").trim();
  const form_started_at = payload.form_started_at;

  // ── Honeypot ────────────────────────────────────────────────
  if (bot_field) {
    return json({ error: "Submission rejected" }, 422, origin);
  }

  // ── Field validation ───────────────────────────────────────
  const errors: string[] = [];

  if (name.length < 2 || name.length > 80) {
    errors.push("Please enter your name (2–80 characters).");
  }
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
    errors.push("Please enter a valid US phone number.");
  }
  if (email && !isValidEmail(email)) {
    errors.push("Please enter a valid email address.");
  }
  if (!APPROVED_SERVICES.includes(service_name as typeof APPROVED_SERVICES[number])) {
    errors.push("Please select a service.");
  }
  if (message.length < 10 || message.length > 1500) {
    errors.push("Please describe your problem (10–1500 characters).");
  }
  if (!/^\d{5}$/.test(property_zip)) {
    errors.push("Please enter a valid 5-digit ZIP code.");
  }
  if (!recaptcha_token) {
    errors.push("Please complete the spam check.");
  }

  if (errors.length > 0) {
    return json({ error: errors.join(" ") }, 422, origin);
  }

  // ── reCAPTCHA verification ─────────────────────────────────
  const recaptchaSecret = Deno.env.get("RECAPTCHA_SECRET_KEY");
  if (!recaptchaSecret) {
    console.error("RECAPTCHA_SECRET_KEY not configured");
    return json({ error: "Server configuration error" }, 500, origin);
  }

  let recaptchaOk = false;
  try {
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: recaptcha_token,
      }),
    });
    const verifyData = await verifyRes.json() as {
      success: boolean;
      hostname?: string;
    };
    const validHostnames = [
      "rodentsexterminsulationllc.com",
      "www.rodentsexterminsulationllc.com",
    ];
    recaptchaOk =
      verifyData.success === true &&
      (!verifyData.hostname || validHostnames.includes(verifyData.hostname));
  } catch {
    recaptchaOk = false;
  }

  // ── Connect to Supabase with service role ──────────────────
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ── Rate limiting ───────────────────────────────────────────
  const clientIp = req.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "unknown";
  const ratePepper = Deno.env.get("RATE_LIMIT_PEPPER") || "fallback-pepper";
  const ipHash = hashIp(clientIp, ratePepper);

  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 86_400_000).toISOString();

  const { count: recentAccepted } = await supabase
    .from("lead_submission_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("accepted", true)
    .gte("attempted_at", oneHourAgo);

  const { count: recentTotal } = await supabase
    .from("lead_submission_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("attempted_at", twentyFourHoursAgo);

  let rejectionReason: string | null = null;

  if ((recentAccepted ?? 0) >= 3) {
    rejectionReason = "rate_limit_hour";
  } else if ((recentTotal ?? 0) >= 5) {
    rejectionReason = "rate_limit_day";
  } else if (!recaptchaOk) {
    rejectionReason = "recaptcha_failed";
  }

  // ── Duplicate detection ────────────────────────────────────
  let duplicateOf: string | null = null;
  let isDuplicate = false;

  if (!rejectionReason) {
    const twentyFourHrsAgo = new Date(Date.now() - 86_400_000).toISOString();
    const { data: recentLeads } = await supabase
      .from("leads")
      .select("id, normalized_phone, email, message")
      .gte("created_at", twentyFourHrsAgo);

    if (recentLeads && recentLeads.length > 0) {
      for (const rl of recentLeads) {
        const phoneMatch = rl.normalized_phone && rl.normalized_phone === normalizedPhone;
        const emailMatch = email && rl.email && rl.email.toLowerCase() === email;
        const messageMatch =
          rl.message && message &&
          rl.message.length > 20 &&
          (rl.message === message ||
            (rl.message.includes(message) || message.includes(rl.message)));
        if (phoneMatch || emailMatch) {
          if (phoneMatch && (emailMatch || messageMatch)) {
            isDuplicate = true;
            duplicateOf = rl.id;
            break;
          }
        }
      }
    }
  }

  // ── Quality scoring ─────────────────────────────────────────
  const spamReasons: string[] = [];
  let spamScore = 0;

  if (!recaptchaOk) {
    spamReasons.push("recaptcha_failed");
    spamScore += 30;
  }

  // Timing signal
  let elapsedSeconds: number | null = null;
  if (form_started_at) {
    const started = new Date(form_started_at as string).getTime();
    if (!isNaN(started)) {
      elapsedSeconds = (Date.now() - started) / 1000;
      if (elapsedSeconds < 3) {
        spamReasons.push("impossible_speed");
        spamScore += 20;
      }
    }
  }

  // Random-looking name (all consonants or single char repeated)
  if (/^[bcdfghjklmnpqrstvwxyz]{1,3}$/i.test(name) || /^(.)\1{2,}$/.test(name)) {
    spamReasons.push("random_name");
    spamScore += 15;
  }

  // Gibberish message (no spaces or excessive repetition)
  if (!/\s/.test(message) || /^(.)\1{10,}$/.test(message)) {
    spamReasons.push("gibberish_message");
    spamScore += 20;
  }

  // Solicitation language
  const lowerMessage = message.toLowerCase();
  for (const term of SOLICITATION_TERMS) {
    if (lowerMessage.includes(term)) {
      spamReasons.push("solicitation_language");
      spamScore += 25;
      break;
    }
  }

  // Out-of-area ZIP (basic check — refine with real service area later)
  const SERVICE_AREA_ZIPS: string[] = [];
  let serviceAreaStatus: "inside" | "bordering" | "outside" | "unknown" = "unknown";
  if (SERVICE_AREA_ZIPS.length > 0) {
    serviceAreaStatus = SERVICE_AREA_ZIPS.includes(property_zip) ? "inside" : "outside";
    if (serviceAreaStatus === "outside") {
      spamReasons.push("out_of_area");
      spamScore += 10;
    }
  }

  if (isDuplicate) {
    spamReasons.push("duplicate_contact");
    spamScore += 30;
  }

  // ── Determine quality ──────────────────────────────────────
  let quality: Quality;
  if (rejectionReason === "recaptcha_failed" || spamScore >= 60) {
    quality = "spam";
  } else if (isDuplicate) {
    quality = "duplicate";
  } else if (spamReasons.includes("solicitation_language")) {
    quality = "solicitation";
  } else if (spamReasons.includes("out_of_area")) {
    quality = "out_of_area";
  } else if (spamScore >= 25) {
    quality = "needs_review";
  } else {
    quality = "likely_customer";
  }

  // ── Record attempt ─────────────────────────────────────────
  const accepted = !rejectionReason;
  await supabase.from("lead_submission_attempts").insert({
    ip_hash: ipHash,
    accepted,
    rejection_reason: rejectionReason,
  });

  if (rejectionReason) {
    return json({ error: "Submission rejected. Please try again later." }, 429, origin);
  }

  // ── Insert lead (service role bypasses RLS) ─────────────────
  const { error: insertError } = await supabase.from("leads").insert({
    name,
    phone,
    email: email || null,
    service_name,
    message,
    property_zip,
    normalized_phone: normalizedPhone,
    landing_page,
    page_path,
    referrer,
    status: "new",
    quality,
    spam_score: spamScore,
    spam_reasons: spamReasons,
    duplicate_of: duplicateOf,
    service_area_status: serviceAreaStatus,
  });

  if (insertError) {
    console.error("Lead insert failed:", insertError.code);
    return json({ error: "Unable to submit. Please call us instead." }, 500, origin);
  }

  return json({ success: true }, 201, origin);
});
