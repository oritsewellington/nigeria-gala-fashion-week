const NORMALIZE_CASE = true;

const NOMINEES = {
  "Pageant Queen of the Year": [
    "Imaduerie Naomi",
    "Elvis-Zekeri Naomi (Miss iTv Nigeria.)",
    "EGUABOR clementina",
    "Ekoma Praise",
    "FAVOUR OGHOGHO",
    "Favour Atoe",
    "Idonuagbe Peace",
    "JUDITH MMESOMA DAVID",
    "THEODORA OSARUMEN OSEMWOWA",
    "Oghojafor Flourish",
  ],
  "Clothing Brand of the Year": [
    "Gfameluxe",
    "Ledd Mart",
    "BOLOZANGO",
    "Third world NG",
  ],
  "Female Model of the Year": [
    "JESSICA OSARO IYOBOSA",
    "Ishioma abundance",
    "THEODORA OSARUMEN OSEMWOWA",
    "Success Efe Agbontaen",
    "ABU VICTORY UKHOKHOMITOSHI PERPETUAL",
  ],
  "Dancer of the Year": [
    "Okolo Mary-Joy",
    "Corporal princess Efehmena",
    "Temofe",
    "Ahiante Solomon ose",
    "Ikegbue Emmanuel",
    "KING",
  ],
  "MUA of the Year": [
    "Glam by ruky",
    "𝙲𝚎𝚊 𝚟𝚊𝚕𝚖𝚘𝚗𝚝",
    "Eyanobonre lucky",
    "Magnifiko",
    "Arnuad",
  ],
  "Artist of the Year": [
    "Derek more",
    "Bad boy Teggz",
    "Uyi Carthy",
    "Golden Kers",
    "Wicked Remy",
    "Collinmanny",
    "Queen Bella",
    "SUPERSTAR KARO",
    "TYDA",
  ],
  "Photographer of the Year": [
    "Uja’s Visual",
    "Benin Parazzi",
    "Pshot media",
    "House of Eric",
    "Preachman concept",
    "Dominic Visuals",
    "ZHAMI Empire",
    "Ansel Photography",
    "Quick concept",
    "RYAN SHOT IT",
    "ENIGGY VIBES",
  ],
  "Mobile Photographer of the Year": [
    "Epic Studio",
    "Niré shot it",
    "DIVYN Edits",
    "Ade Mobile",
  ],
  "Brand of the Year": [
    "Magsosa luxury",
    "Favy walks",
    "KK Beauty world",
    "Treasure Collect Creative",
    "Rooted",
    "Hairbyvida",
    "Desire Emmanuel",
    "OMO BEST FURNITURE",
    "HOUSE OF HILDA",
    "KINGS JERSEY",
    "Vida’s Place",
  ],
  "Male Runway Model of the Year": [
    "osaigbovo precious",
    "Owen Iyayi ohenhen",
    "Patrick praise junior",
    "lucky lerry",
    "ojoboh dafenone Great",
    "ucheka babayem",
    "ovedje otega",
  ],
  "Female Runway Model of the Year": [
    "Osaromwenyeke precious",
    "oshomole Emmanuella",
    "omene blessing oghenesunwe",
    "harmony uwaila osadolor",
    "Adesunloye Funmilayo",
    "Ahaji chidimma Augusta Gabriella",
    "Abu victory ukhokhomitoshi perpetual",
  ],
  "Influencer / Tiktoker of the Year": [
    "King ololo",
    "E-F-L-A-M-E-S",
    "Big dilva",
  ],
  "Commercial Model of the Year": [
    "Goodluck Osazemwinde",
    "Burutu Sunday Avura",
    "Ogagaworia Divine",
  ],
  "Male Model of the Year": [
    "Clinton Comis",
    "Jaden Godknows",
    "IDEMUDIA OSARODION MICHAEL",
    "OROVWIGHO DAVIS-BEN",
    "Aisosa Omokaro",
    "Ojo Prosper",
  ],
  "Male Designer of the Year": [
    "Oliver Clifford Ltd (CELEBRITY TAILOR)",
    "KINGS KLOTHING",
    "MANUEL REGAL",
    "EDDIE CLOTHIER",
    "J ROYAL COUTURE",
    "RIO APPAREL",
    "DEZNY D CREATAILOR",
  ],
  "Female Designer of the Year": [
    "Tailored by karo",
    "Janet anekwa",
    "Kome Glamour",
    "Dazzz fashion",
  ],
  "Pageant King of the Year": [
    "RODERICK",
    "ALFRED",
    "HENGRY",
    "VELOCITY",
    "Agbai Blessed Christopher",
  ],
};

