import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import DashboardCard from "../../../components/dashboardCard/DashboardCard";
import renterIllustration from "../../../assets/rentermain-illustration.png";
import houseIcon from "../../../assets/icons/property-house.svg";
import PropertyDetailsPopup from "../../../components/propertyDetailsPopup/PropertyDetailsPopup";
import { getMyRenterInterests } from "../../../services/propertyApi";
import "./renterAcceptedPage.css";

const interestStatusLabels = {
  pending: "Waiting for owner",
  approved: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const interestStatusDescriptions = {
  pending: "The owner has not answered yet",
  approved: "The owner accepted your interest",
  rejected: "The owner rejected your interest",
  withdrawn: "You withdrew your interest",
};

function getInterestStatusLabel(interest) {
  if (interest.property?.availabilityStatus !== "available") {
    return "Unavailable";
  }

  return interestStatusLabels[interest.status] || interest.status;
}

function getInterestStatusDescription(interest) {
  if (interest.property?.availabilityStatus !== "available") {
    return "The owner paused this property";
  }

  return interestStatusDescriptions[interest.status] || "Interest status";
}

function getInterestStatusClassName(interest) {
  if (interest.property?.availabilityStatus !== "available") {
    return "interest-unavailable";
  }

  return `interest-${interest.status}`;
}

function RenterAcceptedPage() {
  const [interests, setInterests] = useState([]);
  const [isLoadingInterests, setIsLoadingInterests] = useState(true);
  const [interestsError, setInterestsError] = useState("");
  const [selectedInterest, setSelectedInterest] = useState(null);

  useEffect(() => {
    async function loadInterests() {
      try {
        setIsLoadingInterests(true);
        setInterestsError("");

        const renterInterests = await getMyRenterInterests();
        setInterests(renterInterests);
      } catch (error) {
        setInterestsError(error.message);
      } finally {
        setIsLoadingInterests(false);
      }
    }

    loadInterests();
  }, []);

  return (
    <div className="renter-page">
      <Navbar ariaLabel="Renter navigation" />

      <main className="renter-main">
        <div className="renter-hero-wrap">
          <section className="renter-hero">
            <div className="renter-hero-text">
              <p>Renter dashboard</p>
              <h1>Your future home, in a cozy place</h1>
              <span>
                Keep track of homes you liked and come back to compare them
                whenever you need.
              </span>
            </div>

            <div className="renter-hero-art">
              <img src={renterIllustration} alt="" />
            </div>
          </section>
        </div>

        <section className="renter-properties-board">
          <div className="renter-board-tab">
            <img
              src={houseIcon}
              className="dashboard-tab-icon tab-house-icon"
              alt=""
            />
            <span>Interested Houses</span>
          </div>

          {isLoadingInterests ? (
            <div className="renter-empty-state">
              <h2>Loading interested houses...</h2>
              <p>We’re getting your saved homes ready.</p>
            </div>
          ) : interestsError ? (
            <div className="renter-empty-state">
              <h2>Could not load interested houses</h2>
              <p>{interestsError}</p>
            </div>
          ) : interests.length > 0 ? (
            <div className="renter-properties-grid">
              {interests.map((interest) => (
                <div key={interest._id} className="renter-interest-card-wrap">
                  <DashboardCard
                    property={interest.property}
                    onClick={() => setSelectedInterest(interest)}
                    statusLabel={getInterestStatusLabel(interest)}
                    statusDescription={getInterestStatusDescription(interest)}
                    statusClassName={getInterestStatusClassName(interest)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="renter-empty-state">
              <h2>No interested houses yet</h2>
              <p>Homes you save from the renter page will appear here.</p>
            </div>
          )}
        </section>
      </main>
      {selectedInterest && (
        <PropertyDetailsPopup
          key={selectedInterest.property?._id}
          property={selectedInterest.property}
          interest={selectedInterest}
          mode="renter-interest"
          onClose={() => setSelectedInterest(null)}
          onInterestWithdrawn={(interestId) => {
            setInterests((currentInterests) =>
              currentInterests.filter((interest) => interest._id !== interestId),
            );
            setSelectedInterest(null);
          }}
        />
      )}
    </div>
  );
}

export default RenterAcceptedPage;
