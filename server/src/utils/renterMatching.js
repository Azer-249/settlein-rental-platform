const districtNeighbors = require("./districtNeighbors");

const STRONG_MATCH_THRESHOLD = 65;
const MIN_FEED_SIMILARITY = 60;
const DEFAULT_FEED_LIMIT = 20;
const MAX_FEED_LIMIT = 50;
const REJECTION_COOLDOWN_HOURS = 2;
const BUDGET_POINTS = 30;
const PROPERTY_TYPE_POINTS = 16;
const ROOM_COUNT_POINTS = 16;
const BATHROOM_COUNT_POINTS = 10;
const FURNISHED_POINTS = 18;
const PET_POINTS = 20;
const DEPOSIT_POINTS = 22;

const LOCATION_FEATURES = [
  "nearMetro",
  "nearBusStop",
  "nearMall",
  "nearPark",
  "nearHospital",
  "cityCenter",
];

const HIGH_PRIORITY_FEATURES = [
  "parkingArea",
  "elevator",
  "balcony",
  "privateBathroom",
];

const NORMAL_FEATURES = [
  "wifi",
  "airConditioner",
  "heatingSystem",
  "washingMachine",
  "dryer",
  "dishwasher",
  "kitchenEquipment",
  "refrigerator",
  "microwave",
  "tv",
  "securityCameras",
  "gatedBuilding",
  "garden",
  "terrace",
  "storageRoom",
  "swimmingPool",
  "gymAccess",
];

const normalizeLimit = (limit) => {
  const parsedLimit = Number.parseInt(limit, 10);

  if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    return DEFAULT_FEED_LIMIT;
  }

  return Math.min(parsedLimit, MAX_FEED_LIMIT);
};

const isSet = (value) => value !== undefined && value !== null && value !== "";

const selectedPropertyTypes = (preferences) => {
  const details = preferences.propertyDetails || {};
  return ["apartment", "villa", "duplex"].filter((type) => details[type]);
};

const getRoommatePreferenceRestriction = (preferences) => {
  const livingSituation = preferences.livingSituation || {};
  const wantsFemale = livingSituation.femaleRoommates;
  const wantsMale = livingSituation.maleRoommates;

  if (wantsFemale && !wantsMale) {
    return ["female", "any"];
  }

  if (wantsMale && !wantsFemale) {
    return ["male", "any"];
  }

  return null;
};

const getRentalTypeRestriction = (preferences) => {
  const livingSituation = preferences.livingSituation || {};
  const wantsAlone = livingSituation.livingAlone;
  const wantsShared = livingSituation.sharedApartment;

  if (wantsAlone && !wantsShared) {
    return "entire-property";
  }

  if (wantsShared && !wantsAlone) {
    return "shared-apartment";
  }

  return null;
};

