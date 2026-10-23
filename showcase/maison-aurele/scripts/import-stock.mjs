// Downloads the Maison Aurèle stock photos from Unsplash (Unsplash License:
// free to use, no attribution required) into public/aurele, then writes the
// photographer credits to src/data/credits.js.
// Needs UNSPLASH_ACCESS_KEY in .env.local (free key, 50 requests an hour).
// Usage: node scripts/import-stock.mjs [--skip-existing]
//        node scripts/import-stock.mjs --track <id> <id>…  (report downloads only)
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "public/aurele");
const MAX = 2880;

// [destination, Unsplash photo id, image base URL, photographer, username]
const PHOTOS = [
  ["pieces/robe-or-brodee", "jWqBLbcmT34", "https://images.unsplash.com/photo-1610209740880-6ecc4b20ea78", "Alexander Jawfox", "jawfox_photography"],
  ["pieces/fourreau-fleurs-or", "L41z02YZnJo", "https://images.unsplash.com/photo-1790623389184-021a93eff439", "McFollis", "thisismcfollis"],
  ["pieces/robe-bustier-pourpre-1", "PFcm5b3GApU", "https://images.unsplash.com/photo-1773574488220-569921a63d39", "Nkululeko Mayiyane", "nkuleesparx"],
  ["pieces/robe-bustier-pourpre-2", "YrulmVmddhA", "https://images.unsplash.com/photo-1773574488221-08b2883a1c80", "Nkululeko Mayiyane", "nkuleesparx"],
  ["pieces/robe-bustier-pourpre-3", "5LDxUdgD2h8", "https://images.unsplash.com/photo-1773574488217-eb936b733cae", "Nkululeko Mayiyane", "nkuleesparx"],
  ["pieces/robe-manches-cloche", "jrsWp9tDvlo", "https://images.unsplash.com/photo-1756483509162-b92ea967a884", "iKshana Productions", "ikshanaproductions"],
  ["pieces/robe-bal-tulle", "-NyPn9up_7o", "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb", "Khaled Ghareeb", "khaledkagii"],
  ["pieces/robe-noire-brodee-1", "V-oKHn1ZCL0", "https://images.unsplash.com/photo-1783013953015-aaf234e7ac27", "melvin Ankrah", "hashtagmelvin"],
  ["pieces/robe-noire-brodee-2", "d0bEg1Uetc4", "https://images.unsplash.com/photo-1783013953018-348f6eccef0c", "melvin Ankrah", "hashtagmelvin"],
  ["pieces/robe-noire-brodee-3", "s23veF61XCU", "https://images.unsplash.com/photo-1783013952887-aaec97f086d6", "melvin Ankrah", "hashtagmelvin"],
  ["pieces/robe-volants-1", "QN507MdnxRQ", "https://images.unsplash.com/photo-1568251188392-ae32f898cb3b", "Khaled Ghareeb", "khaledkagii"],
  ["pieces/robe-volants-2", "OjMiS43gEPo", "https://images.unsplash.com/photo-1568251723346-462c2abfd420", "Khaled Ghareeb", "khaledkagii"],
  ["pieces/robe-cape-faille-1", "r5etsH8QAvo", "https://images.unsplash.com/photo-1764998112626-23f005c580d7", "Michael Kyule", "madness_leahcim_"],
  ["pieces/robe-cape-faille-2", "dXxb61MYo40", "https://images.unsplash.com/photo-1764998112562-951d6f0abb62", "Michael Kyule", "madness_leahcim_"],
  ["pieces/robe-cape-faille-3", "AIaYcpfB7jo", "https://images.unsplash.com/photo-1764998112680-2f617dc9be40", "Michael Kyule", "madness_leahcim_"],
  ["pieces/sirene-sequins-or", "Sb1HO8WQwTY", "https://images.unsplash.com/photo-1791806808812-bee2c21c6ebd", "Picture & Poet", "amarpoems08"],
  ["pieces/smoking-noir-1", "I-m942x9Kdk", "https://images.unsplash.com/photo-1677246791501-85875b1ab187", "ANHELINA OSAULENKO", "linaos"],
  ["pieces/smoking-noir-2", "fMGS4vZsYuI", "https://images.unsplash.com/photo-1654160655268-420e885f1f94", "Aydin sefidi", "aydinsefidi"],
  ["pieces/bustier-sculpte", "qCCaBQ8b6lM", "https://images.unsplash.com/photo-1568251478083-32c27296c2c2", "Khaled Ghareeb", "khaledkagii"],
  ["pieces/robe-manteau-velours-1", "K050zgWCGFg", "https://images.unsplash.com/photo-1759229874871-1dd3fb8c4619", "MANITO SILK", "manitosilk_official"],
  ["pieces/robe-manteau-velours-2", "upOjeS6d_0g", "https://images.unsplash.com/photo-1675929112281-7fad4e8b0687", "Marjan Sadeghi", "marijeane"],
  ["pieces/robe-satin-noir", "77iyep3uIjg", "https://images.unsplash.com/photo-1623580674393-edf6eb7090f8", "Knight Duong", "knightduong"],
  ["pieces/robe-bal-ivoire-1", "xGrKC0oap2c", "https://images.unsplash.com/photo-1782787231449-1d1ae83dc33d", "Alexander Mass", "alexandermassph"],
  ["pieces/robe-bal-ivoire-2", "Ii8HZj7mv-I", "https://images.unsplash.com/photo-1783368241380-48c25bb7be1a", "sofia inductgroup", "sofia_induct"],
  ["looks/salon-dore", "MOXm5jc8I0A", "https://images.unsplash.com/photo-1551621955-fa07d4b1376b", "Khaled Ghareeb", "khaledkagii"],
  ["looks/volants-ivoire", "eFafjVQbKuI", "https://images.unsplash.com/photo-1790503075764-6179b1ae9095", "Alfonso Scarpa", "lucidistortephoto"],
  ["looks/velours-rouge", "hNW0fA3g8Ak", "https://images.unsplash.com/photo-1770294759013-a5784266a817", "MANITO SILK", "manitosilk_official"],
  ["details/broderie-or", "sOpW69Ylb_k", "https://images.unsplash.com/photo-1789541759782-aab84821a495", "Marija Zaric", "simplicity"],
  ["details/perlage", "7COJ5feDDns", "https://images.unsplash.com/photo-1710077668518-ba016253621d", "The Now Time", "thenowtime"],
  ["details/bouton", "Y4T5JZfK3Dw", "https://images.unsplash.com/photo-1603796847238-5253216c8811", "Romain Dancre", "romaindancre"],
  ["details/main", "sdwAjbdKrI0", "https://images.unsplash.com/photo-1744502672203-98316831f121", "Kristina Tochilko", "tochilko"],
  ["details/dentelle-or", "80Jj0MvJm_s", "https://images.unsplash.com/photo-1787554497632-1727c23e58cb", "Raúl Mermans García", "raulmermans"],
  ["defile/salon-or", "_IK3JENSQr0", "https://images.unsplash.com/photo-1785441513755-af171009e068", "The Metropolitan Museum of Art", "metropolitanmuseum"],
  ["defile/salon-bleu", "MvzKK7wqAbc", "https://images.unsplash.com/photo-1785441513757-56bba752353d", "The Metropolitan Museum of Art", "metropolitanmuseum"],
  ["defile/podium-lavande", "zxryaDavUfY", "https://images.unsplash.com/photo-1788621795554-6ea003c632eb", "Sou Jest", "soujest"],
  ["defile/podium-noir", "2mIAEadVNQ4", "https://images.unsplash.com/photo-1788801387730-90eb62373625", "Sou Jest", "soujest"],
  ["defile/podium-rouge", "U6qEM8DHAX0", "https://images.unsplash.com/photo-1788800556084-3ea31ed5ad02", "Sou Jest", "soujest"],
  ["defile/podium-lavande-2", "zxryaDavUfY", "https://images.unsplash.com/photo-1788621795554-6ea003c632eb", "Sou Jest", "soujest"],
  ["defile/podium-or", "1RkORLfuQQg", "https://images.unsplash.com/photo-1788621795520-f9bbf18c3128", "Sou Jest", "soujest"],
  ["defile/podium-bleu", "Ak2srdeVVyg", "https://images.unsplash.com/photo-1788621795497-7032767270d7", "Sou Jest", "soujest"],
  ["defile/coulisses-essayage", "7bfUz5T9JLE", "https://images.unsplash.com/photo-1741946303069-5884e5a6f793", "Mihaela Claudia Puscas", "mihaela_claudia_p"],
  ["defile/coulisses-coiffure", "Jjutc-yzW2Y", "https://images.unsplash.com/photo-1784833066652-e2809e77b0e4", "sofia inductgroup", "sofia_induct"],
  ["defile/coulisses-maquillage", "AiVmcaD5ijE", "https://images.unsplash.com/photo-1719613959577-434f93b266d7", "Alisa Orlova", "alice_odessa"],
  ["defile/coulisses-nb", "_AIVL1hzbCs", "https://images.unsplash.com/photo-1628589092891-afffbd4863b5", "Kazuo ota", "kazuo513"],
  ["defile/coulisses-cape", "Jvk5b2FQIXQ", "https://images.unsplash.com/photo-1784833066649-7833eec50138", "sofia inductgroup", "sofia_induct"],
  ["defile/coulisses-couloir", "k-bPr_Qh7b8", "https://images.unsplash.com/photo-1782787231493-1a221478d066", "Alexander Mass", "alexandermassph"],
  ["defile/passage-ivoire", "k49kD3YXOsc", "https://images.unsplash.com/photo-1616348490852-d80c545b4f79", "Duane Mendes", "duanemendes"],
  ["defile/passage-rouge", "bPK2UHAQbWg", "https://images.unsplash.com/photo-1733322991133-2de13aa12c57", "Ben Iwara", "1hundredimages"],
  ["defile/premier-rang", "C4XXBa1ZQWI", "https://images.unsplash.com/flagged/photo-1568988039441-11f295d74d89", "Yogendra Singh", "yogendras31"],
  ["defile/passage-traine", "F7rj7WS0utE", "https://images.unsplash.com/photo-1733322986999-2ce54a7c6d0d", "Ben Iwara", "1hundredimages"],
  ["defile/passage-lumiere", "ODw7eqWd3QY", "https://images.unsplash.com/flagged/photo-1553277004-39d655b57262", "Gbenga Onalaja", "onalaja_"],
  ["defile/passage-fourrure", "A-46fIiotTk", "https://images.unsplash.com/photo-1776627780164-865032b49cc9", "GALINA BOGDANOVA", "galibagi"],
  ["defile/passage-blanc", "p-gGii_xGK8", "https://images.unsplash.com/photo-1613909671501-f9678ffc1d33", "Duane Mendes", "duanemendes"],
  ["atelier/porte", "uUn5ei8Ba1Y", "https://images.unsplash.com/photo-1567777301743-3b7ef158aadf", "Khaled Ghareeb", "khaledkagii"],
  ["atelier/tailleur", "4f3VU5uhOEA", "https://images.unsplash.com/photo-1618866903271-595806e0679d", "Alexei Maridashvili", "lexoge"],
  ["atelier/drape", "LWiKQSW1P8Y", "https://images.unsplash.com/photo-1744502671648-7cd2358a193f", "Kristina Tochilko", "tochilko"],
  ["atelier/essayage", "wgBVONz-lgo", "https://images.unsplash.com/photo-1782787231754-ff17b7b49114", "Alexander Mass", "alexandermassph"],
  ["atelier/mannequin", "tTn-X7huVbI", "https://images.unsplash.com/photo-1774009501393-bac5a0a11afc", "Sou Jest", "soujest"],
  ["atelier/fil", "ddKDfRRKVZw", "https://images.unsplash.com/photo-1718963581743-10d76f92d42f", "Branislav Rodman", "branislavrodman"],
  ["atelier/robe-cintre", "hMn-n-tFHE0", "https://images.unsplash.com/photo-1782787230428-02c6192a62ab", "Alexander Mass", "alexandermassph"],
  ["atelier/toiles", "BzZ6hnqtsbo", "https://images.unsplash.com/photo-1673201230274-c4dbd20c3f79", "Collab Media", "collab_media"],
];

