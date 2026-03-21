// app/api/og/route.tsx
// Dynamic Open Graph image generator using next/og + Satori.
// Returns a 1200×630 PNG with a full-bleed photo background, dark gradient
// overlay, and white text — one route handles all pages on the site.
//
// Usage:
//   /api/og?title=Get+a+Free+Estimate
//   /api/og?title=Tree+Removal+in+Santa+Cruz&photo=tree-removal-with-crane
//   /api/og?title=Santa+Cruz+Tree+Service&subtitle=Serving+Santa+Cruz+County
//
// Query params:
//   title    — large headline (required)
//   subtitle — optional second line below title
//   photo    — asset filename without extension (default: og-hero)
//              must exist in /public/assets/<photo>.webp

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Cache base64 images in memory across requests (warm lambda)
const imgCache = new Map<string, string>();

function loadImg(name: string): string {
  if (imgCache.has(name)) return imgCache.get(name)!;
  const filePath = path.join(process.cwd(), "public", "assets", `${name}.webp`);
  try {
    const buf = fs.readFileSync(filePath);
    const dataUrl = `data:image/webp;base64,${buf.toString("base64")}`;
    imgCache.set(name, dataUrl);
    return dataUrl;
  } catch {
    return "";
  }
}

// Allowlist of valid photo names so we don't expose arbitrary file reads
const VALID_PHOTOS = new Set([
  "og-hero",                          // default — new crane v2 image
  "tree-removal-with-crane",
  "emergency-tree-removal-with-crane",
  "emergency-tree-removal",
  "tree-trimming",
  "stump-removal",
  "tree-cutting-up-with-chainsaw",
  "tree-inspection",
  "tree-moving",
  "tree-mulching",
  "chainsaw",
  "mulching",
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawTitle    = searchParams.get("title")    ?? "Get a Free Estimate";
  const rawSubtitle = searchParams.get("subtitle") ?? "";
  const rawPhoto    = searchParams.get("photo")    ?? "og-hero";

  // Sanitize inputs
  const title    = rawTitle.slice(0, 80);
  const subtitle = rawSubtitle.slice(0, 60);
  const photo    = VALID_PHOTOS.has(rawPhoto) ? rawPhoto : "tree-removal-with-crane";

  const imgSrc = loadImg(photo);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#111827",
        }}
      >
        {/* ── Background photo ── */}
        {imgSrc ? (
          <img
            src={imgSrc}
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              objectPosition: "center 30%",
            }}
          />
        ) : null}

        {/* ── Dark gradient overlay — matches homepage: deep forest-green diagonal ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            background:
              "linear-gradient(105deg, rgba(10,30,15,0.88) 0%, rgba(10,30,15,0.65) 50%, rgba(10,30,15,0.28) 100%)",
            display: "flex",
          }}
        />
        {/* ── Secondary bottom vignette so text always pops ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 50%)",
            display: "flex",
          }}
        />

        {/* ── Left accent bar ── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "8px",
            height: "630px",
            backgroundColor: "#16a34a",
            display: "flex",
          }}
        />

        {/* ── Content block ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0 64px 52px 72px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {/* Brand pill */}
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(22, 101, 52, 0.90)",
              borderRadius: "6px",
              padding: "5px 16px",
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                color: "#bbf7d0",
                fontSize: "17px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontFamily: "sans-serif",
              }}
            >
              SANTA CRUZ TREE PROS
            </span>
          </div>

          {/* Main title */}
          <div
            style={{
              color: "#ffffff",
              fontSize: title.length > 35 ? "52px" : "66px",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: subtitle ? "14px" : "20px",
              fontFamily: "sans-serif",
              maxWidth: "920px",
            }}
          >
            {title}
          </div>

          {/* Optional subtitle */}
          {subtitle ? (
            <div
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "26px",
                fontWeight: 400,
                marginBottom: "20px",
                fontFamily: "sans-serif",
              }}
            >
              {subtitle}
            </div>
          ) : null}

          {/* URL strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* Green dot */}
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#4ade80",
                display: "flex",
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.60)",
                fontSize: "20px",
                fontFamily: "sans-serif",
              }}
            >
              santacruztreepros.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
