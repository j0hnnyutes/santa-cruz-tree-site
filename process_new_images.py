#!/usr/bin/env python3
"""
process_new_images.py
=====================
Processes new blog images from the staging folder (public/images/blog/new/)
and moves them into the live blog images folder (public/images/blog/).

What it does for each image:
  1. Reads the file (PNG or JPEG)
  2. Resizes to 1024×576 if dimensions differ (high-quality Lanczos downscale,
     center-crops if aspect ratio doesn't match 16:9)
  3. Converts to JPEG at quality=92, optimize=True
  4. Saves to public/images/blog/<slug>.jpg  (overwrites the old file)
  5. Reports old size → new size

USAGE:
  pip3 install Pillow
  python3 process_new_images.py

Drop files into:  public/images/blog/new/
Expected naming:  <slug>.png  or  <slug>.jpg  (e.g. tree-removal-permits-santa-cruz.png)
Output lands at:  public/images/blog/<slug>.jpg
"""

from __future__ import annotations

import os
import sys

warnings_text = []

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Missing: pip3 install Pillow")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
STAGING_DIR = os.path.join(SCRIPT_DIR, "public", "images", "blog", "new")
OUTPUT_DIR  = os.path.join(SCRIPT_DIR, "public", "images", "blog")

TARGET_W, TARGET_H = 1024, 576
TARGET_RATIO = TARGET_W / TARGET_H   # 1.777…

VALID_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def center_crop_to_ratio(img: Image.Image, ratio: float) -> Image.Image:
    """Crop the image to the target aspect ratio, centered."""
    w, h = img.size
    current_ratio = w / h

    if abs(current_ratio - ratio) < 0.01:
        return img  # already correct ratio

    if current_ratio > ratio:
        # Too wide — crop left/right
        new_w = int(h * ratio)
        offset = (w - new_w) // 2
        return img.crop((offset, 0, offset + new_w, h))
    else:
        # Too tall — crop top/bottom
        new_h = int(w / ratio)
        offset = (h - new_h) // 2
        return img.crop((0, offset, w, offset + new_h))


def process_image(src_path: str, slug: str) -> dict:
    """Process a single image. Returns a result dict."""
    old_kb = os.path.getsize(src_path) // 1024
    img = Image.open(src_path).convert("RGB")
    original_size = img.size

    # 1. Center-crop to 16:9 if needed
    img = center_crop_to_ratio(img, TARGET_RATIO)
    cropped_size = img.size

    # 2. Resize to 1024×576 if needed
    if img.size != (TARGET_W, TARGET_H):
        img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)

    # 3. Save as optimized JPEG
    dest_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")
    img.save(dest_path, "JPEG", quality=92, optimize=True)
    new_kb = os.path.getsize(dest_path) // 1024

    return {
        "slug": slug,
        "src": src_path,
        "dest": dest_path,
        "original_size": original_size,
        "cropped_size": cropped_size,
        "final_size": img.size,
        "old_kb": old_kb,
        "new_kb": new_kb,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 62)
    print("  Blog Image Processor — Santa Cruz Tree Pros")
    print("=" * 62)
    print(f"  Staging → {STAGING_DIR}")
    print(f"  Output  → {OUTPUT_DIR}")
    print(f"  Target  → {TARGET_W}×{TARGET_H} JPEG, quality=92\n")

    # Collect files from staging
    candidates = []
    for fname in sorted(os.listdir(STAGING_DIR)):
        ext = os.path.splitext(fname)[1].lower()
        if ext in VALID_EXTENSIONS:
            slug = os.path.splitext(fname)[0]
            candidates.append((fname, slug))

    if not candidates:
        print(f"No images found in staging folder.")
        print(f"Drop .png / .jpg files into:\n  {STAGING_DIR}")
        return

    print(f"Found {len(candidates)} image(s) to process:\n")

    succeeded = []
    failed = []

    for fname, slug in candidates:
        src_path = os.path.join(STAGING_DIR, fname)
        print(f"  [{slug}]")

        # Check if a corresponding live image exists (warn if slug unknown)
        dest_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")
        if not os.path.exists(dest_path):
            print(f"    ⚠  No existing image found at {dest_path}")
            print(f"       This slug may be new — proceeding anyway.\n")

        try:
            result = process_image(src_path, slug)
            orig = "×".join(map(str, result["original_size"]))
            crop = "×".join(map(str, result["cropped_size"]))
            final = "×".join(map(str, result["final_size"]))

            steps = []
            if result["original_size"] != result["cropped_size"]:
                steps.append(f"cropped {orig} → {crop}")
            if result["cropped_size"] != result["final_size"]:
                steps.append(f"resized → {final}")
            steps.append(f"JPEG quality=92")

            print(f"    ✓  {' | '.join(steps)}")
            print(f"       {result['old_kb']} KB → {result['new_kb']} KB")
            print(f"       Saved: {result['dest']}\n")
            succeeded.append(result)

        except Exception as e:
            print(f"    ✗  ERROR: {e}\n")
            failed.append((slug, str(e)))

    # ---------------------------------------------------------------------------
    # Summary
    # ---------------------------------------------------------------------------
    print("=" * 62)
    print(f"Done: {len(succeeded)} processed, {len(failed)} failed\n")

    if succeeded:
        print("Files written (ready to commit):")
        for r in succeeded:
            print(f"  public/images/blog/{r['slug']}.jpg  ({r['new_kb']} KB)")

        print(f"\nNext steps:")
        slugs = " \\\n         ".join([f"public/images/blog/{r['slug']}.jpg" for r in succeeded])
        print(f"  git add {slugs}")
        print(f"  git commit -m 'replace blog images with improved versions'")
        print(f"  git push")

    if failed:
        print("\nFailed:")
        for slug, err in failed:
            print(f"  {slug}: {err}")


if __name__ == "__main__":
    main()
