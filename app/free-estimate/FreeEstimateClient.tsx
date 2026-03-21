"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { useFormEventTracker } from "@/lib/formEventTracker";

type Errors = Record<string, string>;

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const SERVICES = [
  "Tree Removal",
  "Tree Trimming / Pruning",
  "Stump Grinding / Removal",
  "Emergency Tree Service",
  "Arborist Consulting",
] as const;

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "image/tiff",
]);

const ACCEPTED_EXT = ".jpg,.jpeg,.png,.heic,.heif,.webp,.tif,.tiff";
const MAX_PHOTOS = 5;
const MAX_MB = 10;

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

function formatPhoneUS(v: string) {
  const d = digitsOnly(v).slice(0, 10);
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 10);
  if (d.length <= 3) return a;
  if (d.length <= 6) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedType(file: File) {
  if (ACCEPTED_TYPES.has(file.type)) return true;
  if (/\.(heic|heif)$/i.test(file.name)) return true;
  if (/\.(tiff?)$/i.test(file.name)) return true;
  return false;
}

// ── Shared dark-panel style tokens ───────────────────────────────────────────
const dk = {
  input: {
    border: "1.5px solid rgba(255,255,255,0.18)",
    borderRadius: 8,
    padding: "10px 13px",
    fontSize: 14,
    color: "#f0fdf4",
    background: "rgba(255,255,255,0.11)",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  } as React.CSSProperties,

  inputError: {
    borderColor: "rgba(252,165,165,0.65)",
  } as React.CSSProperties,

  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 5,
  } as React.CSSProperties,

  optTag: {
    fontSize: 10,
    fontWeight: 400,
    color: "rgba(255,255,255,0.30)",
    textTransform: "none",
    letterSpacing: 0,
    marginLeft: 4,
  } as React.CSSProperties,

  err: {
    fontSize: 12,
    color: "#fca5a5",
    marginTop: 4,
  } as React.CSSProperties,

  field: {
    marginBottom: 11,
  } as React.CSSProperties,

  btnPrimary: {
    flex: 1,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "13px 16px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background .15s",
  } as React.CSSProperties,

  btnSecondary: {
    flexShrink: 0,
    background: "transparent",
    color: "rgba(255,255,255,0.55)",
    border: "1.5px solid rgba(255,255,255,0.20)",
    borderRadius: 8,
    padding: "13px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,
};

