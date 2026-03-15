#!/usr/bin/env python3
"""
regenerate_specific_images.py
==============================
Regenerates 5 specific blog images with improved, more photorealistic prompts.
Unlike the main script, this OVERWRITES existing images (no skip logic).

USAGE:
  python3 regenerate_specific_images.py

Uses the same Hugging Face token as the main script.
Set HF_TOKEN env var or paste it when prompted.
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

# Carefully crafted prompts for maximum realism and relevance
REGENERATE = [
    (
        "tree-removal-permits-santa-cruz",
        "close-up of official tree removal permit application documents on a desk, "
        "city planning office, pen resting on permit form, coffee cup, natural window "
        "light, shallow depth of field, documentary photography, photorealistic",
    ),
    (
        "stump-grinding-vs-stump-removal",
        "single large tree stump being ground down by a yellow stump grinder machine, "
        "close-up side view, fresh wood chips piling around the stump, green grass lawn, "
        "clear blue sky, no people visible, photorealistic DSLR photo",
    ),
    (
        "emergency-tree-service-santa-cruz",
        "urgent nighttime scene: large uprooted tree crushing corner of suburban house "
        "roof, emergency arborist crew with bright work lights and chainsaws actively "
        "cutting, police tape, California residential street wet from rain, dramatic "
        "emergency lighting, photorealistic documentary photo",
    ),
    (
        "tree-care-after-drought",
        "severe California summer drought landscape: row of stressed eucalyptus and oak "
        "trees with brown wilting leaves, bone-dry cracked clay soil, dead grass, "
        "golden hills in background, harsh midday sun, Nikon D850 photorealistic wide shot",
    ),
    (
        "what-to-do-after-storm-tree-damage",
        "large mature oak tree completely uprooted and fallen across a wooden backyard "
        "fence, root ball exposed, scattered branches and leaves on wet grass, overcast "
        "post-storm sky, California suburban neighborhood, Canon 5D photorealistic",
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

def generate_image(prompt: str, token: str, retries: int = 4) -> Image.Image:
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "width": 1024,
            "height": 576,
            "num_inference_steps": 4,
            "guidance_scale": 0,
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
    print("=" * 58)
    print("  Targeted Image Regeneration — Santa Cruz Tree Pros")
    print("=" * 58)
    print(f"Output  → {OUTPUT_DIR}")
    print(f"Images  → {len(REGENERATE)} (existing files WILL be overwritten)\n")

    token = get_token()
    succeeded = 0
    failed = []

    for idx, (slug, prompt) in enumerate(REGENERATE):
        out_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")
        existing = f" (replacing {os.path.getsize(out_path)//1024} KB)" if os.path.exists(out_path) else " (new)"
        print(f"\n[{idx+1}/{len(REGENERATE)}] {slug}{existing}")
        print(f"        Prompt: {prompt[:80]}...")

        try:
            img = generate_image(prompt, token)
            img.save(out_path, "JPEG", quality=92, optimize=True)
            kb = os.path.getsize(out_path) // 1024
            print(f"        {img.width}×{img.height} → saved ({kb} KB) ✓")
            succeeded += 1
        except Exception as e:
            print(f"        ERROR: {e}")
            failed.append((slug, str(e)))

    print(f"\n{'=' * 58}")
    print(f"Done: {succeeded} regenerated, {len(failed)} failed")

    if failed:
        print("\nFailed (re-run to retry):")
        for slug, err in failed:
            print(f"  {slug}: {err}")

    if succeeded > 0:
        print("\nNext steps:")
        print("  git add public/images/blog/")
        print("  git commit -m 'replace low-quality blog images with improved versions'")
        print("  git push")


if __name__ == "__main__":
    main()