const KEEP_UPPER = new Set(["NG", "MUA", "KK", "TV", "UK", "USA", "DJ", "ITV"]);
const KEEP_LOWER = new Set(["of", "the", "by", "and", "de"]);

function tidyName(raw) {
  // NFKC turns fancy letters (like the styled "Cea valmont") into normal ones. Also drop invisible characters and extra spaces.
  let name = String(raw)
    .normalize("NFKC")
    .replace(/[​-‍⁠﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!NORMALIZE_CASE) return name;

  return name
    .split(" ")
    .map((word, i) => {
      const letters = word.replace(/[^A-Za-z]/g, "");
      if (letters.length < 2) return word; // single letters, "(", etc.
      const allUpper = letters === letters.toUpperCase();
      const allLower = letters === letters.toLowerCase();
      if (!allUpper && !allLower) return word; // mixed case such as "iTv" or "McDonald": leave exactly as typed
      if (KEEP_UPPER.has(letters.toUpperCase()))
        return word.replace(letters, letters.toUpperCase());
      if (i > 0 && KEEP_LOWER.has(letters.toLowerCase()))
        return word.toLowerCase();
      // Capitalise each part around hyphens, brackets and the like: "mary-joy" -> "Mary-Joy", "(celebrity" -> "(Celebrity"
      return word
        .toLowerCase()
        .replace(
          /(^|[^a-z’'])([a-z])/g,
          (_, pre, ch) => pre + ch.toUpperCase(),
        );
    })
    .join(" ");
}

// A plain gold silhouette so every nominee has a picture until the real photo is uploaded in the dashboard.
const PLACEHOLDER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#1a1410"/>' +
  '<circle cx="200" cy="155" r="62" fill="#e2b865" opacity="0.85"/>' +
  '<path d="M70 400c0-84 58-138 130-138s130 54 130 138z" fill="#e2b865" opacity="0.85"/></svg>';
const PLACEHOLDER_URL = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`;

function buildList() {
  return Object.entries(NOMINEES).map(([category, names]) => ({
    category,
    names: names.map(tidyName),
  }));
}

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  const list = buildList();

  if (dryRun) {
    let total = 0;
    for (const { category, names } of list) {
      console.log(`\n${category} (${names.length})`);
      names.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
      total += names.length;
    }
    console.log(
      `\n[Seed] Dry run: ${total} nominees in ${list.length} categories. Nothing was changed.`,
    );
    return;
  }

  require("dotenv").config();
  const mongoose = require("mongoose");
  const Category = require("../models/Category");
  const Contestant = require("../models/Contestant");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("[Seed] Connected to MongoDB:", mongoose.connection.host);

  const categories = await Category.find({
    name: { $in: list.map((l) => l.category) },
  });
  const byName = new Map(categories.map((c) => [c.name, c]));
  const missing = list
    .filter((l) => !byName.has(l.category))
    .map((l) => l.category);
  if (missing.length) {
    console.error(
      "[Seed] These categories do not exist yet. Run your main seed first, then try again:\n  - " +
        missing.join("\n  - "),
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;
  for (const { category, names } of list) {
    const cat = byName.get(category);
    const result = await Contestant.bulkWrite(
      names.map((name) => ({
        updateOne: {
          filter: { name, category: cat._id },
          update: {
            $setOnInsert: {
              name,
              category: cat._id,
              bio: "",
              photo: { url: PLACEHOLDER_URL, publicId: "seed-placeholder" },
              voteCount: 0,
              isActive: true,
            },
          },
          upsert: true,
        },
      })),
    );
    created += result.upsertedCount;
    skipped += result.matchedCount;
    console.log(
      `[Seed] ${category}: ${result.upsertedCount} added, ${result.matchedCount} already there`,
    );
  }

  console.log(
    `[Seed] Done. ${created} nominees added, ${skipped} already existed.`,
  );
  await mongoose.disconnect();
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Seed] Failed:", err);
      process.exit(1);
    });
}

module.exports = { buildList, tidyName, NOMINEES };
