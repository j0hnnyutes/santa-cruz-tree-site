"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { useFormEventTracker } from "@/lib/formEventTracker";
import { upload } from "@vercel/blob/client";

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

const UPLOAD_TIMEOUT_MS = 30_000; // 30 s per-file CDN upload timeout

// ── Per-photo upload tracking ─────────────────────────────────────────────
type PhotoEntry = {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  url?: string;       // populated on success
  timedOut?: boolean; // true when error was caused by timeout
};

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

// ── Client-side image resize ──────────────────────────────────────────────
// Reduces large phone/desktop photos before upload.
// Strategy: use createImageBitmap() where available — it decodes + scales in
// one hardware-accelerated async call without blocking the main thread.
// Falls back to a standard Image + Canvas pipeline for older browsers.
// HEIC/HEIF skipped entirely (browsers can't decode them via Canvas/Bitmap).
const RESIZE_MAX_PX = 1600;   // cap longest dimension
const RESIZE_QUALITY = 0.78;  // JPEG quality — good for outdoor/tree photos

function canResizeInBrowser(file: File): boolean {
  if (["image/heic", "image/heif"].includes(file.type)) return false;
  if (/\.(heic|heif)$/i.test(file.name)) return false;
  return true;
}

async function resizePhoto(file: File): Promise<File> {
  if (!canResizeInBrowser(file)) return file;

  // Skip if already small enough
  if (file.size <= 600 * 1024) return file;

  const stem = file.name.replace(/\.[^.]+$/, "");
  const outName = `${stem}.jpg`;

  try {
    // ── Fast path: createImageBitmap with built-in resize ─────────────────
    // Supported in Chrome 50+, Firefox 42+, Safari 15+.
    // The browser handles decode + scale in one step, often GPU-accelerated.
    if (typeof createImageBitmap === "function") {
      // First decode at full size to get natural dimensions
      const full = await createImageBitmap(file);
      const { width: w, height: h } = full;
      full.close();

      const scale = Math.min(RESIZE_MAX_PX / w, RESIZE_MAX_PX / h, 1);
      if (scale >= 1) return file; // already fits within limit

      const newW = Math.round(w * scale);
      const newH = Math.round(h * scale);

      // Decode again at target size — single hardware-accelerated step
      const bitmap = await createImageBitmap(file, {
        resizeWidth: newW,
        resizeHeight: newH,
        resizeQuality: "medium",
      });

      const canvas = document.createElement("canvas");
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext("2d");
      if (!ctx) { bitmap.close(); return file; }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      return await new Promise<File>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], outName, { type: "image/jpeg" }) : file),
          "image/jpeg",
          RESIZE_QUALITY,
        );
      });
    }

    // ── Fallback: HTMLImageElement + Canvas ───────────────────────────────
    return await new Promise<File>((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { naturalWidth: w, naturalHeight: h } = img;
        const scale = Math.min(RESIZE_MAX_PX / w, RESIZE_MAX_PX / h, 1);
        if (scale >= 1) { resolve(file); return; }
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], outName, { type: "image/jpeg" }) : file),
          "image/jpeg",
          RESIZE_QUALITY,
        );
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
      img.src = objectUrl;
    });
  } catch {
    return file; // always fall back to original on any error
  }
}

