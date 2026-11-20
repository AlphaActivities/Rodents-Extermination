import { createClient } from "npm:@supabase/supabase-js@2";

// ============================================================
// Configuration
// ============================================================

const ALLOWED_ORIGINS = [
  "https://rodentsextermandinsulationllc.com",
  "https://www.rodentsextermandinsulationllc.com",
  "https://bolt.new",
  "http://localhost:5173",
] as const;

const APPROVED_SERVICES = [
  "Attic Insulation",
  "Radiant Barrier",
  "Rodent Control",
  "Wildlife Removal",
  "Sanitation & Cleanup",
  "Commercial Services",
  "Other / General Inquiry",
] as const;

const VALID_RECAPTCHA_HOSTNAMES = [
  "rodentsextermandinsulationllc.com",
  "www.rodentsextermandinsulationllc.com",
  "bolt.new",
] as const;

const SOLICITATION_TERMS = [
  "ai agent",
  "ai employee",
  "seo services",
  "marketing services",
  "website services",
  "lead generation",
  "promotional song",
  "sell you",
  "grow your business",
  "outsourcing",
  "backlink",
  "guest post",
  "content writing",
  "digital marketing",
] as const;

const MAX_BODY_BYTES = 16_384;
const MAX_ACCEPTED_PER_HOUR = 3;
const MAX_ACCEPTED_PER_DAY = 5;

type Quality =
  | "likely_customer"
  | "needs_review"
  | "solicitation"
  | "spam"
  | "duplicate"
  | "out_of_area";

type ServiceAreaStatus =
  | "inside"
  | "bordering"
  | "outside"
  | "unknown";

type PublicPayload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  service_name?: unknown;
  message?: unknown;
  property_zip?: unknown;
  landing_page?: unknown;
  page_path?: unknown;
  referrer?: unknown;
  recaptcha_token?: unknown;
  bot_field?: unknown;
  form_started_at?: unknown;
};

// ============================================================
// Response and CORS helpers
// ============================================================

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin &&
    ALLOWED_ORIGINS.includes(origin as (typeof ALLOWED_ORIGINS)[number])
      ? origin
      : "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Client-Info, Apikey",
    "Vary": "Origin",
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

// ============================================================
// Validation and normalization helpers
// ============================================================

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function isValidEmail(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstAddress = forwardedFor.split(",")[0]?.trim();

    if (firstAddress) {
      return firstAddress;
    }
  }

  const cloudflareAddress = req.headers
    .get("cf-connecting-ip")
    ?.trim();

  return cloudflareAddress || "unknown";
}

async function hashIp(
  ip: string,
  pepper: string,
): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const NETLIFY_FORM_NAME = "contact";
const NETLIFY_FORM_ENDPOINT =
  "https://rodentsextermandinsulationllc.com/";

type NetlifyMirrorInput = {
  name: string;
  phone: string;
  email: string;
  serviceName: string;
  message: string;
  propertyZip: string;
  landingPage: string;
  pagePath: string;
  referrer: string;
  quality: Quality;
  spamScore: number;
  serviceAreaStatus: ServiceAreaStatus;
};