export default function FreeEstimateClient() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const submittedRef = useRef(false);

  const { trackStart, trackFieldError, trackAbandoned, trackSubmitted } =
    useFormEventTracker();

  // 1 = Contact info, 2 = Project details
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [service, setService] = useState<(typeof SERVICES)[number] | "">("");
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [tsToken, setTsToken] = useState("");
  // ≥1024 = desktop split layout, <1024 = mobile single-column
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    trackStart();
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);

    const handleBeforeUnload = () => {
      if (!submittedRef.current) trackAbandoned();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // ── File handling ─────────────────────────────────────────────────────────
  function handleFiles(incoming: File[]) {
    const errs: string[] = [];
    const valid: File[] = [];
    for (const file of incoming) {
      if (!isAcceptedType(file)) {
        errs.push(`"${file.name}" is not a supported format.`);
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        errs.push(`"${file.name}" exceeds the ${MAX_MB} MB limit.`);
        continue;
      }
      valid.push(file);
    }
    setPhotos((prev) => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_PHOTOS) {
        errs.push(`Maximum ${MAX_PHOTOS} photos allowed — extras were skipped.`);
        return combined.slice(0, MAX_PHOTOS);
      }
      return combined;
    });
    setPhotoErrors(errs);
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPhotoErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function validateStep1(): Errors {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address.";
    // Phone optional — only validate format if something was entered
    if (phone && digitsOnly(phone).length !== 10)
      e.phone = "Enter a 10-digit phone number.";
    return e;
  }

  const validationErrors = useMemo(() => {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address.";
    if (phone && digitsOnly(phone).length !== 10)
      e.phone = "Enter a 10-digit phone number.";
    if (!address.trim()) e.address = "Address is required.";
    if (!city.trim()) e.city = "City is required.";
    if (!service) e.service = "Please select a service.";
    return e;
  }, [fullName, phone, email, address, city, service]);

  function advanceToStep2() {
    const errs = validateStep1();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      trackFieldError(Object.keys(errs)[0]);
      return;
    }
    setErrors({});
    setStep(2);
    // Scroll form panel to top on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const nextErrors = validationErrors;
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      trackFieldError(firstKey);
      // If step-1 field has an error, send user back
      if (["fullName", "email", "phone"].includes(firstKey)) setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("fullName", fullName.trim());
      fd.append("phone", digitsOnly(phone));
      fd.append("email", email.trim());
      fd.append("address", address.trim());
      fd.append("city", city.trim());
      fd.append("service", service);
      fd.append("details", details.trim());
      fd.append("turnstileToken", tsToken);
      for (const photo of photos) fd.append("photos", photo);

      try {
        const raw = sessionStorage.getItem("__utm");
        if (raw) {
          const utm = JSON.parse(raw) as Record<string, string>;
          if (utm.utmSource)   fd.append("utmSource",   utm.utmSource);
          if (utm.utmMedium)   fd.append("utmMedium",   utm.utmMedium);
          if (utm.utmCampaign) fd.append("utmCampaign", utm.utmCampaign);
        }
      } catch { /* sessionStorage unavailable */ }

      try {
        const sid = sessionStorage.getItem("__site_session_id");
        if (sid) fd.append("sessionId", sid);
      } catch { /* sessionStorage unavailable */ }

      const res = await fetch("/api/lead", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        const apiErrors: Errors = data?.errors || {};
        setErrors((prev) => ({ ...prev, ...apiErrors }));
        setBanner({ kind: "err", text: data?.error || "Something went wrong. Please try again." });
        return;
      }

      submittedRef.current = true;
      trackSubmitted();
      router.push("/thank-you");
    } catch {
      setBanner({ kind: "err", text: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step indicator ────────────────────────────────────────────────────────
  const stepDefs = [
    { n: 1, label: "Contact" },
    { n: 2, label: "Project" },
    { n: 3, label: "Done"    },
  ];

  function StepIndicator() {
    return (
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {stepDefs.map(({ n, label }, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", flex: i < stepDefs.length - 1 ? "none" : undefined }}>
            {i > 0 && (
              <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.14)", margin: "0 6px" }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: step === n ? "#16a34a" : n < step ? "rgba(22,163,74,0.28)" : "transparent",
                border: step === n ? "none" : n < step ? "1.5px solid rgba(22,163,74,0.50)" : "1.5px solid rgba(255,255,255,0.22)",
                color: step === n ? "#fff" : n < step ? "#86efad" : "rgba(255,255,255,0.35)",
              }}>
                {n < step ? "✓" : n}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: step === n ? "#4ade80" : "rgba(255,255,255,0.38)",
              }}>
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Full-bleed background (image + overlay) ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "url('/assets/og-hero.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center 22%",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: isDesktop
          ? "linear-gradient(to right, rgba(5,15,8,0.10) 0%, rgba(5,15,8,0.08) 45%, rgba(5,15,8,0.48) 100%)"
          : "rgba(5,15,8,0.45)",
      }} />

      {/* ── Page wrapper ── */}
      <div style={{
        position: "relative", zIndex: 2,
        minHeight: "100vh",
        display: "flex",
        alignItems: isDesktop ? "stretch" : "flex-start",
      }}>

        {/* ── LEFT: Hero panel — desktop only ── */}
        {isDesktop && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "flex-end", padding: "0 56px 64px",
          }}>
            {/* Brand pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(22,101,52,0.88)", color: "#bbf7d0",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase",
              padding: "6px 14px", borderRadius: 99, marginBottom: 20, width: "fit-content",
            }}>
              🌲 Santa Cruz Tree Pros
            </div>

            <h1 style={{
              color: "#fff", fontSize: 50, fontWeight: 900,
              lineHeight: 1.06, letterSpacing: "-0.025em", marginBottom: 22,
              margin: "0 0 22px",
            }}>
              Expert Tree Care<br />
              You Can{" "}
              <span style={{ color: "#86efad" }}>Trust</span>
            </h1>

            {/* Trust bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {["Licensed & Insured", "Crane removal, trimming & stump grinding"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.82)", fontSize: 14 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RIGHT: Dark glass form panel ── */}
        <div style={{
          width: isDesktop ? 460 : "100%",
          flexShrink: 0,
          minHeight: "100vh",
          background: "rgba(18, 36, 22, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderLeft: isDesktop ? "1px solid rgba(255,255,255,0.09)" : "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isDesktop ? "48px 40px" : "40px 24px 56px",
          boxSizing: "border-box",
        }}>

          {/* Mobile: compact brand header inside panel */}
          {!isDesktop && (
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(22,101,52,0.88)", color: "#bbf7d0",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase",
                padding: "5px 13px", borderRadius: 99, marginBottom: 14,
              }}>
                🌲 Santa Cruz Tree Pros
              </div>
              <div style={{
                color: "#fff", fontSize: 26, fontWeight: 900,
                lineHeight: 1.1, letterSpacing: "-0.02em",
              }}>
                Expert Tree Care You Can{" "}
                <span style={{ color: "#86efad" }}>Trust</span>
              </div>
            </div>
          )}

          <StepIndicator />

          {/* ════════════════ STEP 1: Contact ════════════════ */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                Let&apos;s get started
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", marginBottom: 22, lineHeight: 1.5 }}>
                We&apos;ll use this to send your estimate. Takes 60 seconds.
              </p>

              {/* Full Name */}
              <div data-field="fullName" style={dk.field}>
                <label style={dk.label}>Full Name *</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  style={{ ...dk.input, ...(errors.fullName ? dk.inputError : {}) }}
                />
                {errors.fullName && <div style={dk.err}>{errors.fullName}</div>}
              </div>

              {/* Email */}
              <div data-field="email" style={dk.field}>
                <label style={dk.label}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@email.com"
                  autoComplete="email"
                  inputMode="email"
                  style={{ ...dk.input, ...(errors.email ? dk.inputError : {}) }}
                />
                {errors.email && <div style={dk.err}>{errors.email}</div>}
              </div>

              {/* Phone — optional */}
              <div data-field="phone" style={{ ...dk.field, marginBottom: 24 }}>
                <label style={dk.label}>
                  Phone
                  <span style={dk.optTag}>optional</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneUS(e.target.value))}
                  placeholder="(831) 555-0100"
                  autoComplete="tel"
                  inputMode="tel"
                  style={{ ...dk.input, ...(errors.phone ? dk.inputError : {}) }}
                />
                {errors.phone && <div style={dk.err}>{errors.phone}</div>}
              </div>

              <button
                type="button"
                onClick={advanceToStep2}
                style={{ ...dk.btnPrimary, width: "100%" }}
              >
                Next: Project Details →
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                {["🔒 Secure & private", "✓ No spam, ever"].map((t) => (
                  <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2: Project ════════════════ */}
          {step === 2 && (
            <form ref={formRef} onSubmit={onSubmit}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                About your project
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", marginBottom: 22, lineHeight: 1.5 }}>
                Help us give you an accurate estimate.
              </p>

              {/* Error banner */}
              {banner && (
                <div style={{
                  marginBottom: 16, padding: "10px 14px", borderRadius: 8, fontSize: 13,
                  background: banner.kind === "ok" ? "rgba(22,163,74,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${banner.kind === "ok" ? "rgba(22,163,74,0.35)" : "rgba(239,68,68,0.35)"}`,
                  color: banner.kind === "ok" ? "#86efad" : "#fca5a5",
                }}>
                  {banner.text}
                </div>
              )}

              {/* Service */}
              <div data-field="service" style={dk.field}>
                <label style={dk.label}>Service Needed *</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as typeof service)}
                  style={{ ...dk.input, ...(errors.service ? dk.inputError : {}) }}
                >
                  <option value="">Select a service…</option>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.service && <div style={dk.err}>{errors.service}</div>}
              </div>

              {/* Address — full width */}
              <div data-field="address" style={dk.field}>
                <label style={dk.label}>Street Address *</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  autoComplete="street-address"
                  style={{ ...dk.input, ...(errors.address ? dk.inputError : {}) }}
                />
                {errors.address && <div style={dk.err}>{errors.address}</div>}
              </div>

              {/* City — full width */}
              <div data-field="city" style={dk.field}>
                <label style={dk.label}>City *</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Santa Cruz"
                  autoComplete="address-level2"
                  style={{ ...dk.input, ...(errors.city ? dk.inputError : {}) }}
                />
                {errors.city && <div style={dk.err}>{errors.city}</div>}
              </div>

              {/* Details */}
              <div style={dk.field}>
                <label style={dk.label}>
                  Details
                  <span style={dk.optTag}>optional</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe the tree, the situation, any urgency…"
                  rows={3}
                  style={{ ...dk.input, minHeight: 80, resize: "vertical" }}
                />
              </div>

              {/* Photo upload */}
              <div style={{ marginBottom: 11 }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(Array.from(e.dataTransfer.files));
                  }}
                  style={{
                    border: "1.5px dashed rgba(255,255,255,0.18)", borderRadius: 8,
                    padding: "14px 12px", textAlign: "center", cursor: "pointer",
                    color: "rgba(255,255,255,0.42)", fontSize: 13,
                  }}
                >
                  📷{" "}
                  <span style={{ color: "#4ade80", textDecoration: "underline" }}>
                    Upload photos
                  </span>
                  {" "}for a more accurate estimate
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.26)", marginTop: 4 }}>
                    JPG, PNG, HEIC · up to {MAX_MB} MB each · {MAX_PHOTOS} max
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXT}
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                  />
                </div>

                {photoErrors.length > 0 && (
                  <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: "none" }}>
                    {photoErrors.map((err, i) => (
                      <li key={i} style={{ fontSize: 12, color: "#fca5a5" }}>{err}</li>
                    ))}
                  </ul>
                )}

                {photos.length > 0 && (
                  <ul style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, paddingLeft: 0, listStyle: "none" }}>
                    {photos.map((file, idx) => (
                      <li key={idx} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px",
                        fontSize: 13, color: "rgba(255,255,255,0.80)",
                      }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          📄 {file.name} ({formatBytes(file.size)})
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.40)", cursor: "pointer", flexShrink: 0, marginLeft: 8, fontSize: 14 }}
                          aria-label={`Remove ${file.name}`}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Back + Submit */}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => { setErrors({}); setStep(1); }}
                  style={dk.btnSecondary}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...dk.btnPrimary, opacity: submitting ? 0.65 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
                >
                  {submitting ? "Submitting…" : "Request Free Estimate →"}
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                {["🚫 No obligation", "✉ Timely response to estimate requests"].map((t) => (
                  <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t}</span>
                ))}
              </div>

              {/* Invisible Turnstile */}
              {TURNSTILE_SITE_KEY && (
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  options={{ size: "invisible" }}
                  onSuccess={(token) => setTsToken(token)}
                  onExpire={() => setTsToken("")}
                  onError={() => setTsToken("")}
                />
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
