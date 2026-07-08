import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitOnboarding } from "../../../services/onboardingApi";
import RenterPreferencesForm from "./RenterPreferenceForm";

const emptyRenterPreferences = {
  location: {
    city: "",
    districts: [],
    nearMetro: false,
    nearBusStop: false,
    nearMall: false,
    nearPark: false,
    nearHospital: false,
    cityCenter: false,
  },

  budget: {
    min: "",
    max: "",
    withoutDeposit: false,
  },

  propertyDetails: {
    roomCount: [],
    bathroomCount: [],
    minArea: "",
    maxArea: "",
    apartment: false,
    duplex: false,
    villa: false,
    firstFloor: false,
    lastFloor: false,
    furnished: false,
    newBuilding: false,
  },

  lifestyle: {
    smoker: false,
    petOwner: false,
    nightlifeFriendly: false,
    quietLifestyle: false,
    studentFriendly: false,
    familyFriendly: false,
  },

  livingSituation: {
    livingAlone: false,
    family: false,
    sharedApartment: false,
    femaleRoommates: false,
    maleRoommates: false,
    longTermStay: false,
    shortTermStay: false,
  },

  features: {
    wifi: false,
    balcony: false,
    parkingArea: false,
    elevator: false,
    airConditioner: false,
    heatingSystem: false,
    washingMachine: false,
    dryer: false,
    dishwasher: false,
    kitchenEquipment: false,
    refrigerator: false,
    microwave: false,
    tv: false,
    privateBathroom: false,
    securityCameras: false,
    gatedBuilding: false,
    garden: false,
    terrace: false,
    storageRoom: false,
    swimmingPool: false,
    gymAccess: false,
  },
};

function RenterSurvey() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const optionalNumber = (value) => (value === "" ? undefined : Number(value));

  async function handleSurveySubmit(formData) {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const payload = {
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

    try {
      const result = await submitOnboarding("renter", payload);
      setSuccess("Your renter preferences were saved successfully.");

      if (result.user?.renterOnboardingCompleted) {
        navigate("/renter", { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <RenterPreferencesForm
      initialValues={emptyRenterPreferences}
      onSubmit={handleSurveySubmit}
      submitLabel={isSubmitting ? "Submitting..." : "Submit survey"}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
    />
  );
}

export default RenterSurvey;
