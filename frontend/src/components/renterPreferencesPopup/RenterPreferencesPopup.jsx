import { useEffect, useState } from "react";
import {
  getMyRenterPreferences,
  updateMyRenterPreferences,
} from "../../services/onboardingApi";
import RenterPreferencesForm from "../../pages/survey/renter/RenterPreferenceForm";
import "./RenterPreferencesPopup.css";

function normalizePreferences(preferences) {
  return {
    location: {
      city: preferences?.location?.city || "",
      districts: preferences?.location?.districts || [],
      nearMetro: Boolean(preferences?.location?.nearMetro),
      nearBusStop: Boolean(preferences?.location?.nearBusStop),
      nearMall: Boolean(preferences?.location?.nearMall),
      nearPark: Boolean(preferences?.location?.nearPark),
      nearHospital: Boolean(preferences?.location?.nearHospital),
      cityCenter: Boolean(preferences?.location?.cityCenter),
    },

    budget: {
      min: preferences?.budget?.min ?? "",
      max: preferences?.budget?.max ?? "",
      withoutDeposit: Boolean(preferences?.budget?.withoutDeposit),
    },

    propertyDetails: {
      roomCount: preferences?.propertyDetails?.roomCount || [],
      bathroomCount: preferences?.propertyDetails?.bathroomCount || [],
      minArea: preferences?.propertyDetails?.minArea ?? "",
      maxArea: preferences?.propertyDetails?.maxArea ?? "",
      apartment: Boolean(preferences?.propertyDetails?.apartment),
      duplex: Boolean(preferences?.propertyDetails?.duplex),
      villa: Boolean(preferences?.propertyDetails?.villa),
      firstFloor: Boolean(preferences?.propertyDetails?.firstFloor),
      lastFloor: Boolean(preferences?.propertyDetails?.lastFloor),
      furnished: Boolean(preferences?.propertyDetails?.furnished),
      newBuilding: Boolean(preferences?.propertyDetails?.newBuilding),
    },

    lifestyle: {
      smoker: Boolean(preferences?.lifestyle?.smoker),
      petOwner: Boolean(preferences?.lifestyle?.petOwner),
      nightlifeFriendly: Boolean(preferences?.lifestyle?.nightlifeFriendly),
      quietLifestyle: Boolean(preferences?.lifestyle?.quietLifestyle),
      studentFriendly: Boolean(preferences?.lifestyle?.studentFriendly),
      familyFriendly: Boolean(preferences?.lifestyle?.familyFriendly),
    },

    livingSituation: {
      livingAlone: Boolean(preferences?.livingSituation?.livingAlone),
      family: Boolean(preferences?.livingSituation?.family),
      sharedApartment: Boolean(preferences?.livingSituation?.sharedApartment),
      femaleRoommates: Boolean(preferences?.livingSituation?.femaleRoommates),
      maleRoommates: Boolean(preferences?.livingSituation?.maleRoommates),
      longTermStay: Boolean(preferences?.livingSituation?.longTermStay),
      shortTermStay: Boolean(preferences?.livingSituation?.shortTermStay),
    },

    features: {
      wifi: Boolean(preferences?.features?.wifi),
      balcony: Boolean(preferences?.features?.balcony),
      parkingArea: Boolean(preferences?.features?.parkingArea),
      elevator: Boolean(preferences?.features?.elevator),
      airConditioner: Boolean(preferences?.features?.airConditioner),
      heatingSystem: Boolean(preferences?.features?.heatingSystem),
      washingMachine: Boolean(preferences?.features?.washingMachine),
      dryer: Boolean(preferences?.features?.dryer),
      dishwasher: Boolean(preferences?.features?.dishwasher),
      kitchenEquipment: Boolean(preferences?.features?.kitchenEquipment),
      refrigerator: Boolean(preferences?.features?.refrigerator),
      microwave: Boolean(preferences?.features?.microwave),
      tv: Boolean(preferences?.features?.tv),
      privateBathroom: Boolean(preferences?.features?.privateBathroom),
      securityCameras: Boolean(preferences?.features?.securityCameras),
      gatedBuilding: Boolean(preferences?.features?.gatedBuilding),
      garden: Boolean(preferences?.features?.garden),
      terrace: Boolean(preferences?.features?.terrace),
      storageRoom: Boolean(preferences?.features?.storageRoom),
      swimmingPool: Boolean(preferences?.features?.swimmingPool),
      gymAccess: Boolean(preferences?.features?.gymAccess),
    },
  };
}

function optionalNumber(value) {
  return value === "" ? undefined : Number(value);
}

function cleanPreferencesPayload(formData) {
  return {
    ...formData,
    budget: {
      ...formData.budget,
      min: optionalNumber(formData.budget.min),
      max: optionalNumber(formData.budget.max),
    },
    propertyDetails: {
      ...formData.propertyDetails,
      minArea: optionalNumber(formData.propertyDetails.minArea),
      maxArea: optionalNumber(formData.propertyDetails.maxArea),
    },
  };
}

function RenterPreferencesPopup({ onClose, onUpdated }) {
  const [initialValues, setInitialValues] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadPreferences() {
      try {
        setIsLoading(true);
        setError("");

        const preferences = await getMyRenterPreferences();
        setInitialValues(normalizePreferences(preferences));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, []);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  async function handleSubmit(formData) {
    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const payload = cleanPreferencesPayload(formData);
      const updatedPreferences = await updateMyRenterPreferences(payload);

      setSuccess("Preferences updated successfully.");
      onUpdated?.(updatedPreferences);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="renter-preferences-backdrop"
      onMouseDown={handleBackdropClick}
    >
      <section className="renter-preferences-popup">
        <button
          type="button"
          className="renter-preferences-close"
          onClick={onClose}
          aria-label="Close preferences"
        >
          ×
        </button>

        <div className="renter-preferences-header">
          <p>Filters</p>
          <h2>Update your renter preferences</h2>
          <span>Change what kind of homes you want to see.</span>
        </div>

        {isLoading ? (
          <div className="renter-preferences-loading">
            Loading preferences...
          </div>
        ) : initialValues ? (
          <RenterPreferencesForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel={isSubmitting ? "Saving..." : "Save preferences"}
            isSubmitting={isSubmitting}
            error={error}
            success={success}
          />
        ) : (
          <p role="alert">{error || "Could not load preferences."}</p>
        )}
      </section>
    </div>
  );
}

export default RenterPreferencesPopup;