const env = await readFile(join(ROOT, ".env.local"), "utf8").catch(() => "");
const KEY = env.match(/^UNSPLASH_ACCESS_KEY=(.+)$/m)?.[1].trim();
if (!KEY) throw new Error("UNSPLASH_ACCESS_KEY missing from .env.local");
const skip = process.argv.includes("--skip-existing");
const exists = (p) => access(p).then(() => true, () => false);
const report = (id) =>
  fetch(`https://api.unsplash.com/photos/${id}/download`, {
    headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" },
  });

if (process.argv[2] === "--track") {
  for (const id of process.argv.slice(3)) console.log(id, (await report(id)).status);
  process.exit(0);
}

const untracked = [];
for (const [dest, id, base] of PHOTOS) {
  const out = join(OUT, `${dest}.jpg`);
  if (skip && (await exists(out))) continue;
  // The API guidelines ask apps to report each download
  if (!(await report(id)).ok) untracked.push(id);
  const res = await fetch(`${base}?w=${MAX}&q=85&fm=jpg&fit=max`);
  if (!res.ok) {
    console.error(`✗ ${dest} (${res.status})`);
    continue;
  }
  await mkdir(dirname(out), { recursive: true });
  await sharp(Buffer.from(await res.arrayBuffer()))
    .resize(MAX, MAX, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out);
  console.log(`✓ ${dest}`);
}

// Credits, grouped by photographer
const byUser = new Map();
for (const [, , , name, username] of PHOTOS) byUser.set(username, name);
const credits = [...byUser].map(([username, name]) => ({ name, url: `https://unsplash.com/@${username}` }));
await writeFile(
  join(ROOT, "src/data/credits.js"),
  `// Generated by scripts/import-stock.mjs — photographers of the Unsplash images.\nexport const credits = ${JSON.stringify(credits, null, 2)};\n`
);

if (untracked.length) {
  console.warn(`Rate limit: run in an hour → node scripts/import-stock.mjs --track ${untracked.join(" ")}`);
}
