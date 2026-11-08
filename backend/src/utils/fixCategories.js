/**
 * Checks the categories and nominees for the problems that make nominees show without a category,
 * and repairs them.
 *
 *   node src/utils/fixCategories.js          -> REPORT only (changes nothing)
 *   node src/utils/fixCategories.js --fix    -> report, then repair
 *   node src/utils/fixCategories.js --delete-duplicates
 *        -> also deletes leftover placeholder nominees that already exist correctly elsewhere
 *           (only if: category missing, still the seed placeholder photo, and 0 votes)
 *
 * Put it in the same folder as seed.js and seedContestants.js.
 * It never deletes anything and never touches votes or photos.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Contestant = require("../models/Contestant");
const { NOMINEES } = require("./seedContestants");

const slugify = (name) =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const run = async () => {
  const fix = process.argv.includes("--fix");
  const delDup = process.argv.includes("--delete-duplicates");
  await mongoose.connect(process.env.MONGO_URI);
  console.log(
    "[Check] Connected to",
    mongoose.connection.host,
    "/",
    mongoose.connection.name,
  );

  // Raw documents, so we see exactly what is stored (the model would hide missing fields).
  const cats = await Category.collection.find({}).toArray();
  console.log(`\n[Check] ${cats.length} categories found`);

  let catFixes = 0;
  for (const c of cats) {
    const set = {};
    const problems = [];
    if (!c.slug) {
      set.slug = slugify(c.name);
      problems.push("no slug");
    }
    if (typeof c.isActive !== "boolean") {
      set.isActive = true;
      problems.push("isActive missing (hidden from the public site)");
    }
    if (typeof c.description !== "string") {
      set.description = "";
      problems.push("no description");
    }
    if (!c.coverImage) {
      set.coverImage = { url: null, publicId: null };
      problems.push("no coverImage");
    }
    if (typeof c.displayOrder !== "number") {
      set.displayOrder = 0;
      problems.push("no displayOrder");
    }
    if (problems.length) {
      catFixes += 1;
      console.log(`  - "${c.name}": ${problems.join(", ")}`);
      if (fix)
        await Category.collection.updateOne({ _id: c._id }, { $set: set });
    }
  }
  if (!catFixes) console.log("  All categories look complete.");

  // Nominees whose category does not exist.
  const byId = new Map(cats.map((c) => [String(c._id), c]));
  const byName = new Map(cats.map((c) => [c.name, c]));
  const nameToCategory = new Map();

  const contestants = await Contestant.collection.find({}).toArray();
  console.log(`\n[Check] ${contestants.length} nominees found`);
  let orphans = 0;
  let relinked = 0;
  let duplicates = 0;
  let deleted = 0;
  const unresolved = [];
  // Names of nominees that are already correctly linked to a category that exists.
  const liveNames = new Set(
    contestants
      .filter((k) => k.category && byId.has(String(k.category)))
      .map((k) => k.name),
  );
  for (const k of contestants) {
    if (k.category && byId.has(String(k.category))) continue;
    orphans += 1;
    // A leftover copy: the same nominee already exists properly. Linking it would create a double entry.
    if (liveNames.has(k.name)) {
      duplicates += 1;
      const safe = k.photo?.publicId === "seed-placeholder" && !k.voteCount;
      console.log(
        `  - "${k.name}": category missing, but the same nominee already exists correctly. DUPLICATE${safe ? " (safe to delete)" : " (has votes or a real photo: left alone)"}`,
      );
      if (delDup && safe) {
        await Contestant.collection.deleteOne({ _id: k._id });
        deleted += 1;
      }
      continue;
    }
    // Find which category this nominee belongs to from the nominees list.
    const { tidyName } = require("./seedContestants");
    for (const [category, names] of Object.entries(NOMINEES)) {
      for (const n of names) {
        nameToCategory.set(`${tidyName(n)}||${category}`, category);
        nameToCategory.set(`${n}||${category}`, category);
      }
    }
    const owner = Object.keys(NOMINEES).find((cat) =>
      nameToCategory.has(`${k.name}||${cat}`),
    );
    const target = owner && byName.get(owner);
    if (target) {
      relinked += 1;
      console.log(`  - "${k.name}": category missing, will link to "${owner}"`);
      if (fix)
        await Contestant.collection.updateOne(
          { _id: k._id },
          { $set: { category: target._id } },
        );
    } else {
      unresolved.push(k.name);
    }
  }
  if (!orphans)
    console.log("  Every nominee points to a category that exists.");
  if (unresolved.length) {
    console.log(
      "\n[Check] These nominees have no category and are not in the nominees list. Set their category in the dashboard:",
    );
    unresolved.forEach((n) => console.log("  - " + n));
  }

  // Which categories have no nominees at all?
  const counts = await Contestant.collection
    .aggregate([{ $group: { _id: "$category", n: { $sum: 1 } } }])
    .toArray();
  const countMap = new Map(counts.map((x) => [String(x._id), x.n]));
  console.log(
    "\n[Check] Nominees per category" +
      (fix ? " (before relinking)" : "") +
      ":",
  );
  for (const c of cats)
    console.log(
      `  ${String(countMap.get(String(c._id)) || 0).padStart(3)}  ${c.name}`,
    );

  console.log(
    `\n[Check] ${duplicates} leftover duplicate nominees found` +
      (delDup
        ? `, ${deleted} deleted.`
        : ". Run with --delete-duplicates to remove the safe ones."),
  );
  console.log(
    fix
      ? `[Check] Repaired ${catFixes} categories and relinked ${relinked} nominees. Refresh the dashboard.`
      : `[Check] Report only. ${catFixes} categories and ${relinked} nominees can be repaired with --fix.`,
  );
  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[Check] Failed:", err);
    process.exit(1);
  });
