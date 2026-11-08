/**
 * Removes the "Dancer of the Year" category and its nominees (including leftover copies with a
 * missing category), so you can run the seeds again and get a clean start.
 *
 *   node src/utils/resetDancers.js          -> shows what it WOULD delete (changes nothing)
 *   node src/utils/resetDancers.js --yes    -> deletes them
 *
 * It refuses to delete anything if one of these nominees has votes or payments, so no real
 * votes or money records are ever lost.
 * Put it in the same folder as seed.js and seedContestants.js.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Contestant = require("../models/Contestant");
const Transaction = require("../models/Transaction");
const { NOMINEES, tidyName } = require("./seedContestants");

const CATEGORY = "Dancer of the Year";

const run = async () => {
  const yes = process.argv.includes("--yes");
  await mongoose.connect(process.env.MONGO_URI);
  console.log(
    "[Reset] Connected to",
    mongoose.connection.host,
    "/",
    mongoose.connection.name,
  );

  const cat = await Category.collection.findOne({ name: CATEGORY });
  console.log(
    cat
      ? `[Reset] Category found: "${CATEGORY}"`
      : `[Reset] Category "${CATEGORY}" does not exist (nothing to delete there).`,
  );

  const allCats = await Category.collection
    .find({}, { projection: { _id: 1 } })
    .toArray();
  const validIds = new Set(allCats.map((c) => String(c._id)));
  const names = new Set(
    (NOMINEES[CATEGORY] || []).flatMap((n) => [n, tidyName(n)]),
  );

  const all = await Contestant.collection.find({}).toArray();
  const targets = all.filter((k) => {
    const inCategory = cat && String(k.category) === String(cat._id);
    const orphanCopy =
      !(k.category && validIds.has(String(k.category))) && names.has(k.name);
    return inCategory || orphanCopy;
  });

  console.log(`\n[Reset] Nominees that will be removed (${targets.length}):`);
  targets.forEach((k) =>
    console.log(`  - ${k.name}  (votes: ${k.voteCount || 0})`),
  );

  const ids = targets.map((k) => k._id);
  const withVotes = targets.filter((k) => (k.voteCount || 0) > 0);
  const payments = ids.length
    ? await Transaction.collection.countDocuments({ contestant: { $in: ids } })
    : 0;

  if (withVotes.length || payments) {
    console.error(
      `\n[Reset] STOPPED. ${withVotes.length} of them have votes and ${payments} payment record(s) point to them. Nothing was deleted.`,
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (!yes) {
    console.log("\n[Reset] Report only. Run again with --yes to delete them.");
    await mongoose.disconnect();
    return;
  }

  const delC = ids.length
    ? await Contestant.collection.deleteMany({ _id: { $in: ids } })
    : { deletedCount: 0 };
  const delCat = cat
    ? await Category.collection.deleteOne({ _id: cat._id })
    : { deletedCount: 0 };
  console.log(
    `\n[Reset] Deleted ${delC.deletedCount} nominees and ${delCat.deletedCount} category.`,
  );
  console.log(
    "[Reset] Now run:  npm run seed   then   node src/utils/seedContestants.js",
  );
  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[Reset] Failed:", err);
    process.exit(1);
  });
