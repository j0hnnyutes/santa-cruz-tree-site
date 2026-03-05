/**
 * Image optimization script — run from your Mac terminal:
 *   node scripts/optimize-images.mjs
 *
 * Converts public/assets/*.png → optimized WebP at 85% quality, max 1600px wide.
 * Originals are preserved as *.original.png in case you need them.
 * Requires: npm install sharp  (already in devDependencies via Next.js)
 */

import sharp from "sharp";
import { readdir, rename, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, "../public/assets");

const MAX_WIDTH = 1600;   // px — wide enough for full-bleed on any screen
const QUALITY = 85;       // WebP quality (85 is visually near-lossless)

async function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function main() {
  const files = await readdir(assetsDir);
  const pngs = files.filter(
    (f) => f.endsWith(".png") && !f.endsWith(".original.png")
  );

  if (pngs.length === 0) {
    console.log("No PNG files found in public/assets/");
    return;
  }

  console.log(`\nOptimizing ${pngs.length} PNG file(s)...\n`);

  for (const file of pngs) {
    const inputPath = path.join(assetsDir, file);
    const baseName = file.replace(/\.png$/, "");
    const outputPath = path.join(assetsDir, `${baseName}.webp`);
    const backupPath = path.join(assetsDir, `${baseName}.original.png`);

    // Skip if WebP already exists
    if (existsSync(outputPath)) {
      console.log(`  ⏭  ${file} → already optimized, skipping`);
      continue;
    }

    const before = (await stat(inputPath)).size;

    await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const after = (await stat(outputPath)).size;
    const saving = Math.round((1 - after / before) * 100);

    // Backup original
    await rename(inputPath, backupPath);

    console.log(
      `  ✓  ${file}\n` +
      `     ${await formatBytes(before)} → ${await formatBytes(after)} (${saving}% smaller)\n` +
      `     Saved as: ${baseName}.webp  |  Original: ${baseName}.original.png\n`
    );
  }

  console.log("Done! Update any image src paths from .png → .webp\n");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
