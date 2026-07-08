const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const OwnerProfile = require("../models/OwnerProfile");
const RenterPreference = require("../models/RenterPreference");
const User = require("../models/User");

dotenv.config();

const migrateOnboardingFlags = async () => {
  try {
    await connectDB();

    const renters = await User.collection.updateMany(
      { role: "renter", onboardingCompleted: true },
      { $set: { renterOnboardingCompleted: true } }
    );
    const owners = await User.collection.updateMany(
      { role: "owner", onboardingCompleted: true },
      { $set: { ownerOnboardingCompleted: true } }
    );
    const [renterPreferenceUserIds, ownerProfileUserIds] = await Promise.all([
      RenterPreference.distinct("user"),
      OwnerProfile.distinct("user"),
    ]);
    const rentersFromPreferences = await User.collection.updateMany(
      { _id: { $in: renterPreferenceUserIds } },
      { $set: { renterOnboardingCompleted: true } }
    );
    const ownersFromProfiles = await User.collection.updateMany(
      { _id: { $in: ownerProfileUserIds } },
      { $set: { ownerOnboardingCompleted: true } }
    );
    const cleanup = await User.collection.updateMany(
      { onboardingCompleted: { $exists: true } },
      { $unset: { onboardingCompleted: "" } }
    );

    console.log(
      `Migrated ${renters.modifiedCount} legacy renter flag(s), ${owners.modifiedCount} legacy owner flag(s), ${rentersFromPreferences.modifiedCount} renter preference user(s), and ${ownersFromProfiles.modifiedCount} owner profile user(s); removed the legacy field from ${cleanup.modifiedCount} user(s).`
    );
  } catch (error) {
    console.error("Onboarding flag migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

migrateOnboardingFlags();
