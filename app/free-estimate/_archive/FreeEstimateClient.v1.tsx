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
  // HEIC/HEIF files often have empty or wrong MIME type in some browsers
  if (/\.(heic|heif)$/i.test(file.name)) return true;
  // TIFF fallback
  if (/\.(tiff?)$/i.test(file.name)) return true;
  return false;
}

export default function FreeEstimatePage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const submittedRef = useRef(false);

  const { trackStart, trackFieldError, trackAbandoned, trackSubmitted } =
    useFormEventTracker();

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
  // isMobile starts true (SSR-safe default) so Turnstile is never rendered
  // until we confirm the device is desktop.
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    trackStart();
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);

    const handleBeforeUnload = () => {
      if (!submittedRef.current) {
        trackAbandoned();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
    // Reset input so same file can be re-added if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const validationErrors = useMemo(() => {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (digitsOnly(phone).length !== 10) e.phone = "Enter a 10-digit phone number.";
    if (!email.trim()) e.email = "Email is required.";
    if (!address.trim()) e.address = "Address is required.";
    if (!city.trim()) e.city = "City is required.";
    if (!service) e.service = "Service is required.";
    // Invisible Turnstile — no user action required, token arrives automatically
    return e;
  }, [fullName, phone, email, address, city, service]);

  function scrollToFirstInvalid(nextErrors: Errors) {
    const order = ["fullName", "phone", "email", "address", "city", "service", "turnstile"] as const;
    const firstKey = order.find((k) => nextErrors[k]);
    if (!firstKey) return;
    const el = document.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as any)?.focus?.();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const nextErrors = validationErrors;
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      trackFieldError(firstKey);
      scrollToFirstInvalid(nextErrors);
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
      for (const photo of photos) {
        fd.append("photos", photo);
      }

      // Attach UTM attribution from sessionStorage (set by SiteAnalytics on landing)
      try {
        const raw = sessionStorage.getItem("__utm");
        if (raw) {
          const utm = JSON.parse(raw) as Record<string, string>;
          if (utm.utmSource)   fd.append("utmSource",   utm.utmSource);
          if (utm.utmMedium)   fd.append("utmMedium",   utm.utmMedium);
          if (utm.utmCampaign) fd.append("utmCampaign", utm.utmCampaign);
        }
      } catch {
        // sessionStorage unavailable — skip UTM
      }

      // Attach session ID so the lead can be joined to its PageView journey
      try {
        const sid = sessionStorage.getItem("__site_session_id");
        if (sid) fd.append("sessionId", sid);
      } catch {
        // sessionStorage unavailable — skip
      }

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

  const fieldBase =
    "mt-1 h-[46px] w-full rounded-lg border border-[var(--border)] bg-white px-3 text-base text-[var(--text)] outline-none transition-colors focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20";
  const fieldInvalid = "border-red-400 focus:border-red-400 focus:ring-red-400/20";

  return (
    <main className="site-container py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Get a Free Estimate</h1>
          <p className="mt-2 text-[var(--muted)]">
            Tell us about your trees and property. We'll review your details, follow up quickly, and provide a
            clear estimate — no obligation. Photos are helpful but not required. The more detail you share,
            the faster we can put together an accurate quote.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl bg-white p-6 sm:p-8" style={{ border: "1px solid var(--border)", borderTopWidth: "3px", borderTopColor: "var(--brand-green)", boxShadow: "0 4px 24px rgba(27,94,53,0.12)" }}>
          {banner ? (
            <div
              className={[
                "mb-6 rounded-lg border px-4 py-3 text-sm font-medium",
                banner.kind === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800",
              ].join(" ")}
            >
              {banner.text}
            </div>
          ) : null}

          <form ref={formRef} onSubmit={onSubmit} className="grid gap-5">

            {/* Row 1: Name + Phone */}
            <div className="grid gap-5 sm:grid-cols-2">
              <label data-field="fullName" className="block">
                <span className="text-sm font-medium text-[var(--text)]">Full Name *</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={[fieldBase, errors.fullName ? fieldInvalid : ""].join(" ")}
                  autoComplete="name"
                />
                {errors.fullName ? <div className="mt-1 text-sm text-red-600">{errors.fullName}</div> : null}
              </label>

              <label data-field="phone" className="block">
                <span className="text-sm font-medium text-[var(--text)]">Phone *</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneUS(e.target.value))}
                  inputMode="tel"
                  className={[fieldBase, errors.phone ? fieldInvalid : ""].join(" ")}
                  placeholder="(555) 555-5555"
                  autoComplete="tel"
                />
                {errors.phone ? <div className="mt-1 text-sm text-red-600">{errors.phone}</div> : null}
              </label>
            </div>

            {/* Row 2: Email — full width */}
            <label data-field="email" className="block">
              <span className="text-sm font-medium text-[var(--text)]">Email *</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                className={[fieldBase, errors.email ? fieldInvalid : ""].join(" ")}
                autoComplete="email"
              />
              {errors.email ? <div className="mt-1 text-sm text-red-600">{errors.email}</div> : null}
            </label>

            {/* Row 3: Address — full width */}
            <label data-field="address" className="block">
              <span className="text-sm font-medium text-[var(--text)]">Address *</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={[fieldBase, errors.address ? fieldInvalid : ""].join(" ")}
                autoComplete="street-address"
                placeholder="123 Main St"
              />
              {errors.address ? <div className="mt-1 text-sm text-red-600">{errors.address}</div> : null}
            </label>

            {/* Row 4: City + Service */}
            <div className="grid gap-5 sm:grid-cols-2">
              <label data-field="city" className="block">
                <span className="text-sm font-medium text-[var(--text)]">City *</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={[fieldBase, errors.city ? fieldInvalid : ""].join(" ")}
                  autoComplete="address-level2"
                />
                {errors.city ? <div className="mt-1 text-sm text-red-600">{errors.city}</div> : null}
              </label>

              <label data-field="service" className="block">
                <span className="text-sm font-medium text-[var(--text)]">Service Needed *</span>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as any)}
                  className={[fieldBase, errors.service ? fieldInvalid : ""].join(" ")}
                >
                  <option value="">Select a service...</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.service ? <div className="mt-1 text-sm text-red-600">{errors.service}</div> : null}
              </label>
            </div>

            {/* Details */}
            <label className="block">
              <span className="text-sm font-medium text-[var(--text)]">Details (optional)</span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-3 text-base text-[var(--text)] outline-none transition-colors focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20"
                rows={4}
                placeholder="Describe the tree, the situation, any urgency, etc."
              />
            </label>

            {/* Photo upload */}
            <div>
              <span className="text-sm font-medium text-[var(--text)]">Photos (optional)</span>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Up to {MAX_PHOTOS} photos &middot; {MAX_MB} MB each &middot; JPG, PNG, HEIC, WebP, or TIFF
              </p>

              {/* Drop zone */}
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
                className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-soft)] px-4 py-6 text-center transition-colors hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/5"
              >
                <svg className="h-8 w-8 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  <span className="font-medium text-[var(--brand-accent)]">Click to upload</span> or drag and drop
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Photos help us give you a faster, more accurate estimate
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXT}
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                />
              </div>

              {/* File errors */}
              {photoErrors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {photoErrors.map((err, i) => (
                    <li key={i} className="text-sm text-red-600">{err}</li>
                  ))}
                </ul>
              )}

              {/* Selected file list */}
              {photos.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {photos.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="h-4 w-4 shrink-0 text-[var(--brand-accent)]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate text-[var(--text)]">{file.name}</span>
                        <span className="shrink-0 text-[var(--muted)]">({formatBytes(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="ml-3 shrink-0 text-[var(--muted)] hover:text-red-500 transition-colors"
                        aria-label={`Remove ${file.name}`}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--brand-green)] text-base font-semibold text-white shadow-sm hover:bg-[var(--brand-green-dark)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>

            <p className="text-xs text-[var(--muted)]">* Required fields</p>

            {/* Invisible Turnstile — no UI, works on all devices */}
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
        </div>

        {/* What happens next */}
        <div className="mt-8 rounded-xl bg-white p-6" style={{ borderTop: "3px solid var(--brand-green)", border: "1px solid var(--border)", borderTopWidth: "3px", borderTopColor: "var(--brand-green)", boxShadow: "0 4px 24px rgba(27,94,53,0.12)" }}>
          <h2 className="text-xl font-semibold text-[var(--text)]">What happens next</h2>
          <ul className="mt-3 grid gap-2.5 text-[var(--muted)] sm:grid-cols-2">
            {[
              "We review your request quickly",
              "Photos help us give a faster, accurate estimate",
              "We provide a clear scope + estimate",
              "We schedule a time that works for you",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg className="h-4 w-4 shrink-0 mt-0.5 text-[var(--brand-accent)]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
