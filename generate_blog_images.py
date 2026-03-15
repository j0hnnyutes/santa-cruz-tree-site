#!/usr/bin/env python3
"""
generate_blog_images.py
=======================
Run this script ONCE from your project root to generate all blog article images.

Usage:
    pip install requests Pillow opencv-python
    python3 generate_blog_images.py

What it does:
  1. Sends each prompt to the Craiyon free API (no account needed)
  2. Picks the best landscape image from the 9 generated
  3. Removes the Craiyon watermark using OpenCV inpainting
  4. Saves as JPEG to public/images/blog/

Already exists (skipped automatically):
  - tree-removal-permits-santa-cruz.jpg
"""

import base64
import io
import json
import os
import sys
import time

try:
    import requests
except ImportError:
    sys.exit("Missing: pip install requests")

try:
    from PIL import Image
except ImportError:
    sys.exit("Missing: pip install Pillow")

try:
    import cv2
    import numpy as np
except ImportError:
    sys.exit("Missing: pip install opencv-python")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "public", "images", "blog")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 16 articles: (slug, prompt)
ARTICLES = [
    (
        "best-time-trim-trees-santa-cruz",
        "arborist trimming tree branches California coastal garden blue sky, "
        "professional tree care, high quality photo",
    ),
    (
        "coast-live-oak-care-santa-cruz",
        "large majestic coast live oak tree California hillside green leaves blue sky, "
        "landscape photography",
    ),
    (
        "dangerous-trees-santa-cruz",
        "hazardous dead tree leaning dangerously toward suburban house California yard, "
        "cracked trunk, realistic photo",
    ),
    (
        "diy-vs-hiring-arborist",
        "certified arborist with safety harness helmet climbing large tree, "
        "professional tree service equipment, realistic photo",
    ),
    (
        "emergency-tree-service-santa-cruz",
        "large tree fallen on house roof after storm damage, emergency crew responding, "
        "realistic photo",
    ),
    (
        "fire-resistant-landscaping-santa-cruz",
        "California home defensible space cleared dry brush fire prevention landscaping, "
        "aerial view residential property, realistic photo",
    ),
    (
        "how-often-trim-trees",
        "arborist in bucket truck aerial lift trimming mature tree residential street, "
        "professional tree pruning, realistic photo",
    ),
    (
        "how-to-choose-tree-service-santa-cruz",
        "professional arborist consulting homeowner about large tree in front yard, "
        "tree inspection, realistic photo",
    ),
    (
        "how-to-tell-if-tree-is-dead",
        "dead dying tree with bare branches fungal growth bark decay standing "
        "next to healthy green trees, realistic photo",
    ),
    (
        "stump-grinding-vs-stump-removal",
        "stump grinder machine grinding large tree stump green lawn backyard, "
        "realistic photo",
    ),
    (
        "tree-care-after-drought",
        "drought stressed brown dying trees dry cracked California landscape, "
        "wilted leaves, realistic photo",
    ),
    (
        "tree-removal-cost-santa-cruz",
        "professional tree removal crew with crane removing large tree residential "
        "neighborhood California, realistic photo",
    ),
    (
        "tree-root-damage-foundation-pipes",
        "large tree roots cracking lifting concrete sidewalk driveway pavement damage, "
        "close up realistic photo",
    ),
    (
        "tree-trimming-cost-santa-cruz",
        "arborist trimming pruning residential tree with chainsaw on ladder sunny day, "
        "realistic photo",
    ),
    (
        "what-to-do-after-storm-tree-damage",
        "storm damaged tree fallen leaning on fence after heavy rain wind, "
        "residential yard, realistic photo",
    ),
    (
        "what-to-expect-tree-removal",
        "professional tree removal team with equipment truck chipper arriving at "
        "residential property, realistic photo",
    ),
]

CRAIYON_API = "https://api.craiyon.com/v3"
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
}


# ---------------------------------------------------------------------------
# Watermark removal (orange Craiyon crayon in bottom-right corner)
# ---------------------------------------------------------------------------

