"use client";

import { useMemo, useRef, useState } from "react";

/* ---------------- Utilities ---------------- */

function digitsOnly(input: string) {
  return input.replace(/\D/g, "");
}

function formatUSPhone(digits: string) {
  const d = digits.slice(0, 10);
  const len = d.length;

  if (len === 0) return "";
  if (len < 4) return d;
  if (len < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function countDigitsBeforeIndex(s: string, index: number) {
  return digitsOnly(s.slice(0, index)).length;
}

function caretIndexForDigitCount(formatted: string, digitCount: number) {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++;
      if (seen === digitCount) return i + 1;
    }
  }
  return formatted.length;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

/* ---------------- Component ---------------- */

export default function Page() {
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("Tree Removal");
  const [details, setDetails] = useState("");

  // Honeypot field (bots fill, humans won't)
  const [company, setCompany] = useState("");

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    email: false,
  });

  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  const phoneDisplay = useMemo(() => formatUSPhone(phoneDigits), [phoneDigits]);

  const isNameValid = fullName.trim().length >= 2;
  const isPhoneValid = phoneDigits.length === 10;
  const isEmailValid = isValidEmail(email);

  const canSubmit = isNameValid && isPhoneValid && isEmailValid && !isSending;

  const baseField =
    "w-full border rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-black focus:outline-none";

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    const caret = e.target.selectionStart ?? input.length;

    const digitsBeforeCaret = countDigitsBeforeIndex(input, caret);
    const nextDigits = digitsOnly(input).slice(0, 10);
    const nextDisplay = formatUSPhone(nextDigits);

    setPhoneDigits(nextDigits);

    queueMicrotask(() => {
      const el = phoneInputRef.current;
      if (!el) return;
      const nextCaret = caretIndexForDigitCount(
        nextDisplay,
        Math.min(digitsBeforeCaret, nextDigits.length)
      );
      el.setSelectionRange(nextCaret, nextCaret);
    });
  }

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (isSending) return; // extra guard against double clicks / races

  setTouched({ name: true, phone: true, email: true });
  setServerError(null);

  if (!canSubmit) return;

  setIsSending(true);
  try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneDigits, // raw digits
          email: email.trim(),
          service,
          details: details.trim(),
          company, // honeypot
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.error ||
          (data?.errors
            ? Object.values(data.errors).join(" ")
            : "Submission failed. Please try again.");
        setServerError(msg);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setServerError(err?.message ?? "Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  if (submitted) {
    return (
      <main className="p-8 max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Thanks for your request!</h1>
        <p className="text-gray-600">
          We received your info and will contact you shortly.
        </p>
      </main>
    );
  }

  const showNameError = touched.name && !isNameValid;
  const showPhoneError = touched.phone && !isPhoneValid;
  const showEmailError = touched.email && !isEmailValid;

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Get a Free Tree Service Estimate</h1>
        <p className="text-gray-600">Fill out the form below and we’ll contact you.</p>
      </div>

      {serverError && (
        <div className="border border-red-300 bg-red-50 text-red-800 rounded-lg p-3 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot (hidden) */}
        <div className="hidden" aria-hidden="true">
          <label>Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            required
            className={`${baseField} ${showNameError ? "border-red-500" : ""}`}
            placeholder="John Smith"
            aria-invalid={showNameError}
          />
          {showNameError && (
            <p className="text-sm text-red-600 mt-1">Please enter your full name.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            ref={phoneInputRef}
            value={phoneDisplay}
            onChange={handlePhoneChange}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            className={`${baseField} ${showPhoneError ? "border-red-500" : ""}`}
            placeholder="(831) 555-1234"
            aria-invalid={showPhoneError}
          />
          {showPhoneError && (
            <p className="text-sm text-red-600 mt-1">Phone number must be 10 digits.</p>
          )}
          <input type="hidden" name="phoneDigits" value={phoneDigits} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            type="email"
            autoComplete="email"
            required
            className={`${baseField} ${showEmailError ? "border-red-500" : ""}`}
            placeholder="you@email.com"
            aria-invalid={showEmailError}
          />
          {showEmailError && (
            <p className="text-sm text-red-600 mt-1">Please enter a valid email address.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Service Needed</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className={baseField}
          >
            <option>Tree Removal</option>
            <option>Tree Trimming</option>
            <option>Stump Grinding & Root Removal</option>
            <option>Emergency Tree Service</option>
            <option>Arborist Consulting</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className={baseField}
            placeholder="In order to provide an accurate estimate, please provide details."
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full rounded-lg py-3 font-medium transition ${
            canSubmit
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          {isSending ? "Sending..." : "Request Free Estimate"}
        </button>
      </form>
    </main>
  );
}