const buildRenterFeedQuery = (preferences, excludedPropertyIds = []) => {
  const query = {
    moderationStatus: "approved",
    availabilityStatus: "available",
    "pricing.currency": "GEL",
  };
  const andConditions = [];

  if (excludedPropertyIds.length > 0) {
    query._id = { $nin: excludedPropertyIds };
  }

  if (preferences.location?.city) {
    query["location.city"] = preferences.location.city;
  }

  if (preferences.lifestyle?.smoker) {
    query["tenantRules.allowsSmoking"] = true;
  }

  const rentalTypeRestriction = getRentalTypeRestriction(preferences);

  if (rentalTypeRestriction) {
    query["livingSituation.rentalType"] = rentalTypeRestriction;
  }

  const roommatePreferenceRestriction =
    getRoommatePreferenceRestriction(preferences);

  if (
    roommatePreferenceRestriction &&
    rentalTypeRestriction !== "entire-property"
  ) {
    if (rentalTypeRestriction === "shared-apartment") {
      query["livingSituation.roommatePreference"] = {
        $in: roommatePreferenceRestriction,
      };
    } else {
      andConditions.push({
        $or: [
          { "livingSituation.rentalType": "entire-property" },
          {
            "livingSituation.rentalType": "shared-apartment",
            "livingSituation.roommatePreference": {
              $in: roommatePreferenceRestriction,
            },
          },
        ],
      });
    }
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  return query;
};

const selectedDistrictMatchType = (property, preferences) => {
  const selectedDistricts = preferences.location?.districts || [];
  const propertyDistrict = property.location?.district;

  if (!propertyDistrict || selectedDistricts.length === 0) {
    return "none";
  }

  if (selectedDistricts.includes(propertyDistrict)) {
    return "exact";
  }

  const cityNeighbors = districtNeighbors[property.location?.city] || {};
  const isNeighbor = selectedDistricts.some((district) =>
    (cityNeighbors[district] || []).includes(propertyDistrict)
  );

  return isNeighbor ? "neighbor" : "unrelated";
};

const scoreBudget = (monthlyRent, budget = {}) => {
  if (!isSet(budget.min) && !isSet(budget.max)) {
    return { earned: 0, possible: 0 };
  }

  const min = isSet(budget.min) ? Number(budget.min) : null;
  const max = isSet(budget.max) ? Number(budget.max) : null;

  if (max === null && (min === null || min <= 0)) {
    return { earned: 0, possible: 0 };
  }

  const possible = BUDGET_POINTS;

  if (max !== null && monthlyRent > max) {
    const overage = monthlyRent - max;
    const overageRatio = max > 0 ? overage / max : 1;
    const earned = Math.max(0, possible - 8 - overageRatio * 150);

    return { earned, possible };
  }

  if (min !== null && monthlyRent < min) {
    return { earned: possible * 0.8, possible };
  }

  return { earned: possible, possible };
};

const addScore = (score, selected, matches, points) => {
  if (!selected) {
    return;
  }

  score.possible += points;

  if (matches) {
    score.earned += points;
  }
};

const countMatchesSelection = (selectedCounts = [], count) => {
  if (!isSet(count) || selectedCounts.length === 0) {
    return false;
  }

  if (selectedCounts.includes(6) && count >= 6) {
    return true;
  }

  return selectedCounts.includes(count);
};

const selectedCountDistance = (selectedCount, count) => {
  if (selectedCount === 6 && count >= 6) {
    return 0;
  }

  return Math.abs(selectedCount - count);
};

const scoreSelectedCount = (selectedCounts = [], count, points) => {
  if (selectedCounts.length === 0) {
    return { earned: 0, possible: 0 };
  }

  if (!isSet(count)) {
    return { earned: 0, possible: points };
  }

  if (countMatchesSelection(selectedCounts, count)) {
    return { earned: points, possible: points };
  }

  const nearestDistance = Math.min(
    ...selectedCounts.map((selectedCount) =>
      selectedCountDistance(selectedCount, count)
    )
  );

  if (nearestDistance === 1) {
    return { earned: points * 0.67, possible: points };
  }

  if (nearestDistance === 2) {
    return { earned: points * 0.33, possible: points };
  }

  return { earned: 0, possible: points };
};

const scorePropertyType = (propertyType, preferences) => {
  const propertyTypes = selectedPropertyTypes(preferences);

  if (propertyTypes.length === 0) {
    return { earned: 0, possible: 0 };
  }

  return {
    earned: propertyTypes.includes(propertyType) ? PROPERTY_TYPE_POINTS : 3,
    possible: PROPERTY_TYPE_POINTS,
  };
};

const scorePropertyForRenter = (property, preferences) => {
  const score = {
    earned: 0,
    possible: 0,
  };

  const districtMatchType = selectedDistrictMatchType(property, preferences);

  if ((preferences.location?.districts || []).length > 0) {
    score.possible += 18;

    if (districtMatchType === "exact") {
      score.earned += 18;
    } else if (districtMatchType === "neighbor") {
      score.earned += 12;
    }
  }

  for (const feature of LOCATION_FEATURES) {
    addScore(
      score,
      preferences.location?.[feature],
      property.location?.[feature],
      5
    );
  }

  const budgetScore = scoreBudget(
    property.pricing?.monthlyRent,
    preferences.budget
  );
  score.earned += budgetScore.earned;
  score.possible += budgetScore.possible;

  const propertyTypeScore = scorePropertyType(
    property.propertyDetails?.propertyType,
    preferences
  );
  score.earned += propertyTypeScore.earned;
  score.possible += propertyTypeScore.possible;

  const roomCountScore = scoreSelectedCount(
    preferences.propertyDetails?.roomCount || [],
    property.propertyDetails?.roomCount,
    ROOM_COUNT_POINTS
  );
  score.earned += roomCountScore.earned;
  score.possible += roomCountScore.possible;

  const bathroomCountScore = scoreSelectedCount(
    preferences.propertyDetails?.bathroomCount || [],
    property.propertyDetails?.bathroomCount,
    BATHROOM_COUNT_POINTS
  );
  score.earned += bathroomCountScore.earned;
  score.possible += bathroomCountScore.possible;

  addScore(
    score,
    preferences.propertyDetails?.furnished,
    property.propertyDetails?.furnished,
    FURNISHED_POINTS
  );

  const minArea = preferences.propertyDetails?.minArea;
  const maxArea = preferences.propertyDetails?.maxArea;

  if (isSet(minArea) || isSet(maxArea)) {
    score.possible += 10;

    const area = property.propertyDetails?.area;
    const aboveMin = !isSet(minArea) || area >= Number(minArea);
    const belowMax = !isSet(maxArea) || area <= Number(maxArea);

    if (aboveMin && belowMax) {
      score.earned += 10;
    }
  }

  const floor = property.propertyDetails?.floor;
  const totalFloors = property.propertyDetails?.totalFloors;

  addScore(
    score,
    preferences.propertyDetails?.firstFloor,
    isSet(floor) && Number(floor) <= 1,
    4
  );
  addScore(
    score,
    preferences.propertyDetails?.lastFloor,
    isSet(floor) && isSet(totalFloors) && Number(floor) === Number(totalFloors),
    4
  );
  addScore(
    score,
    preferences.propertyDetails?.newBuilding,
    property.propertyDetails?.newBuilding,
    4
  );

  addScore(
    score,
    preferences.budget?.withoutDeposit,
    !property.pricing?.depositRequired,
    DEPOSIT_POINTS
  );

  addScore(
    score,
    preferences.lifestyle?.petOwner,
    property.tenantRules?.acceptsPets,
    PET_POINTS
  );
  addScore(
    score,
    preferences.lifestyle?.studentFriendly,
    property.tenantRules?.acceptsStudents,
    8
  );
  addScore(
    score,
    preferences.lifestyle?.familyFriendly,
    property.tenantRules?.acceptsFamilies,
    8
  );
  addScore(
    score,
    preferences.lifestyle?.quietLifestyle,
    property.tenantRules?.quietLifestyle,
    5
  );
  addScore(
    score,
    preferences.lifestyle?.nightlifeFriendly,
    property.tenantRules?.nightlifeFriendly,
    5
  );

  addScore(
    score,
    preferences.livingSituation?.longTermStay,
    property.tenantRules?.allowsLongTerm,
    7
  );
  addScore(
    score,
    preferences.livingSituation?.shortTermStay,
    property.tenantRules?.allowsShortTerm,
    7
  );

  for (const feature of HIGH_PRIORITY_FEATURES) {
    addScore(
      score,
      preferences.features?.[feature],
      property.features?.[feature],
      5
    );
  }

  for (const feature of NORMAL_FEATURES) {
    addScore(
      score,
      preferences.features?.[feature],
      property.features?.[feature],
      3
    );
  }

  if (score.possible === 0) {
    return 100;
  }

  return Math.round((score.earned / score.possible) * 100);
};

const orderMatchesByThreshold = (matches) => {
  const sortedMatches = [...matches].sort((a, b) => b.similarity - a.similarity);
  const strongMatches = sortedMatches.filter(
    (match) => match.similarity >= STRONG_MATCH_THRESHOLD
  );
  const fallbackMatches = sortedMatches.filter(
    (match) => match.similarity < STRONG_MATCH_THRESHOLD
  );

  return [...strongMatches, ...fallbackMatches];
};

module.exports = {
  DEFAULT_FEED_LIMIT,
  MIN_FEED_SIMILARITY,
  MAX_FEED_LIMIT,
  REJECTION_COOLDOWN_HOURS,
  STRONG_MATCH_THRESHOLD,
  buildRenterFeedQuery,
  normalizeLimit,
  orderMatchesByThreshold,
  scorePropertyForRenter,
};