def remove_watermark(img_array: np.ndarray) -> np.ndarray:
    """Remove the Craiyon orange crayon watermark from the bottom-right corner."""
    h, w = img_array.shape[:2]
    bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

    # Region of interest: bottom-right ~220x230 pixels
    cx, cy = max(0, w - 220), max(0, h - 230)

    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    # Orange crayon body
    mask_orange = cv2.inRange(
        hsv[cy:h, cx:w],
        np.array([5, 160, 100]),
        np.array([22, 255, 255]),
    )
    # Orange sparkles / highlights
    mask_sparkle = cv2.inRange(
        hsv[cy:h, cx:w],
        np.array([15, 130, 180]),
        np.array([28, 255, 255]),
    )
    # Navy/dark blue "+" symbols
    mask_navy = cv2.inRange(
        hsv[cy:h, cx:w],
        np.array([100, 80, 30]),
        np.array([135, 255, 140]),
    )

    combined = cv2.bitwise_or(mask_orange, cv2.bitwise_or(mask_sparkle, mask_navy))
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    dilated = cv2.dilate(combined, kernel, iterations=2)

    full_mask = np.zeros((h, w), dtype=np.uint8)
    full_mask[cy:h, cx:w] = dilated

    result_bgr = cv2.inpaint(bgr, full_mask, inpaintRadius=12, flags=cv2.INPAINT_NS)
    return cv2.cvtColor(result_bgr, cv2.COLOR_BGR2RGB)


# ---------------------------------------------------------------------------
# Craiyon generation
# ---------------------------------------------------------------------------

def generate_images(prompt: str) -> list[np.ndarray]:
    """Call Craiyon API and return list of images as numpy arrays."""
    payload = {
        "prompt": prompt,
        "negative_prompt": "blurry, text, watermark, logo, cartoon, anime, illustration",
        "model": "photo",
    }
    resp = requests.post(CRAIYON_API, headers=HEADERS, json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()

    images = []
    raw_images = data.get("images", data.get("result", []))

    for raw in raw_images:
        try:
            if isinstance(raw, str):
                # Could be base64 or a URL
                if raw.startswith("http"):
                    img_resp = requests.get(raw, headers=HEADERS, timeout=30)
                    img = Image.open(io.BytesIO(img_resp.content)).convert("RGB")
                else:
                    # base64
                    decoded = base64.b64decode(raw)
                    img = Image.open(io.BytesIO(decoded)).convert("RGB")
                images.append(np.array(img))
        except Exception as e:
            print(f"    [skip image: {e}]")

    return images


def pick_best(images: list[np.ndarray]) -> np.ndarray | None:
    """Pick the best landscape-oriented image."""
    if not images:
        return None
    # Prefer landscape (w > h)
    landscape = [img for img in images if img.shape[1] >= img.shape[0]]
    pool = landscape if landscape else images
    # Pick the one with the largest area (highest resolution)
    return max(pool, key=lambda img: img.shape[0] * img.shape[1])


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"Output directory: {OUTPUT_DIR}\n")
    skipped = 0
    succeeded = 0
    failed = []

    for slug, prompt in ARTICLES:
        out_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")

        if os.path.exists(out_path):
            print(f"[skip] {slug}.jpg already exists")
            skipped += 1
            continue

        print(f"[gen ] {slug}")
        print(f"       prompt: {prompt[:70]}...")

        try:
            images = generate_images(prompt)
            if not images:
                raise ValueError("No images returned by API")

            best = pick_best(images)
            if best is None:
                raise ValueError("Could not select best image")

            print(f"       got {len(images)} images, best: {best.shape[1]}x{best.shape[0]}")

            # Remove watermark
            clean = remove_watermark(best)

            # Save as JPEG
            pil_img = Image.fromarray(clean)
            pil_img.save(out_path, "JPEG", quality=92, optimize=True)
            file_kb = os.path.getsize(out_path) // 1024
            print(f"       saved → {slug}.jpg ({file_kb} KB) ✓")
            succeeded += 1

        except Exception as e:
            print(f"       ERROR: {e}")
            failed.append((slug, str(e)))

        # Be polite to the free API
        if succeeded + len(failed) < len(ARTICLES) - skipped:
            time.sleep(3)

    print(f"\n{'='*50}")
    print(f"Done: {succeeded} generated, {skipped} skipped, {len(failed)} failed")
    if failed:
        print("\nFailed articles (retry manually):")
        for slug, err in failed:
            print(f"  {slug}: {err}")
    print("\nNext step: run `git add public/images/blog && git commit -m 'add blog images'`")


if __name__ == "__main__":
    main()
