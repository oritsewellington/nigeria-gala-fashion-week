require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Settings = require("../models/Settings");
const Category = require("../models/Category");

const CATEGORIES = [
  "Male Model of the Year",
  "Female Model of the Year",
  "Pageant King of the Year",
  "Pageant Queen of the Year",
  "Artist of the Year",
  "Male Runway Model of the Year",
  "Female Runway Model of the Year",
  "Influencer / Tiktoker of the Year",
  "Male Dancer of the Year",
  "Female Dancer of the Year",
  "Commercial Model of the Year",
  "Photographer of the Year",
  "Brand of the Year",
  "MUA of the Year",
  "Mobile Photographer of the Year",
  "Male Designer of the Year",
  "Female Designer of the Year",
  "Clothing Brand of the Year",
];

const HOSTS = [
  {
    name: process.env.HOST1_NAME || "Event Host 1",
    email: (process.env.HOST1_EMAIL || "host1@gmail.com").toLowerCase(),
    password: process.env.HOST1_PASSWORD || "ngfwhost001",
  },
  {
    name: process.env.HOST2_NAME || "Event Host 2",
    email: (process.env.HOST2_EMAIL || "host2@gmail.com").toLowerCase(),
    password: process.env.HOST2_PASSWORD || "ngfwhost002",
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[Seed] Connected to MongoDB");

  const email = (
    process.env.SUPERADMIN_EMAIL || "admin@example.com"
  ).toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`[Seed] Super admin already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.SUPERADMIN_NAME || "Super Admin",
      email,
      password: process.env.SUPERADMIN_PASSWORD || "ChangeMe123!",
      role: "superadmin",
    });
    console.log(`[Seed] Super admin created: ${email}`);
  }

  for (const host of HOSTS) {
    const existingHost = await User.findOne({ email: host.email });

    if (existingHost) {
      console.log(`[Seed] Host already exists: ${host.email}`);
    } else {
      await User.create({
        name: host.name,
        email: host.email,
        password: host.password,
        role: "host",
      });
      console.log(`[Seed] Host created: ${host.email}`);
    }
  }

  await Settings.getSettings();
  console.log("[Seed] Settings document ensured");

  const removed = await Category.deleteMany({ name: { $nin: CATEGORIES } });
  console.log(`[Seed] Categories removed: ${removed.deletedCount}`);

  const result = await Category.bulkWrite(
    CATEGORIES.map((name, i) => ({
      updateOne: {
        filter: { name },
        update: { $set: { displayOrder: i }, $setOnInsert: { name } },
        upsert: true,
      },
    })),
  );

  console.log(
    `[Seed] Categories: ${result.upsertedCount} created, ${result.matchedCount} already existed (order refreshed)`,
  );
  await mongoose.disconnect();
  console.log("[Seed] Done");
  process.exit(0);
};

run().catch((err) => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});
