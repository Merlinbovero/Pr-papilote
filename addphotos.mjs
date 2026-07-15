// Outil de lot : ajoute des photos de fiches depuis un manifeste JSON.
// node addphotos.mjs manifest.json  — manifeste = [{yaml, slug, file, alt, focal?}]
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import sharp from "sharp";

const manifest = JSON.parse(readFileSync(process.argv[2], "utf8"));

function licenseInfo(short) {
  const s = (short || "").trim();
  if (/public domain|domaine public/i.test(s)) return { license: "Domaine public" };
  let m;
  if ((m = s.match(/^CC BY-SA (\d\.\d)/i)))
    return {
      license: `CC BY-SA ${m[1]}`,
      url: `https://creativecommons.org/licenses/by-sa/${m[1]}/deed.fr`,
    };
  if ((m = s.match(/^CC BY (\d\.\d)/i)))
    return {
      license: `CC BY ${m[1]}`,
      url: `https://creativecommons.org/licenses/by/${m[1]}/deed.fr`,
    };
  if (/^CC0/i.test(s))
    return { license: "CC0", url: "https://creativecommons.org/publicdomain/zero/1.0/deed.fr" };
  return { license: s, unknown: true };
}

async function meta(file) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata%7Curl&iiextmetadatafilter=LicenseShortName%7CArtist&titles=" +
    encodeURIComponent("File:" + file);
  const j = JSON.parse(execSync(`curl -s --max-time 30 "${url}"`, { maxBuffer: 1e8 }).toString());
  const page = Object.values(j.query.pages)[0];
  const ii = page.imageinfo[0];
  const author = (ii.extmetadata?.Artist?.value || "?")
    .replace(/<[^>]*>/g, "")
    .replace(/\n/g, " ")
    .trim();
  const lic = ii.extmetadata?.LicenseShortName?.value || "?";
  return { author, lic, source: ii.descriptionshorturl };
}

for (const entry of manifest) {
  const yamlPath = entry.yaml;
  const lines = readFileSync(yamlPath, "utf8").split("\n");
  if (lines.some((l) => l.startsWith("image:"))) {
    console.log("SKIP (has image):", entry.slug);
    continue;
  }
  const m = await meta(entry.file);
  const li = licenseInfo(m.lic);
  if (li.unknown) {
    console.log("!! LICENCE NON LIBRE:", entry.slug, "->", m.lic, "(ignoré)");
    continue;
  }
  const out = `public/images/fiche-${entry.slug}.jpg`;
  const tmp = `/tmp/dl-${entry.slug}`;
  execSync(
    `curl -sL -G "https://commons.wikimedia.org/w/index.php" --data-urlencode "title=Special:Redirect/file/${entry.file}" --data-urlencode "width=1600" -o "${tmp}"`
  );
  const info = await sharp(tmp)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 74, mozjpeg: true })
    .toFile(out);
  const block = [
    "image:",
    `  src: /images/fiche-${entry.slug}.jpg`,
    `  alt: ${entry.alt}`,
    `  author: ${m.author}`,
    `  license: ${li.license}`,
  ];
  if (li.url) block.push(`  licenseUrl: ${li.url}`);
  block.push(`  sourceUrl: ${m.source}`);
  if (entry.focal) block.push(`  focal: ${entry.focal}`);
  const idx = lines.findIndex((l) => l.startsWith("slug:"));
  lines.splice(idx + 1, 0, ...block);
  writeFileSync(yamlPath, lines.join("\n"));
  console.log(
    `OK ${entry.slug} — ${li.license} — ${m.author.slice(0, 30)} — ${Math.round(info.size / 1024)}KB`
  );
}
