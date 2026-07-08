import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import checkIcon from "../../../assets/icons/action-check.svg";
import filterIcon from "../../../assets/icons/action-filter.svg";
import passIcon from "../../../assets/icons/action-pass.svg";
import PropertyDetailsPopup from "../../../components/propertyDetailsPopup/PropertyDetailsPopup";
import SwipeablePropertyCard from "./SwipeablePropertyCard";
import {
  getRenterFeed,
  markRenterFeedInterest,
  rejectRenterFeedProperty,
} from "../../../services/propertyApi";
import RenterPreferencesPopup from "../../../components/renterPreferencesPopup/RenterPreferencesPopup";
import "./renterMainPage.css";

function isVisibleToRenters(property) {
  return (
    property?.moderationStatus === "approved" &&
    property?.availabilityStatus === "available"
  );
}

function getVisibleMatchedProperties(matches) {
  return matches
    .map((match) =>
      match.property
        ? {
            ...match.property,
            matchScore: match.similarity,
          }
        : null,
    )
    .filter(isVisibleToRenters);
}

function RenterHomePage() {
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [propertiesError, setPropertiesError] = useState("");
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const currentProperty = properties[currentPropertyIndex];
  const hasPropertiesLeft = Boolean(currentProperty);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  async function loadProperties() {
    try {
      setIsLoadingProperties(true);
      setPropertiesError("");
      setActionError("");
      setSelectedProperty(null);

      const matches = await getRenterFeed();
      setProperties(getVisibleMatchedProperties(matches));
      setCurrentPropertyIndex(0);
    } catch (error) {
      setPropertiesError(error.message);
      setProperties([]);
      setCurrentPropertyIndex(0);
    } finally {
      setIsLoadingProperties(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    getRenterFeed()
      .then((matches) => {
        if (!isMounted) return;

        setProperties(getVisibleMatchedProperties(matches));
        setCurrentPropertyIndex(0);
      })
      .catch((error) => {
        if (!isMounted) return;

        setPropertiesError(error.message);
        setProperties([]);
        setCurrentPropertyIndex(0);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProperties(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function goToNextProperty() {
    setCurrentPropertyIndex((index) => index + 1);
  }

  async function saveInterestedProperty() {
    if (!currentProperty || isActionLoading) return;

    try {
      setIsActionLoading(true);
      setActionError("");

      await markRenterFeedInterest(currentProperty._id);
      goToNextProperty();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  async function rejectCurrentProperty() {
    if (!currentProperty || isActionLoading) return;

    try {
      setIsActionLoading(true);
      setActionError("");

      await rejectRenterFeedProperty(currentProperty._id);
      goToNextProperty();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsActionLoading(false);
    }
  }

  return (
    <div className="renter-main-page">
      <Navbar ariaLabel="Renter navigation" />

      <main className="renter-main-content">
        <section className="renter-discovery-panel">
          <button
            className="renter-filter-button"
            type="button"
            onClick={() => setIsPreferencesOpen(true)}
          >
            <img src={filterIcon} className="button-icon" alt="" />
            Filters
          </button>

          {actionError && (
            <p className="renter-action-error" role="alert">
              {actionError}
            </p>
          )}

          {isLoadingProperties ? (
            <div className="renter-no-properties">
              <h2>Loading properties...</h2>
              <p>We’re finding homes that match your preferences.</p>
            </div>
          ) : propertiesError ? (
            <div className="renter-no-properties">
              <h2>Could not load properties</h2>
              <p>{propertiesError}</p>
            </div>
          ) : hasPropertiesLeft ? (
            <>
              <button
                className="renter-action-button reject"
                type="button"
                onClick={rejectCurrentProperty}
                disabled={isActionLoading}
              >
                <span className="renter-action-circle">
                  <img src={passIcon} className="pass-action-icon" alt="" />
                </span>
                <span className="renter-action-label">Pass</span>
              </button>

              <div className="renter-swipe-stack">
                {properties
                  .slice(currentPropertyIndex, currentPropertyIndex + 3)
                  .map((property, index) => (
                    <SwipeablePropertyCard
                      key={property._id}
                      property={property}
                      isFront={index === 0}
                      stackIndex={index}
                      onReject={rejectCurrentProperty}
                      onInterested={saveInterestedProperty}
                      onInfoClick={setSelectedProperty}
                      isActionLoading={isActionLoading}
                    />
                  ))}
              </div>

              <button
                className="renter-action-button interested"
                type="button"
                onClick={saveInterestedProperty}
                disabled={isActionLoading}
              >
                <span className="renter-action-circle">
                  <img
                    src={checkIcon}
                    className="interested-action-icon"
                    alt=""
                  />
                </span>
                <span className="renter-action-label">Interested</span>
              </button>
            </>
          ) : (
            <div className="renter-no-properties">
              <h2>No more properties for now</h2>
              <p>
                Check back later for more homes that match your preferences.
              </p>
            </div>
          )}
        </section>
      </main>

      {selectedProperty && (
        <PropertyDetailsPopup
          key={selectedProperty._id}
          property={selectedProperty}
          mode="view"
          onClose={() => setSelectedProperty(null)}
        />
      )}
      {isPreferencesOpen && (
        <RenterPreferencesPopup
          onClose={() => setIsPreferencesOpen(false)}
          onUpdated={loadProperties}
        />
      )}
    </div>
  );
}

export default RenterHomePage;
