#!/usr/bin/env python3
"""
regen_emergency_image.py
========================
Regenerates ONLY the emergency-tree-service-santa-cruz.jpg with an
improved prompt designed for maximum photorealism.

Key changes vs. previous prompt:
  - No people (human figures always look distorted in AI generation)
  - Daytime post-storm scene (natural light >> artificial night lighting)
  - Single focal point: fallen tree on house
  - Specific tree type, house style, debris details
  - Photography terminology to anchor realism

USAGE:
  python3 regen_emergency_image.py
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

SLUG   = "emergency-tree-service-santa-cruz"
PROMPT = (
    "large uprooted eucalyptus tree fallen directly onto a California suburban house roof, "
    "massive trunk resting across the roofline, broken roof shingles and structural damage visible, "
    "exposed root ball on wet lawn, scattered branches and leaves covering driveway, "
    "overcast gray post-storm sky, no people, wide angle shot, "
    "documentary news photography, Canon 5D Mark IV, photorealistic"
)


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
        "parameters": {"width": 1024, "height": 576, "num_inference_steps": 4, "guidance_scale": 0},
    }
    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=120)
            if resp.status_code == 200:
                return Image.open(io.BytesIO(resp.content)).convert("RGB")
            elif resp.status_code == 503:
                print(f"  Model loading, waiting 25s (attempt {attempt}/{retries})...")
                time.sleep(25)
            elif resp.status_code == 429:
                print(f"  Rate limited, waiting 60s...")
                time.sleep(60)
            else:
                raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:200]}")
        except requests.exceptions.Timeout:
            if attempt < retries:
                print(f"  Timeout, retrying ({attempt}/{retries})...")
                time.sleep(5)
            else:
                raise
    raise RuntimeError(f"Failed after {retries} attempts")


def main():
    out_path = os.path.join(OUTPUT_DIR, f"{SLUG}.jpg")
    existing_kb = os.path.getsize(out_path) // 1024 if os.path.exists(out_path) else 0

    print("=" * 60)
    print("  Emergency image regeneration — improved prompt")
    print("=" * 60)
    print(f"Output : {out_path}")
    if existing_kb:
        print(f"Replacing existing file ({existing_kb} KB)")
    print(f"\nPrompt : {PROMPT}\n")

    token = get_token()

    print("Generating...")
    try:
        img = generate(PROMPT, token)
        img.save(out_path, "JPEG", quality=92, optimize=True)
        kb = os.path.getsize(out_path) // 1024
        print(f"\n✓ Saved {img.width}×{img.height} ({kb} KB)")
        print("\nNext steps:")
        print(f"  git add public/images/blog/{SLUG}.jpg")
        print("  git commit -m 'replace emergency tree service image with improved version'")
        print("  git push")
    except Exception as e:
        print(f"\n✗ Failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
