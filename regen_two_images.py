#!/usr/bin/env python3
"""
regen_two_images.py
===================
Regenerates emergency-tree-service-santa-cruz.jpg and
eucalyptus-tree-removal-santa-cruz.jpg with redesigned prompts.

Prompt strategy:
  - NO PEOPLE (human figures always distort in AI generation)
  - NO complex geometry (tree-on-house is hard; fallen-tree-on-street is easier)
  - Single strong focal point per image
  - Natural daylight, overcast for drama without fake lighting
  - Specific bark/wood/debris details anchor realism
  - Camera model anchors toward documentary/news photography style

USAGE:
  python3 regen_two_images.py
"""

from __future__ import annotations
import io, os, sys, time, warnings
warnings.filterwarnings("ignore")

try:
    import requests
    from PIL import Image
except ImportError:
    sys.exit("Missing: pip3 install requests Pillow")

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images", "blog")
HF_API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"

IMAGES = [
    (
        "emergency-tree-service-santa-cruz",
        # Strategy: show the AFTERMATH of a tree falling on a street —
        # no house geometry needed, no people, just the raw scale of
        # a massive fallen tree blocking a residential road with clear
        # emergency indicators. Simple, single-focus, maximum impact.
        "enormous uprooted tree fallen across a quiet California residential street, "
        "massive gnarled root ball torn from ground, thick trunk lying across wet asphalt, "
        "broken branches covering both lanes, fallen leaves and debris on road, "
        "overcast gray storm sky, yellow caution tape stretched across background, "
        "no people visible, ground-level wide angle, Sony A7R photorealistic",
    ),
    (
        "eucalyptus-tree-removal-santa-cruz",
        # Strategy: show large eucalyptus trunk sections stacked after
        # removal — no crane, no people needed, distinctive eucalyptus
        # bark is recognizable and renders well. The scale of the logs
        # communicates the size of the removed tree.
        "large freshly cut eucalyptus tree trunk sections stacked in a California "
        "suburban driveway after removal, distinctive fibrous reddish-brown "
        "eucalyptus bark and pale cream wood grain on cut ends, pile of wood chips "
        "and leafy branches on green lawn beside driveway, sunny afternoon blue sky, "
        "no people, wide angle DSLR, photorealistic",
    ),
]


def get_token() -> str:
    token = os.environ.get("HF_TOKEN", "").strip()
    if token:
        print(f"Using HF_TOKEN from environment ({token[:8]}...)\n")
        return token
    print("Hugging Face API token required.")
    print("Get one at: https://huggingface.co/settings/tokens\n")
    token = input("Paste your token: ").strip()
    if not token:
        sys.exit("No token — exiting.")
    return token


def generate(prompt: str, token: str, retries: int = 4) -> Image.Image:
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
            resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=120)
            if resp.status_code == 200:
                return Image.open(io.BytesIO(resp.content)).convert("RGB")
            elif resp.status_code == 503:
                print(f"    Model loading, waiting 25s (attempt {attempt}/{retries})...")
                time.sleep(25)
            elif resp.status_code == 429:
                print(f"    Rate limited, waiting 60s...")
                time.sleep(60)
            else:
                raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:200]}")
        except requests.exceptions.Timeout:
            if attempt < retries:
                print(f"    Timeout, retrying ({attempt}/{retries})...")
                time.sleep(5)
            else:
                raise
    raise RuntimeError(f"Failed after {retries} attempts")


def main():
    print("=" * 62)
    print("  Regenerating 2 images with redesigned prompts")
    print("=" * 62)

    token = get_token()
    succeeded, failed = 0, []

    for slug, prompt in IMAGES:
        out_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")
        existing_kb = os.path.getsize(out_path) // 1024 if os.path.exists(out_path) else 0
        print(f"\n{'─'*60}")
        print(f"  {slug}")
        print(f"  Replacing: {existing_kb} KB  →  new file")
        print(f"  Prompt: {prompt[:90]}...")

        try:
            img = generate(prompt, token)
            img.save(out_path, "JPEG", quality=92, optimize=True)
            kb = os.path.getsize(out_path) // 1024
            print(f"  ✓ {img.width}×{img.height}  saved ({kb} KB)")
            succeeded += 1
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed.append((slug, str(e)))

    print(f"\n{'='*62}")
    print(f"Done: {succeeded} generated, {len(failed)} failed")

    if failed:
        print("\nFailed (re-run to retry):")
        for slug, err in failed:
            print(f"  {slug}: {err}")

    if succeeded:
        print("\nNext steps:")
        print("  git add public/images/blog/emergency-tree-service-santa-cruz.jpg \\")
        print("         public/images/blog/eucalyptus-tree-removal-santa-cruz.jpg")
        print("  git commit -m 'replace emergency + eucalyptus images with improved versions'")
        print("  git push")


if __name__ == "__main__":
    main()
