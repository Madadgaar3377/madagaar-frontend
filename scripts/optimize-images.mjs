/**
 * Pre-compresses large homepage images to WebP for faster static delivery.
 * Run: node scripts/optimize-images.mjs
 */
import { existsSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const TARGETS = [
  { input: "Media/inshero.png", maxWidth: 900, quality: 82 },
  { input: "Media/Support service.png", maxWidth: 800, quality: 80 },
  { input: "Media/card/sadu.jpeg", maxWidth: 512, quality: 78 },
  { input: "Media/card/abubakkar.jpg", maxWidth: 512, quality: 78 },
  { input: "Media/card/rajaAfzal.jpeg", maxWidth: 512, quality: 78 },
];

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.log("sharp not installed  skipping static image optimization");
    return;
  }

  for (const { input, maxWidth, quality } of TARGETS) {
    const inputPath = join(publicDir, input);
    if (!existsSync(inputPath)) {
      console.warn(`skip (missing): ${input}`);
      continue;
    }

    const webpPath = inputPath.replace(/\.(png|jpe?g)$/i, ".webp");
    const before = statSync(inputPath).size;

    await sharp(inputPath)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toFile(webpPath);

    const after = statSync(webpPath).size;
    const saved = (((before - after) / before) * 100).toFixed(1);
    console.log(`${input} → .webp  ${(before / 1024).toFixed(1)} KiB → ${(after / 1024).toFixed(1)} KiB (−${saved}%)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
