"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

type Errors = Record<string, string>;

const SERVICES = [
  "Tree Removal",
  "Tree Trimming / Pruning",
  "Stump Grinding / Removal",
  "Emergency Tree Service",
  "Arborist Consulting",
] as const;

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

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [service, setService] = useState<(typeof SERVICES)[number] | "">("");
  const [details, setDetails] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [tsToken, setTsToken] = useState<string>("");
  const [tsKeyMissing, setTsKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) setTsKeyMissing(true);
  }, []);

  const validationErrors = useMemo(() => {
    const e: Errors = {};
    if (!fullName.trim()) e.fullName = "Full name is required.";
    if (digitsOnly(phone).length !== 10) e.phone = "Enter a 10-digit phone number.";
    if (!email.trim()) e.email = "Email is required.";
    if (!address.trim()) e.address = "Address is required.";
    if (!city.trim()) e.city = "City is required.";
    if (!service) e.service = "Service is required.";
    if (!tsToken) e.turnstile = "Please complete the CAPTCHA.";
    return e;
  }, [fullName, phone, email, address, city, service, tsToken]);

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
      scrollToFirstInvalid(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: digitsOnly(phone),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          service,
          details: details.trim(),
          turnstileToken: tsToken,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        const apiErrors: Errors = data?.errors || {};
        setErrors((prev) => ({ ...prev, ...apiErrors }));
        setBanner({ kind: "err", text: data?.error || "Something went wrong. Please try again." });
        return;
      }

      setBanner({ kind: "ok", text: "Submitted! We’ll follow up shortly." });
      setErrors({});
      setTsToken("");

      setFullName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setCity("");
      setService("");
      setDetails("");

      formRef.current?.reset();
    } catch {
      setBanner({ kind: "err", text: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // NOTE: height was requested +3px without changing padding
  const fieldBase =
    "mt-1 h-[46px] w-full rounded-lg border border-[var(--border)] bg-white px-3 text-base text-[var(--text)] outline-none focus:border-[var(--brand-accent)]";
  const fieldInvalid = "border-red-500 focus:border-red-500";

  return (
    <main className="site-container py-10">
      {/* HARD OVERRIDES: prevent ANY hover movement or background change on this form card */}
      <style jsx global>{`
        /* If your global CSS has .surface-card:hover rules, this will beat it. */
        .no-hover-card,
        .no-hover-card:hover,
        .no-hover-card:focus-within {
          transform: none !important;
          box-shadow: none !important;
          background-color: var(--surface) !important;
        }

        /* Kill hover visual changes for form controls inside this card */
        .no-hover-card input,
        .no-hover-card select,
        .no-hover-card textarea,
        .no-hover-card button {
          transition: none !important;
        }

        .no-hover-card input:hover,
        .no-hover-card select:hover,
        .no-hover-card textarea:hover {
          background-color: #fff !important;
          border-color: var(--border) !important;
        }

        .no-hover-card button:hover {
          transform: none !important;
        }
      `}</style>

      <div className="surface-card no-hover-card p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Request an Estimate</h1>
        <p className="mt-2 text-[var(--muted)]">Tell us what you need and we’ll follow up with next steps.</p>

        {banner ? (
          <div
            className={[
              "mt-6 rounded-xl border px-4 py-3 text-sm font-semibold",
              banner.kind === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800",
            ].join(" ")}
          >
            {banner.text}
          </div>
        ) : null}

        {tsKeyMissing ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Missing <span className="font-mono">NEXT_PUBLIC_TURNSTILE_SITE_KEY</span> in{" "}
            <span className="font-mono">.env.local</span>.
          </div>
        ) : null}

        <form ref={formRef} onSubmit={onSubmit} className="mt-6 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label data-field="fullName" className="block">
              <span className="text-sm font-semibold">Full Name *</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={[fieldBase, errors.fullName ? fieldInvalid : ""].join(" ")}
                autoComplete="name"
              />
              {errors.fullName ? <div className="mt-1 text-sm text-red-600">{errors.fullName}</div> : null}
            </label>

            <label data-field="phone" className="block">
              <span className="text-sm font-semibold">Phone *</span>
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

            <label data-field="email" className="block">
              <span className="text-sm font-semibold">Email *</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                className={[fieldBase, errors.email ? fieldInvalid : ""].join(" ")}
                autoComplete="email"
              />
              {errors.email ? <div className="mt-1 text-sm text-red-600">{errors.email}</div> : null}
            </label>

            <label data-field="address" className="block">
              <span className="text-sm font-semibold">Address *</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={[fieldBase, errors.address ? fieldInvalid : ""].join(" ")}
                autoComplete="street-address"
              />
              {errors.address ? <div className="mt-1 text-sm text-red-600">{errors.address}</div> : null}
            </label>

            <label data-field="city" className="block">
              <span className="text-sm font-semibold">City *</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={[fieldBase, errors.city ? fieldInvalid : ""].join(" ")}
                autoComplete="address-level2"
              />
              {errors.city ? <div className="mt-1 text-sm text-red-600">{errors.city}</div> : null}
            </label>

            <label data-field="service" className="block">
              <span className="text-sm font-semibold">Service Needed *</span>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as any)}
                className={[fieldBase, errors.service ? fieldInvalid : ""].join(" ")}
              >
                <option value="">Select a service…</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.service ? <div className="mt-1 text-sm text-red-600">{errors.service}</div> : null}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold">Details (optional)</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--brand-accent)]"
              rows={5}
            />
          </label>

          <div data-field="turnstile" className="mt-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
              options={{ theme: "light" }}
              onSuccess={(token) => {
                setTsToken(token);
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.turnstile;
                  return copy;
                });
              }}
              onExpire={() => setTsToken("")}
              onError={() => setTsToken("")}
            />
            {errors.turnstile ? <div className="mt-2 text-sm text-red-600">{errors.turnstile}</div> : null}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-[var(--brand-green)] px-6 text-base font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </button>

          <div className="text-sm text-[var(--muted)]">* Required fields</div>
        </form>
      </div>
    </main>
  );
}