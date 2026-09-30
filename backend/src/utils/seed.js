require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Settings = require("../models/Settings");
const Category = require("../models/Category");

// From the Nigeria Gala Fashion Week Award Night nomination categories flyer
const CATEGORIES = [
  "Male Model of the Year",
  "Female Model of the Year",
  "Editorial Model of the Year",
  "Pageant King of the Year",
  "Pageant Queen of the Year",
  "Male Designer of the Year",
  "Female Designer of the Year",
  "Photographer of the Year",
  "Commercial Model of the Year",
  "Brand of the Year",
  "Male Artist of the Year",
  "Female Artist of the Year",
  "Mobile Photographer of the Year",
  "Male Runway Model of the Year",
  "Female Runway Model of the Year",
  "Influencer / Tiktoker of the Year",
  "MUA of the Year",
  "Male Dancer of the Year",
  "Female Dancer of the Year",
  "Clothing Brand of the Year",
  "Hair Brand of the Year",
  "Exchange Brand of the Year",
  "Best Fashion Stylist of the Year",
  "Most Fashionable Model of the Year",
  "Female Vixen of the Year",
  "Red Carpet Host of the Year",
  "Bridal Designer of the Year",
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

  // Ensure a Settings document exists
  await Settings.getSettings();
  console.log("[Seed] Settings document ensured");

  // Seed categories - skips any that already exist by name, so this is
  // safe to run again later without creating duplicates.
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < CATEGORIES.length; i += 1) {
    const name = CATEGORIES[i];
    const alreadyExists = await Category.findOne({ name });

    if (alreadyExists) {
      skipped += 1;
    } else {
      await Category.create({
        name,
        displayOrder: i,
        // No coverImage yet - can be added later from the dashboard.
      });
      created += 1;
    }
  }

  console.log(
    `[Seed] Categories: ${created} created, ${skipped} already existed`,
  );

  await mongoose.disconnect();
  console.log("[Seed] Done");
  process.exit(0);
};

run().catch((err) => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});
