#!/usr/bin/env python3
"""
generate_blog_images.py
=======================
Generates all blog article images using Hugging Face's free Inference API
(FLUX.1-schnell model — fast, high quality, photorealistic).

SETUP (one time, ~2 minutes):
  1. Create a free account at https://huggingface.co/join
  2. Go to https://huggingface.co/settings/tokens
  3. Click "New token" → name it anything → Role: "Read" → Create
  4. Copy the token (starts with hf_...)
  5. Set it as an environment variable:
       export HF_TOKEN="hf_your_token_here"
     OR just run the script and paste it when prompted.

USAGE:
  pip3 install requests Pillow
  python3 generate_blog_images.py

Already-existing images are skipped automatically.
"""

from __future__ import annotations

import io
import os
import sys
import time
import warnings

warnings.filterwarnings("ignore")

try:
    import requests
except ImportError:
    sys.exit("Missing: pip3 install requests Pillow")
try:
    from PIL import Image
except ImportError:
    sys.exit("Missing: pip3 install requests Pillow")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "public", "images", "blog"
)
os.makedirs(OUTPUT_DIR, exist_ok=True)

HF_API_URL = (
    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
)

# (slug, prompt)
ARTICLES = [
    (
        "best-time-trim-trees-santa-cruz",
        "professional arborist in safety gear trimming tree branches, California coastal "
        "garden, blue sky, photorealistic photography",
    ),
    (
        "coast-live-oak-care-santa-cruz",
        "large majestic coast live oak tree on California hillside, lush green leaves, "
        "blue sky, landscape photography, photorealistic",
    ),
    (
        "dangerous-trees-santa-cruz",
        "dead hazardous tree with cracked trunk leaning toward suburban house, California "
        "yard, danger, photorealistic photo",
    ),
    (
        "diy-vs-hiring-arborist",
        "certified arborist wearing safety harness and hard hat climbing large tree with "
        "professional equipment, photorealistic photo",
    ),
    (
        "emergency-tree-service-santa-cruz",
        "large tree fallen on house roof after storm, emergency crew with chainsaws, "
        "California residential street, photorealistic photo",
    ),
    (
        "fire-resistant-landscaping-santa-cruz",
        "California home with well-maintained defensible space landscaping, cleared dry "
        "brush around house, wildfire prevention, wide shot, photorealistic",
    ),
    (
        "how-often-trim-trees",
        "arborist in aerial bucket truck trimming mature tree branches on residential "
        "street, professional tree service, sunny day, photorealistic photo",
    ),
    (
        "how-to-choose-tree-service-santa-cruz",
        "professional arborist in hi-vis vest and hard hat consulting homeowner standing "
        "in front yard next to large tree, photorealistic photo",
    ),
    (
        "how-to-tell-if-tree-is-dead",
        "dead tree with bare branches and fungal growth on bark standing beside healthy "
        "green trees in California backyard, photorealistic photo",
    ),
    (
        "stump-grinding-vs-stump-removal",
        "stump grinder machine actively grinding large tree stump in green lawn backyard, "
        "wood chips flying, photorealistic photo",
    ),
    (
        "tree-care-after-drought",
        "drought-stressed trees with brown wilted leaves in dry California landscape, "
        "cracked earth, wildfires risk, photorealistic photo",
    ),
    (
        "tree-removal-cost-santa-cruz",
        "professional tree removal crew using crane and rigging to remove tall tree in "
        "California residential neighborhood, photorealistic photo",
    ),
    (
        "tree-root-damage-foundation-pipes",
        "large exposed tree roots cracking and lifting concrete sidewalk and driveway, "
        "close-up structural damage, photorealistic photo",
    ),
    (
        "tree-trimming-cost-santa-cruz",
        "arborist on ladder pruning and trimming residential tree branches with pole saw "
        "on a sunny California day, photorealistic photo",
    ),
    (
        "what-to-do-after-storm-tree-damage",
        "large storm-damaged tree leaning on wooden fence after heavy rain and wind, "
        "suburban yard with debris, photorealistic photo",
    ),
    (
        "what-to-expect-tree-removal",
        "professional tree service team with wood chipper truck and equipment on "
        "residential driveway ready to remove large tree, photorealistic photo",
    ),
    # ── New articles (added April–May 2025) ─────────────────────────────────
    (
        "eucalyptus-tree-removal-santa-cruz",
        "massive blue gum eucalyptus tree being removed by professional arborists using "
        "crane in California residential neighborhood, large trunk sections, photorealistic photo",
    ),
    (
        "tree-service-monterey-county",
        "certified arborist trimming iconic Monterey cypress tree on the California coast, "
        "Pacific Ocean in background, sunny day, photorealistic photography",
    ),
    (
        "tree-trimming-aptos-capitola",
        "aerial bucket truck trimming large oak tree canopy in California coastal "
        "neighborhood, crew in safety gear, sunny day, photorealistic photo",
    ),
    (
        "tree-cabling-bracing-santa-cruz",
        "close-up of steel cable hardware and bracing rod installed in large forked "
        "tree trunk, structural tree support, professional arborist work, photorealistic photo",
    ),
    (
        "arborist-report-real-estate-santa-cruz",
        "ISA certified arborist in hard hat examining large oak tree trunk with clipboard "
        "and tablet, writing report, California residential property, photorealistic photo",
    ),
    (
        "palm-tree-trimming-santa-cruz",
        "arborist on aerial lift trimming tall queen palm tree fronds against bright "
        "blue California coastal sky, professional tree service, photorealistic photo",
    ),
    (
        "tree-service-watsonville-gilroy",
        "tree removal crew with heavy equipment working on large heritage valley oak "
        "in California agricultural landscape, safety gear, photorealistic photo",
    ),
    (
        "neighbor-tree-disputes-california",
        "large overhanging tree branches extending over wooden fence between two "
        "California residential properties, suburban neighborhood, photorealistic photo",
    ),
    # ── Seasonal, Pricing & Planning, Local Regulations articles ────────────
    (
        "winter-storm-tree-prep-santa-cruz",
        "homeowner and arborist inspecting large tree in California yard before winter "
        "storm season, cloudy dramatic sky, safety assessment, photorealistic photo",
    ),
    (
        "spring-tree-care-santa-cruz",
        "arborist examining fresh green spring growth on tree branches in California "
        "garden, bright sunny spring morning, post-rain landscape, photorealistic photo",
    ),
    (
        "emergency-tree-service-cost-santa-cruz",
        "emergency tree service crew at night using floodlights to remove large fallen "
        "tree from residential roof after storm, California neighborhood, photorealistic photo",
    ),
    (
        "how-to-compare-tree-service-quotes",
        "homeowner reviewing written tree service estimates on clipboard standing in "
        "backyard next to large tree, professional consultation, photorealistic photo",
    ),
    (
        "santa-cruz-city-tree-ordinance",
        "Santa Cruz California city street with large protected heritage oak tree beside "
        "residential homes, urban forest, sunny day, photorealistic photo",
    ),
    (
        "protected-trees-santa-cruz-county",
        "impressive ancient valley oak tree with massive trunk and spreading canopy on "
        "California hillside, protected heritage tree, photorealistic photo",
    ),
    (
        "hoa-tree-rules-california",
        "well-maintained HOA community green belt with manicured trees and walkway in "
        "California residential neighborhood, suburban landscape, photorealistic photo",
    ),
]