async function sendNetlifyMirror(
  input: NetlifyMirrorInput,
): Promise<void> {
  const body = new URLSearchParams({
    "form-name": NETLIFY_FORM_NAME,
    name: input.name,
    phone: input.phone,
    email: input.email,
    service_name: input.serviceName,
    message: input.message,
    property_zip: input.propertyZip,
    landing_page: input.landingPage,
    page_path: input.pagePath,
    referrer: input.referrer,
    quality: input.quality,
    spam_score: String(input.spamScore),
    service_area_status: input.serviceAreaStatus,
  });

  try {
    const response = await fetch(NETLIFY_FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (response.ok) {
      console.log("Netlify notification mirror sent");
      return;
    }

    console.error(
      `Netlify notification mirror failed: ${response.status}`,
    );
  } catch (error) {
    console.error(
      "Netlify notification mirror failed: request_error",
      error instanceof Error ? error.message : "unknown_error",
    );
  }
}

// ============================================================
// Main function
// ============================================================

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(origin),
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed" },
      405,
      origin,
    );
  }

  // ----------------------------------------------------------
  // Required server environment
  // ----------------------------------------------------------

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );
  const recaptchaSecret = Deno.env.get(
    "RECAPTCHA_SECRET_KEY",
  );
  const rateLimitPepper = Deno.env.get(
    "RATE_LIMIT_PEPPER",
  );

  const missingVariables: string[] = [];

  if (!supabaseUrl) {
    missingVariables.push("SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    missingVariables.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!recaptchaSecret) {
    missingVariables.push("RECAPTCHA_SECRET_KEY");
  }

  if (!rateLimitPepper) {
    missingVariables.push("RATE_LIMIT_PEPPER");
  }

  if (missingVariables.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );

    return jsonResponse(
      { error: "Server configuration error" },
      500,
      origin,
    );
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  // ----------------------------------------------------------
  // Body-size validation
  // ----------------------------------------------------------

  const contentLengthHeader = req.headers.get(
    "content-length",
  );

  if (contentLengthHeader) {
    const contentLength = Number.parseInt(
      contentLengthHeader,
      10,
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_BODY_BYTES
    ) {
      return jsonResponse(
        { error: "Request too large" },
        413,
        origin,
      );
    }
  }

  let parsedPayload: unknown;

  try {
    const rawBody = await req.text();

    if (
      new TextEncoder().encode(rawBody).byteLength >
      MAX_BODY_BYTES
    ) {
      return jsonResponse(
        { error: "Request too large" },
        413,
        origin,
      );
    }

    parsedPayload = JSON.parse(rawBody);
  } catch {
    return jsonResponse(
      { error: "Invalid JSON" },
      400,
      origin,
    );
  }

  if (
    parsedPayload === null ||
    typeof parsedPayload !== "object" ||
    Array.isArray(parsedPayload)
  ) {
    return jsonResponse(
      { error: "Invalid request body" },
      400,
      origin,
    );
  }

  const payload = parsedPayload as PublicPayload;

  // ----------------------------------------------------------
  // Parse only approved public fields
  // ----------------------------------------------------------

  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const email = String(payload.email ?? "")
    .trim()
    .toLowerCase();

  const serviceName = String(
    payload.service_name ?? "",
  ).trim();

  const message = String(payload.message ?? "").trim();

  const propertyZip = String(
    payload.property_zip ?? "",
  ).trim();

  const landingPage = String(
    payload.landing_page ?? "",
  )
    .trim()
    .slice(0, 2048);

  const pagePath = String(payload.page_path ?? "")
    .trim()
    .slice(0, 512);

  const referrer = String(payload.referrer ?? "")
    .trim()
    .slice(0, 2048);

  const recaptchaToken = String(
    payload.recaptcha_token ?? "",
  ).trim();

  const botField = String(
    payload.bot_field ?? "",
  ).trim();

  const formStartedAt = payload.form_started_at;

  // ----------------------------------------------------------
  // Honeypot
  // ----------------------------------------------------------

  if (botField) {
    return jsonResponse(
      { error: "Submission rejected" },
      422,
      origin,
    );
  }

  // ----------------------------------------------------------
  // Public-field validation
  // ----------------------------------------------------------

  const validationErrors: string[] = [];
  const normalizedPhone = normalizePhone(phone);

  if (name.length < 2 || name.length > 80) {
    validationErrors.push(
      "Please enter your name (2–80 characters).",
    );
  }

  if (
    normalizedPhone.length < 10 ||
    normalizedPhone.length > 11
  ) {
    validationErrors.push(
      "Please enter a valid US phone number.",
    );
  }

  if (email && !isValidEmail(email)) {
    validationErrors.push(
      "Please enter a valid email address.",
    );
  }

  if (
    !APPROVED_SERVICES.includes(
      serviceName as (typeof APPROVED_SERVICES)[number],
    )
  ) {
    validationErrors.push("Please select a service.");
  }

  if (message.length < 10 || message.length > 1500) {
    validationErrors.push(
      "Please describe your problem (10–1500 characters).",
    );
  }

  if (!/^\d{5}$/.test(propertyZip)) {
    validationErrors.push(
      "Please enter a valid 5-digit ZIP code.",
    );
  }

  if (!recaptchaToken) {
    validationErrors.push(
      "Please complete the spam check.",
    );
  }

  if (validationErrors.length > 0) {
    return jsonResponse(
      { error: validationErrors.join(" ") },
      422,
      origin,
    );
  }

  // ----------------------------------------------------------
  // Verify Google reCAPTCHA v2
  // ----------------------------------------------------------

  let recaptchaVerified = false;

  try {
    const verificationResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: recaptchaSecret,
          response: recaptchaToken,
        }),
      },
    );

    if (verificationResponse.ok) {
      const verificationData =
        await verificationResponse.json() as {
          success?: unknown;
          hostname?: unknown;
        };

      recaptchaVerified =
        verificationData.success === true &&
        typeof verificationData.hostname === "string" &&
        VALID_RECAPTCHA_HOSTNAMES.includes(
          verificationData.hostname as
            (typeof VALID_RECAPTCHA_HOSTNAMES)[number],
        );
    }
  } catch {
    console.error(
      "reCAPTCHA verification request failed",
    );
  }

  // ----------------------------------------------------------
  // Create privacy-preserving rate-limit key
  // ----------------------------------------------------------

  const clientIp = getClientIp(req);
  const ipHash = await hashIp(
    clientIp,
    rateLimitPepper,
  );

  async function recordAttempt(
    accepted: boolean,
    rejectionReason: string | null,
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from("lead_submission_attempts")
      .insert({
        ip_hash: ipHash,
        accepted,
        rejection_reason: rejectionReason,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Attempt record insert failed:",
        error.code,
      );

      return null;
    }

    return typeof data?.id === "string"
      ? data.id
      : null;
  }

  if (!recaptchaVerified) {
    const attemptId = await recordAttempt(
      false,
      "recaptcha_failed",
    );

    if (!attemptId) {
      return jsonResponse(
        { error: "Unable to process submission" },
        500,
        origin,
      );
    }

    return jsonResponse(
      {
        error:
          "Spam verification failed. Please try again.",
      },
      403,
      origin,
    );
  }

  // ----------------------------------------------------------
  // Rate limiting
  // ----------------------------------------------------------

  const oneHourAgo = new Date(
    Date.now() - 60 * 60 * 1000,
  ).toISOString();

  const oneDayAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toISOString();

  const {
    count: acceptedLastHour,
    error: hourlyRateLimitError,
  } = await supabase
    .from("lead_submission_attempts")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("ip_hash", ipHash)
    .eq("accepted", true)
    .gte("attempted_at", oneHourAgo);

  if (hourlyRateLimitError) {
    console.error(
      "Hourly rate-limit query failed:",
      hourlyRateLimitError.code,
    );

    return jsonResponse(
      { error: "Unable to process submission" },
      500,
      origin,
    );
  }

  const {
    count: acceptedLastDay,
    error: dailyRateLimitError,
  } = await supabase
    .from("lead_submission_attempts")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("ip_hash", ipHash)
    .eq("accepted", true)
    .gte("attempted_at", oneDayAgo);

  if (dailyRateLimitError) {
    console.error(
      "Daily rate-limit query failed:",
      dailyRateLimitError.code,
    );

    return jsonResponse(
      { error: "Unable to process submission" },
      500,
      origin,
    );
  }

  let rateLimitReason: string | null = null;

  if (
    (acceptedLastHour ?? 0) >=
    MAX_ACCEPTED_PER_HOUR
  ) {
    rateLimitReason = "rate_limit_hour";
  } else if (
    (acceptedLastDay ?? 0) >=
    MAX_ACCEPTED_PER_DAY
  ) {
    rateLimitReason = "rate_limit_day";
  }

  if (rateLimitReason) {
    const attemptId = await recordAttempt(
      false,
      rateLimitReason,
    );

    if (!attemptId) {
      return jsonResponse(
        { error: "Unable to process submission" },
        500,
        origin,
      );
    }

    return jsonResponse(
      {
        error:
          "Too many submissions. Please try again later.",
      },
      429,
      origin,
    );
  }

  // ----------------------------------------------------------
  // Duplicate detection
  // ----------------------------------------------------------

  const duplicateWindowStart = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toISOString();

  const {
    data: recentLeads,
    error: duplicateQueryError,
  } = await supabase
    .from("leads")
    .select("id, normalized_phone, email, message")
    .gte("created_at", duplicateWindowStart);

  if (duplicateQueryError) {
    console.error(
      "Duplicate detection query failed:",
      duplicateQueryError.code,
    );

    return jsonResponse(
      { error: "Unable to process submission" },
      500,
      origin,
    );
  }

  let duplicateOf: string | null = null;

  for (const recentLead of recentLeads ?? []) {
    const phoneMatch =
      typeof recentLead.normalized_phone === "string" &&
      recentLead.normalized_phone === normalizedPhone;

    const emailMatch =
      Boolean(email) &&
      typeof recentLead.email === "string" &&
      recentLead.email.toLowerCase() === email;

    const previousMessage =
      typeof recentLead.message === "string"
        ? recentLead.message.trim()
        : "";

    const messageMatch =
      message.length > 20 &&
      previousMessage.length > 20 &&
      (
        previousMessage === message ||
        previousMessage.includes(message) ||
        message.includes(previousMessage)
      );

    if (
      phoneMatch &&
      (emailMatch || messageMatch)
    ) {
      duplicateOf = recentLead.id;
      break;
    }
  }

  // ----------------------------------------------------------
  // Transparent quality scoring
  // ----------------------------------------------------------

  const spamReasons: string[] = [];
  let spamScore = 0;

  if (
    typeof formStartedAt === "string" ||
    typeof formStartedAt === "number"
  ) {
    const startedTimestamp = new Date(
      formStartedAt,
    ).getTime();

    if (!Number.isNaN(startedTimestamp)) {
      const elapsedSeconds =
        (Date.now() - startedTimestamp) / 1000;

      if (
        elapsedSeconds >= 0 &&
        elapsedSeconds < 3
      ) {
        spamReasons.push("impossible_speed");
        spamScore += 20;
      }
    }
  }

  if (
    /^[bcdfghjklmnpqrstvwxyz]{1,3}$/i.test(name) ||
    /^(.)\1{2,}$/.test(name)
  ) {
    spamReasons.push("random_name");
    spamScore += 15;
  }

  if (
    !/\s/.test(message) ||
    /^(.)\1{10,}$/.test(message)
  ) {
    spamReasons.push("gibberish_message");
    spamScore += 20;
  }

  const lowercaseMessage = message.toLowerCase();

  if (
    SOLICITATION_TERMS.some((term) =>
      lowercaseMessage.includes(term)
    )
  ) {
    spamReasons.push("solicitation_language");
    spamScore += 25;
  }

  // Exact service-area ZIP codes can be added later.
  const serviceAreaZips: readonly string[] = [];

  let serviceAreaStatus: ServiceAreaStatus =
    "unknown";

  if (serviceAreaZips.length > 0) {
    serviceAreaStatus =
      serviceAreaZips.includes(propertyZip)
        ? "inside"
        : "outside";

    if (serviceAreaStatus === "outside") {
      spamReasons.push("out_of_area");
      spamScore += 10;
    }
  }

  if (duplicateOf) {
    spamReasons.push("duplicate_contact");
    spamScore += 30;
  }

  let quality: Quality;

  if (spamScore >= 60) {
    quality = "spam";
  } else if (duplicateOf) {
    quality = "duplicate";
  } else if (
    spamReasons.includes("solicitation_language")
  ) {
    quality = "solicitation";
  } else if (
    spamReasons.includes("out_of_area")
  ) {
    quality = "out_of_area";
  } else if (spamScore >= 25) {
    quality = "needs_review";
  } else {
    quality = "likely_customer";
  }

  // ----------------------------------------------------------
  // Record accepted attempt
  // ----------------------------------------------------------

  const acceptedAttemptId = await recordAttempt(
    true,
    null,
  );

  if (!acceptedAttemptId) {
    return jsonResponse(
      { error: "Unable to process submission" },
      500,
      origin,
    );
  }

  // ----------------------------------------------------------
  // Insert lead using service-role access
  // ----------------------------------------------------------

  const { error: leadInsertError } = await supabase
    .from("leads")
    .insert({
      name,
      phone,
      email: email || null,
      service_name: serviceName,
      message,
      property_zip: propertyZip,
      normalized_phone: normalizedPhone,
      landing_page: landingPage || null,
      page_path: pagePath || null,
      referrer: referrer || null,
      status: "new",
      quality,
      spam_score: spamScore,
      spam_reasons: spamReasons,
      duplicate_of: duplicateOf,
      service_area_status: serviceAreaStatus,
    });

  if (leadInsertError) {
    console.error(
      "Lead insert failed:",
      leadInsertError.code,
    );

    const { error: correctionError } =
      await supabase
        .from("lead_submission_attempts")
        .update({
          accepted: false,
          rejection_reason: "lead_insert_failed",
        })
        .eq("id", acceptedAttemptId);

    if (correctionError) {
      console.error(
        "Attempt correction failed:",
        correctionError.code,
      );
    }

    return jsonResponse(
      {
        error:
          "Unable to submit. Please call us instead.",
      },
      500,
      origin,
    );
  }

  await sendNetlifyMirror({
    name,
    phone,
    email,
    serviceName,
    message,
    propertyZip,
    landingPage,
    pagePath,
    referrer,
    quality,
    spamScore,
    serviceAreaStatus,
  });

  return jsonResponse(
    { success: true },
    201,
    origin,
  );
});