export default function FreeEstimateClient() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const submittedRef = useRef(false);
  // Per-photo upload controllers — keyed by PhotoEntry.id
  const uploadControllersRef = useRef<Map<string, AbortController>>(new Map());
  const nextPhotoIdRef = useRef(0);

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
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [tsToken, setTsToken] = useState("");
  // ≥1024 = desktop split layout, <1024 = mobile single-column
  const [isDesktop, setIsDesktop] = useState(false);
  // Track which fields have been blurred — drives on-blur validation display
  const [touched, setTouched] = useState<Set<string>>(new Set());

  function touch(field: string) {
    setTouched((prev) => new Set([...prev, field]));
  }

  function clearApiError(field: string) {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }

  // Returns the visible error for a field: API error always shows;
  // client-side error shows only after the field has been blurred or submitted.
  function fieldError(field: string): string {
    return errors[field] || (touched.has(field) ? validationErrors[field] || "" : "");
  }

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

  // Scroll error banner into view whenever one appears so the user never
  // has to manually scroll up to discover why submission failed.
  // "block: start" forces a scroll UP to the banner's top edge, which is
  // more reliable than "nearest" (which can calculate no-scroll-needed).
  useEffect(() => {
    if (banner?.kind === "err") {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [banner]);

  // ── File handling — upload begins immediately on file select ─────────────
  // Industry standard (Instagram, Airbnb, Dropbox): start the CDN upload the
  // moment a file is chosen so it's done (or nearly done) by submit time.
  function handleFiles(incoming: File[]) {
    const errs: string[] = [];
    const validFiles: File[] = [];

    for (const file of incoming) {
      if (!isAcceptedType(file)) {
        errs.push(`"${file.name}" is not a supported format.`);
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        errs.push(`"${file.name}" exceeds the ${MAX_MB} MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    const slotsLeft = MAX_PHOTOS - photos.length;
    const toAdd = validFiles.slice(0, Math.max(0, slotsLeft));
    if (validFiles.length > slotsLeft && slotsLeft >= 0) {
      errs.push(`Maximum ${MAX_PHOTOS} photos allowed — extras were skipped.`);
    }

    const newEntries: PhotoEntry[] = toAdd.map((file) => {
      nextPhotoIdRef.current += 1;
      return { id: String(nextPhotoIdRef.current), file, status: "uploading" as const };
    });

    setPhotos((prev) => [...prev, ...newEntries]);
    setPhotoErrors(errs);

    // Kick off uploads immediately — no waiting for form submit
    for (const entry of newEntries) {
      startUpload(entry);
    }
  }

  async function startUpload(entry: PhotoEntry) {
    let timedOut = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    uploadControllersRef.current.set(entry.id, controller);
    try {
      // Resize outside the timeout window (CPU-bound canvas work, not network)
      const toUpload = await resizePhoto(entry.file);
      const safeName = toUpload.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      // Start abort clock only once the network transfer begins
      timer = setTimeout(() => { timedOut = true; controller.abort(); }, UPLOAD_TIMEOUT_MS);
      const blob = await upload(safeName, toUpload, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        abortSignal: controller.signal,
      });
      setPhotos((prev) =>
        prev.map((p) => p.id === entry.id ? { ...p, status: "done", url: blob.url } : p),
      );
    } catch {
      setPhotos((prev) =>
        prev.map((p) => p.id === entry.id ? { ...p, status: "error", timedOut } : p),
      );
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      uploadControllersRef.current.delete(entry.id);
    }
  }

  function retryUpload(entry: PhotoEntry) {
    // Reset to uploading state, then restart
    const fresh: PhotoEntry = { id: entry.id, file: entry.file, status: "uploading" };
    setPhotos((prev) => prev.map((p) => p.id === entry.id ? fresh : p));
    startUpload(fresh);
  }

  function removePhoto(id: string) {
    // Abort in-flight upload if still running
    uploadControllersRef.current.get(id)?.abort();
    uploadControllersRef.current.delete(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
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
    // Touch all step-1 fields so any unblurred errors become visible
    setTouched((prev) => new Set([...prev, "fullName", "email", "phone"]));
    const errs = validateStep1();
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
    // Touch every field so all unblurred errors become visible
    setTouched(new Set(["fullName", "email", "phone", "service", "address", "city"]));

    const nextErrors = validationErrors;
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      trackFieldError(firstKey);
      // If step-1 field has an error, send user back
      if (["fullName", "email", "phone"].includes(firstKey)) setStep(1);
      return;
    }

    // Photos are uploaded in the background from the moment they're selected.
    // By submit time they should already be done; handle the edge cases:
    const failedPhotos = photos.filter((p) => p.status === "error");
    if (failedPhotos.length > 0) {
      setBanner({
        kind: "err",
        text: failedPhotos.some((p) => p.timedOut)
          ? "A photo upload timed out. Remove the failed photo(s) and try again, or submit without them."
          : "One or more photos failed to upload. Remove them and try again.",
      });
      return;
    }
    const stillUploading = photos.filter((p) => p.status === "uploading");
    if (stillUploading.length > 0) {
      // Shouldn't normally happen — button is disabled while uploading — but guard anyway
      setBanner({ kind: "err", text: "Photos are still uploading. Please wait a moment and try again." });
      return;
    }

    // All photos have CDN URLs ready
    const photoUrls = photos
      .filter((p) => p.status === "done")
      .map((p) => p.url!);

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
      for (const url of photoUrls) fd.append("photoUrls", url);

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
    { n: 2, label: "Project Details" },
    { n: 3, label: "Sent"    },
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
            justifyContent: "flex-end", padding: "0 56px 20vh",
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
          justifyContent: "flex-start",
          padding: isDesktop ? "clamp(20px, 4vh, 48px) 40px 48px" : "40px 24px 56px",
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
                  onChange={(e) => { setFullName(e.target.value); clearApiError("fullName"); }}
                  onBlur={() => touch("fullName")}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  style={{ ...dk.input, ...(fieldError("fullName") ? dk.inputError : {}) }}
                />
                {fieldError("fullName") && <div style={dk.err}>{fieldError("fullName")}</div>}
              </div>

              {/* Email */}
              <div data-field="email" style={dk.field}>
                <label style={dk.label}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearApiError("email"); }}
                  onBlur={() => touch("email")}
                  placeholder="jane@email.com"
                  autoComplete="email"
                  inputMode="email"
                  style={{ ...dk.input, ...(fieldError("email") ? dk.inputError : {}) }}
                />
                {fieldError("email") && <div style={dk.err}>{fieldError("email")}</div>}
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
                  onChange={(e) => { setPhone(formatPhoneUS(e.target.value)); clearApiError("phone"); }}
                  onBlur={() => touch("phone")}
                  placeholder="(831) 555-0100"
                  autoComplete="tel"
                  inputMode="tel"
                  style={{ ...dk.input, ...(fieldError("phone") ? dk.inputError : {}) }}
                />
                {fieldError("phone") && <div style={dk.err}>{fieldError("phone")}</div>}
              </div>

              <button
                type="button"
                onClick={advanceToStep2}
                style={{ ...dk.btnPrimary, width: "100%" }}
              >
                Next: Project Details →
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
                {["🔒 Secure & private", "✓ No spam, ever"].map((t) => (
                  <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t}</span>
                ))}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>
                  Privacy Policy
                </a>
              </div>
            </div>
          )}

          {/* ════════════════ STEP 2: Project ════════════════ */}
          {step === 2 && (
            <form ref={formRef} onSubmit={onSubmit}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                About your project
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", marginBottom: 14, lineHeight: 1.5 }}>
                Help us give you an accurate estimate.
              </p>

              {/* Error banner — ref used to scroll into view on failure.
                  scrollMarginTop gives breathing room below the sticky nav. */}
              {banner && (
                <div
                  ref={bannerRef}
                  style={{
                    scrollMarginTop: 88,
                    marginBottom: 16, padding: "10px 14px", borderRadius: 8, fontSize: 13,
                    background: banner.kind === "ok" ? "rgba(22,163,74,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${banner.kind === "ok" ? "rgba(22,163,74,0.35)" : "rgba(239,68,68,0.35)"}`,
                    color: banner.kind === "ok" ? "#86efad" : "#fca5a5",
                  }}
                >
                  {banner.text}
                </div>
              )}

              {/* Compact input style for step 2 */}
              {(() => {
                const s2input: React.CSSProperties = { ...dk.input, padding: "8px 13px" };
                const s2field: React.CSSProperties = { ...dk.field, marginBottom: 8 };
                return (
                  <>
                    {/* Service */}
                    <div data-field="service" style={s2field}>
                      <label style={dk.label}>Service Needed *</label>
                      <select
                        value={service}
                        onChange={(e) => { setService(e.target.value as typeof service); touch("service"); clearApiError("service"); }}
                        onBlur={() => touch("service")}
                        style={{ ...s2input, ...(fieldError("service") ? dk.inputError : {}) }}
                      >
                        <option value="">Select a service…</option>
                        {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {fieldError("service") && <div style={dk.err}>{fieldError("service")}</div>}
                    </div>

                    {/* Address */}
                    <div data-field="address" style={s2field}>
                      <label style={dk.label}>Street Address *</label>
                      <input
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); clearApiError("address"); }}
                        onBlur={() => touch("address")}
                        placeholder="123 Main St"
                        autoComplete="street-address"
                        style={{ ...s2input, ...(fieldError("address") ? dk.inputError : {}) }}
                      />
                      {fieldError("address") && <div style={dk.err}>{fieldError("address")}</div>}
                    </div>

                    {/* City */}
                    <div data-field="city" style={s2field}>
                      <label style={dk.label}>City *</label>
                      <input
                        value={city}
                        onChange={(e) => { setCity(e.target.value); clearApiError("city"); }}
                        onBlur={() => touch("city")}
                        placeholder="Santa Cruz"
                        autoComplete="address-level2"
                        style={{ ...s2input, ...(fieldError("city") ? dk.inputError : {}) }}
                      />
                      {fieldError("city") && <div style={dk.err}>{fieldError("city")}</div>}
                    </div>

                    {/* Details */}
                    <div style={{ ...s2field, marginBottom: 10 }}>
                      <label style={dk.label}>
                        Details
                        <span style={dk.optTag}>optional</span>
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Describe the tree, the situation, any urgency…"
                        rows={2}
                        style={{ ...s2input, minHeight: 60, resize: "vertical" }}
                      />
                    </div>
                  </>
                );
              })()}

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
                    padding: "9px 12px", textAlign: "center", cursor: "pointer",
                    color: "rgba(255,255,255,0.42)", fontSize: 12,
                  }}
                >
                  📷{" "}
                  <span style={{ color: "#4ade80", textDecoration: "underline" }}>
                    Upload photos
                  </span>
                  {" "}for a more accurate estimate
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.26)", marginLeft: 6 }}>
                    JPG, PNG, HEIC · up to {MAX_MB} MB · {MAX_PHOTOS} max
                  </span>
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
                    {photos.map((entry) => (
                      <li key={entry.id} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: entry.status === "error"
                          ? "rgba(239,68,68,0.10)"
                          : "rgba(255,255,255,0.08)",
                        borderRadius: 8, padding: "8px 12px",
                        fontSize: 13, color: "rgba(255,255,255,0.80)",
                        border: entry.status === "error"
                          ? "1px solid rgba(239,68,68,0.30)"
                          : "1px solid transparent",
                      }}>
                        {/* Status icon */}
                        {entry.status === "uploading" && (
                          <span style={{ flexShrink: 0, fontSize: 12, color: "#4ade80", animation: "spin 1s linear infinite" }}>⟳</span>
                        )}
                        {entry.status === "done" && (
                          <span style={{ flexShrink: 0, fontSize: 12, color: "#4ade80" }}>✓</span>
                        )}
                        {entry.status === "error" && (
                          <span style={{ flexShrink: 0, fontSize: 12, color: "#fca5a5" }}>✕</span>
                        )}

                        {/* Filename */}
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.file.name}
                          <span style={{ color: "rgba(255,255,255,0.40)", marginLeft: 5 }}>
                            ({formatBytes(entry.file.size)})
                          </span>
                        </span>

                        {/* Upload status label */}
                        {entry.status === "uploading" && (
                          <span style={{ flexShrink: 0, fontSize: 11, color: "rgba(255,255,255,0.40)" }}>uploading…</span>
                        )}
                        {entry.status === "error" && (
                          <button
                            type="button"
                            onClick={() => retryUpload(entry)}
                            style={{ flexShrink: 0, background: "rgba(239,68,68,0.20)", border: "1px solid rgba(239,68,68,0.40)", borderRadius: 4, color: "#fca5a5", fontSize: 11, padding: "2px 7px", cursor: "pointer" }}
                          >
                            Retry
                          </button>
                        )}

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removePhoto(entry.id)}
                          style={{ flexShrink: 0, background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 2px" }}
                          aria-label={`Remove ${entry.file.name}`}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Back + Submit */}
              {(() => {
                const uploadingCount = photos.filter((p) => p.status === "uploading").length;
                const anyUploading = uploadingCount > 0;
                const btnDisabled = submitting || anyUploading;
                const btnLabel = anyUploading
                  ? `Uploading ${uploadingCount} photo${uploadingCount !== 1 ? "s" : ""}…`
                  : submitting
                  ? "Submitting…"
                  : "Request Free Estimate →";
                return (
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => { setErrors({}); setStep(1); }}
                      style={dk.btnSecondary}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={btnDisabled}
                      style={{ ...dk.btnPrimary, opacity: btnDisabled ? 0.65 : 1, cursor: btnDisabled ? "not-allowed" : "pointer" }}
                    >
                      {btnLabel}
                    </button>
                  </div>
                );
              })()}

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                {["🚫 No obligation", "✉ Timely response to estimate requests"].map((t) => (
                  <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t}</span>
                ))}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>
                  Privacy Policy
                </a>
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