# ---------------------------------------------------------------------------
# Token
# ---------------------------------------------------------------------------

def get_token() -> str:
    token = os.environ.get("HF_TOKEN", "").strip()
    if token:
        print(f"Using HF_TOKEN from environment ({token[:8]}...)\n")
        return token
    print("Hugging Face API token required.")
    print("Get a FREE token at: https://huggingface.co/settings/tokens\n")
    token = input("Paste your token here: ").strip()
    if not token:
        sys.exit("No token provided — exiting.")
    return token


# ---------------------------------------------------------------------------
# Image generation
# ---------------------------------------------------------------------------

def generate_image(prompt: str, token: str, retries: int = 3) -> Image.Image:
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "width": 1024,
            "height": 576,
            "num_inference_steps": 4,   # FLUX schnell works great at 4 steps
            "guidance_scale": 0,        # schnell uses 0 guidance
        },
    }

    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(
                HF_API_URL, headers=headers, json=payload, timeout=120
            )
            if resp.status_code == 200:
                return Image.open(io.BytesIO(resp.content)).convert("RGB")
            elif resp.status_code == 503:
                # Model loading — HF loads on first request, takes ~20s
                wait = 25
                print(f"        Model loading, waiting {wait}s (attempt {attempt}/{retries})...")
                time.sleep(wait)
            elif resp.status_code == 429:
                wait = 60
                print(f"        Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                err = resp.text[:200] if resp.text else f"HTTP {resp.status_code}"
                raise RuntimeError(f"HTTP {resp.status_code}: {err}")
        except requests.exceptions.Timeout:
            if attempt < retries:
                print(f"        Timeout, retrying ({attempt}/{retries})...")
                time.sleep(5)
            else:
                raise

    raise RuntimeError(f"Failed after {retries} attempts")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 55)
    print("  Blog Image Generator — Santa Cruz Tree Pros")
    print("=" * 55)
    print(f"Output → {OUTPUT_DIR}\n")

    token = get_token()
    succeeded = 0
    skipped   = 0
    failed    = []

    for idx, (slug, prompt) in enumerate(ARTICLES):
        out_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")

        if os.path.exists(out_path):
            kb = os.path.getsize(out_path) // 1024
            print(f"[skip] {slug}.jpg ({kb} KB already exists)")
            skipped += 1
            continue

        print(f"\n[{idx+1:02d}/{len(ARTICLES)}] {slug}")

        try:
            img = generate_image(prompt, token)
            img.save(out_path, "JPEG", quality=90, optimize=True)
            kb = os.path.getsize(out_path) // 1024
            print(f"        {img.width}×{img.height} → saved ({kb} KB) ✓")
            succeeded += 1
        except Exception as e:
            print(f"        ERROR: {e}")
            failed.append((slug, str(e)))

    print(f"\n{'=' * 55}")
    print(f"Done: {succeeded} generated, {skipped} skipped, {len(failed)} failed")

    if failed:
        print("\nFailed (re-run to retry — existing files are skipped):")
        for slug, err in failed:
            print(f"  {slug}: {err}")

    if succeeded > 0:
        print("\nNext steps:")
        print("  git add public/images/blog/")
        print("  git commit -m 'add blog article images'")
        print("  git push")


if __name__ == "__main__":
    main()
