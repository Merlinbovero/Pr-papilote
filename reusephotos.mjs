// Réutilise une image déjà présente (public/images) pour une fiche, avec crédit fourni.
// node reusephotos.mjs manifest.json — [{yaml, src, alt, author, license, licenseUrl?, sourceUrl, focal?}]
import { readFileSync, writeFileSync } from "node:fs";
const manifest = JSON.parse(readFileSync(process.argv[2], "utf8"));
for (const e of manifest) {
  const lines = readFileSync(e.yaml, "utf8").split("\n");
  if (lines.some((l) => l.startsWith("image:"))) {
    console.log("SKIP", e.yaml);
    continue;
  }
  const block = [
    "image:",
    `  src: ${e.src}`,
    `  alt: ${e.alt}`,
    `  author: ${e.author}`,
    `  license: ${e.license}`,
  ];
  if (e.licenseUrl) block.push(`  licenseUrl: ${e.licenseUrl}`);
  block.push(`  sourceUrl: ${e.sourceUrl}`);
  if (e.focal) block.push(`  focal: ${e.focal}`);
  const idx = lines.findIndex((l) => l.startsWith("slug:"));
  lines.splice(idx + 1, 0, ...block);
  writeFileSync(e.yaml, lines.join("\n"));
  console.log("OK", e.yaml.split("/").slice(-1)[0]);
}
