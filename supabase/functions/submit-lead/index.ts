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
  "Other / General Inquiry",
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

function getClientIp(req: Request): string {
  const xff = req.headers.get("X-Forwarded-For");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  const cfIp = req.headers.get("CF-Connecting-IP");
  if (cfIp) {
    return cfIp.trim();
  }
  return "unknown";
}

async function hashIp(ip: string, pepper: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + ":" + pepper);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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

  // ── Validate required server configuration ─────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const recaptchaSecret = Deno.env.get("RECAPTCHA_SECRET_KEY");
  const ratePepper = Deno.env.get("RATE_LIMIT_PEPPER");

  if (!supabaseUrl || !serviceRoleKey || !recaptchaSecret || !ratePepper) {
    const missing = [
      !supabaseUrl && "SUPABASE_URL",
      !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
      !recaptchaSecret && "RECAPTCHA_SECRET_KEY",
      !ratePepper && "RATE_LIMIT_PEPPER",
    ].filter(Boolean).join(", ");
    console.error(`Missing required environment variables: ${missing}`);
    return json({ error: "Server configuration error" }, 500, origin);
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
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ error: "Invalid request" }, 400, origin);
    }
    payload = parsed as Record<string, unknown>;
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

  // ── Connect to Supabase with service role ──────────────────
  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey,
  );

  // ── Rate limiting ───────────────────────────────────────────
  const clientIp = getClientIp(req);
  const ipHash = await hashIp(clientIp, ratePepper);

  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 86_400_000).toISOString();

  const { count: recentAccepted, error: hourErr } = await supabase
    .from("lead_submission_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("accepted", true)
    .gte("attempted_at", oneHourAgo);

  if (hourErr) {
    console.error("Rate-limit hourly check failed:", hourErr.code);
    return json({ error: "Server error. Please try again later." }, 500, origin);
  }

  const { count: recentTotal, error: dayErr } = await supabase
    .from("lead_submission_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("attempted_at", twentyFourHoursAgo);

  if (dayErr) {
    console.error("Rate-limit daily check failed:", dayErr.code);
    return json({ error: "Server error. Please try again later." }, 500, origin);
  }

  if ((recentAccepted ?? 0) >= 3 || (recentTotal ?? 0) >= 5) {
    const reason = (recentAccepted ?? 0) >= 3 ? "rate_limit_hour" : "rate_limit_day";
    const { error: attemptErr } = await supabase.from("lead_submission_attempts").insert({
      ip_hash: ipHash,
      accepted: false,
      rejection_reason: reason,
    });
    if (attemptErr) {
      console.error("Attempt record insert failed:", attemptErr.code);
      return json({ error: "Server error. Please try again later." }, 500, origin);
    }
    return json({ error: "Submission rejected. Please try again later." }, 429, origin);
  }

  // ── reCAPTCHA v2 verification ──────────────────────────────
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
    if (!verifyRes.ok) {
      throw new Error("reCAPTCHA HTTP error");
    }
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
      typeof verifyData.hostname === "string" &&
      validHostnames.includes(verifyData.hostname);
  } catch {
    recaptchaOk = false;
  }

  if (!recaptchaOk) {
    const { error: attemptErr } = await supabase.from("lead_submission_attempts").insert({
      ip_hash: ipHash,
      accepted: false,
      rejection_reason: "recaptcha_failed",
    });
    if (attemptErr) {
      console.error("Attempt record insert failed:", attemptErr.code);
      return json({ error: "Server error. Please try again later." }, 500, origin);
    }
    return json({ error: "Spam verification failed. Please try again." }, 403, origin);
  }

  // ── Duplicate detection ────────────────────────────────────
  let duplicateOf: string | null = null;
  let isDuplicate = false;

  const twentyFourHrsAgo = new Date(Date.now() - 86_400_000).toISOString();
  const { data: recentLeads, error: dupErr } = await supabase
    .from("leads")
    .select("id, normalized_phone, email, message")
    .gte("created_at", twentyFourHrsAgo);

  if (dupErr) {
    console.error("Duplicate detection query failed:", dupErr.code);
    return json({ error: "Server error. Please try again later." }, 500, origin);
  }

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

  // ── Quality scoring ─────────────────────────────────────────
  const spamReasons: string[] = [];
  let spamScore = 0;

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
  if (spamScore >= 60) {
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

  // ── Record accepted attempt ────────────────────────────────
  const { error: attemptErr } = await supabase.from("lead_submission_attempts").insert({
    ip_hash: ipHash,
    accepted: true,
    rejection_reason: null,
  });

  if (attemptErr) {
    console.error("Attempt record insert failed:", attemptErr.code);
    return json({ error: "Server error. Please try again later." }, 500, origin);
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

  // ── Netlify notification mirror (fire-and-forget after lead is saved) ──
  try {
    const netlifyBody = new URLSearchParams({
      "form-name": "contact",
      name,
      phone,
      email: email || "",
      service_name,
      message,
      property_zip,
      landing_page,
      page_path,
      referrer,
      quality,
      spam_score: String(spamScore),
      service_area_status: serviceAreaStatus,
    });

    const netlifyRes = await fetch("https://rodentsextermandinsulationllc.com/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: netlifyBody.toString(),
    });

    if (netlifyRes.ok) {
      console.log("Netlify notification mirror sent");
    } else {
      console.log(`Netlify notification mirror failed: ${netlifyRes.status}`);
    }
  } catch {
    console.log("Netlify notification mirror failed: exception");
  }

  return json({ success: true }, 201, origin);
});
