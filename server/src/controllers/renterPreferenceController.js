const RenterPreference = require("../models/RenterPreference");
const User = require("../models/User");

const editablePreferenceFields = {
  location: [
    "city",
    "districts",
    "nearMall",
    "nearPark",
    "nearMetro",
    "nearHospital",
    "nearBusStop",
    "cityCenter",
  ],
  budget: ["min", "max", "withoutDeposit"],
  propertyDetails: [
    "roomCount",
    "bathroomCount",
    "minArea",
    "maxArea",
    "firstFloor",
    "lastFloor",
    "furnished",
    "newBuilding",
    "villa",
    "duplex",
    "apartment",
  ],
  lifestyle: [
    "smoker",
    "petOwner",
    "nightlifeFriendly",
    "quietLifestyle",
    "studentFriendly",
    "familyFriendly",
  ],
  livingSituation: [
    "livingAlone",
    "family",
    "sharedApartment",
    "femaleRoommates",
    "maleRoommates",
    "longTermStay",
    "shortTermStay",
  ],
  features: [
    "wifi",
    "balcony",
    "parkingArea",
    "elevator",
    "airConditioner",
    "heatingSystem",
    "washingMachine",
    "dryer",
    "dishwasher",
    "kitchenEquipment",
    "refrigerator",
    "microwave",
    "tv",
    "privateBathroom",
    "securityCameras",
    "gatedBuilding",
    "garden",
    "terrace",
    "storageRoom",
    "swimmingPool",
    "gymAccess",
  ],
};

const arrayPreferenceFields = {
  location: ["districts"],
  propertyDetails: ["roomCount", "bathroomCount"],
};

const getArrayFieldValidationMessage = (body) => {
  for (const [section, fields] of Object.entries(arrayPreferenceFields)) {
    const sectionUpdate = body[section];

    if (!sectionUpdate || typeof sectionUpdate !== "object") {
      continue;
    }

    for (const field of fields) {
      if (
        Object.prototype.hasOwnProperty.call(sectionUpdate, field) &&
        !Array.isArray(sectionUpdate[field])
      ) {
        return `${section}.${field} must be an array`;
      }
    }
  }

  return null;
};

const hasOwn = (object, field) =>
  Object.prototype.hasOwnProperty.call(object, field);

const isSet = (value) => value !== undefined && value !== null && value !== "";

const getNextNumberValue = (update, current, field) => {
  if (update && hasOwn(update, field)) {
    return update[field];
  }

  return current?.[field];
};

const getRangeFieldValidationMessage = (body, existingPreferences = null) => {
  const budgetUpdate = body.budget;
  const currentBudget = existingPreferences?.budget;
  const budgetMin = getNextNumberValue(budgetUpdate, currentBudget, "min");
  const budgetMax = getNextNumberValue(budgetUpdate, currentBudget, "max");

  if (
    isSet(budgetMin) &&
    isSet(budgetMax) &&
    Number(budgetMax) < Number(budgetMin)
  ) {
    return "budget.max cannot be lower than budget.min";
  }

  const propertyDetailsUpdate = body.propertyDetails;
  const currentPropertyDetails = existingPreferences?.propertyDetails;
  const minArea = getNextNumberValue(
    propertyDetailsUpdate,
    currentPropertyDetails,
    "minArea"
  );
  const maxArea = getNextNumberValue(
    propertyDetailsUpdate,
    currentPropertyDetails,
    "maxArea"
  );

  if (isSet(minArea) && isSet(maxArea) && Number(maxArea) < Number(minArea)) {
    return "propertyDetails.maxArea cannot be lower than propertyDetails.minArea";
  }

  return null;
};

const createRenterPreferences = async (req, res) => {
  try {
    const existingPreferences = await RenterPreference.findOne({
      user: req.user._id,
    });

    if (existingPreferences) {
      if (!req.user.renterOnboardingCompleted || req.user.role !== "renter") {
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          {
            role: "renter",
            renterOnboardingCompleted: true,
          },
          { runValidators: true, returnDocument: "after" }
        );

        return res.status(200).json({
          success: true,
          message: "Renter preferences already exist; renter role activated",
          data: {
            preferences: existingPreferences,
            user: {
              role: updatedUser.role,
              renterOnboardingCompleted:
                updatedUser.renterOnboardingCompleted,
              ownerOnboardingCompleted: updatedUser.ownerOnboardingCompleted,
            },
          },
        });
      }

      return res.status(409).json({
        success: false,
        message: "Renter preferences already exist for this user",
      });
    }

    const arrayValidationMessage = getArrayFieldValidationMessage(req.body);

    if (arrayValidationMessage) {
      return res.status(400).json({
        success: false,
        message: arrayValidationMessage,
      });
    }

    const rangeValidationMessage = getRangeFieldValidationMessage(req.body);

    if (rangeValidationMessage) {
      return res.status(400).json({
        success: false,
        message: rangeValidationMessage,
      });
    }

    const preferences = await RenterPreference.create({
      ...req.body,
      user: req.user._id,
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        role: "renter",
        renterOnboardingCompleted: true,
      },
      { runValidators: true, returnDocument: "after" }
    );

    res.status(201).json({
      success: true,
      message: "Renter preferences created successfully",
      data: {
        preferences,
        user: {
          role: updatedUser.role,
          renterOnboardingCompleted: updatedUser.renterOnboardingCompleted,
          ownerOnboardingCompleted: updatedUser.ownerOnboardingCompleted,
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Renter preferences already exist for this user",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyRenterPreferences = async (req, res) => {
  try {
    const preferences = await RenterPreference.findOne({
      user: req.user._id,
    });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: "Renter preferences not found",
      });
    }

    res.json({
      success: true,
      data: {
        preferences,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMyRenterPreferences = async (req, res) => {
  try {
    const preferences = await RenterPreference.findOne({
      user: req.user._id,
    });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: "Renter preferences not found",
      });
    }

    const arrayValidationMessage = getArrayFieldValidationMessage(req.body);

    if (arrayValidationMessage) {
      return res.status(400).json({
        success: false,
        message: arrayValidationMessage,
      });
    }

    const rangeValidationMessage = getRangeFieldValidationMessage(
      req.body,
      preferences
    );

    if (rangeValidationMessage) {
      return res.status(400).json({
        success: false,
        message: rangeValidationMessage,
      });
    }

    let preferencesWereUpdated = false;

    for (const [section, fields] of Object.entries(editablePreferenceFields)) {
      const sectionUpdate = req.body[section];

      if (
        !sectionUpdate ||
        typeof sectionUpdate !== "object" ||
        Array.isArray(sectionUpdate)
      ) {
        continue;
      }

      for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(sectionUpdate, field)) {
          preferences.set(`${section}.${field}`, sectionUpdate[field]);
          preferencesWereUpdated = true;
        }
      }
    }

    if (!preferencesWereUpdated) {
      return res.status(400).json({
        success: false,
        message: "No valid renter preference fields were provided",
      });
    }

    await preferences.save();

    res.json({
      success: true,
      message: "Renter preferences updated successfully",
      data: {
        preferences,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRenterPreferences,
  getMyRenterPreferences,
  updateMyRenterPreferences,
};
