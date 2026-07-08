import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import DashboardCard from "../../components/dashboardCard/DashboardCard";
import PropertyDetailsPopup from "../../components/propertyDetailsPopup/PropertyDetailsPopup";
import houseIcon from "../../assets/icons/property-house.svg";
import {
  approveModerationProperty,
  getPendingModerationProperties,
  rejectModerationProperty,
} from "../../services/propertyApi";
import "./ModeratorMainPage.css";

function ModeratorMainPage() {
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [propertiesError, setPropertiesError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [moderationError, setModerationError] = useState("");
  const [isModerationLoading, setIsModerationLoading] = useState(false);
  const [propertyToReject, setPropertyToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    async function loadPendingProperties() {
      try {
        setIsLoadingProperties(true);
        setPropertiesError("");

        const pendingProperties = await getPendingModerationProperties();
        setProperties(pendingProperties);
      } catch (error) {
        setPropertiesError(error.message);
      } finally {
        setIsLoadingProperties(false);
      }
    }

    loadPendingProperties();
  }, []);

  async function approveProperty(property) {
    if (!property?._id || isModerationLoading) return;

    try {
      setIsModerationLoading(true);
      setModerationError("");

      await approveModerationProperty(property._id);

      setProperties((currentProperties) =>
        currentProperties.filter(
          (currentProperty) => currentProperty._id !== property._id,
        ),
      );
      setSelectedProperty(null);
    } catch (error) {
      setModerationError(error.message);
    } finally {
      setIsModerationLoading(false);
    }
  }

  async function rejectProperty() {
    if (!propertyToReject?._id || isModerationLoading) return;

    if (!rejectionReason.trim()) {
      setModerationError("Please write a rejection reason first.");
      return;
    }

    try {
      setIsModerationLoading(true);
      setModerationError("");

      await rejectModerationProperty(propertyToReject._id, rejectionReason);

      setProperties((currentProperties) =>
        currentProperties.filter(
          (currentProperty) => currentProperty._id !== propertyToReject._id,
        ),
      );
      setSelectedProperty(null);
      setPropertyToReject(null);
      setRejectionReason("");
    } catch (error) {
      setModerationError(error.message);
    } finally {
      setIsModerationLoading(false);
    }
  }

  return (
    <div className="moderator-page">
      <Navbar ariaLabel="Moderator navigation" />

      <main className="moderator-main">
        <div className="moderator-hero-wrap">
          <section className="moderator-hero">
            <div className="moderator-hero-text">
              <p>Moderator dashboard</p>
              <h1>Approve Homes to Go Live</h1>
            </div>
          </section>
        </div>

        <section className="moderator-properties-board">
          <div className="moderator-board-tab">
            <img
              src={houseIcon}
              className="dashboard-tab-icon tab-house-icon"
              alt=""
            />
            <span>Pending Reviews</span>
          </div>

          {isLoadingProperties ? (
            <div className="moderator-empty-state">
              <h2>Loading pending properties...</h2>
              <p>We're getting the review queue ready.</p>
            </div>
          ) : propertiesError ? (
            <div className="moderator-empty-state">
              <h2>Could not load properties</h2>
              <p>{propertiesError}</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="moderator-properties-grid">
              {properties.map((property) => (
                <DashboardCard
                  key={property._id}
                  property={property}
                  onClick={setSelectedProperty}
                />
              ))}
            </div>
          ) : (
            <div className="moderator-empty-state">
              <h2>No pending properties</h2>
              <p>Everything is reviewed for now.</p>
            </div>
          )}
        </section>
      </main>

      {selectedProperty && (
        <PropertyDetailsPopup
          key={selectedProperty._id}
          property={selectedProperty}
          mode="moderator"
          onClose={() => setSelectedProperty(null)}
          onApproveProperty={approveProperty}
          onRejectProperty={(property) => {
            setModerationError("");
            setPropertyToReject(property);
          }}
          isModerationActionLoading={isModerationLoading}
          moderationActionError={moderationError}
        />
      )}

      {propertyToReject && (
        <div
          className="moderator-reject-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPropertyToReject(null);
              setRejectionReason("");
              setModerationError("");
            }
          }}
        >
          <section className="moderator-reject-popup">
            <h2>Reject property?</h2>
            <p>
              Please write the reason so the owner knows what needs to change.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Example: Please upload clearer photos of the bathroom."
            />

            {moderationError && (
              <p className="moderator-reject-error">{moderationError}</p>
            )}

            <div className="moderator-reject-actions">
              <button
                type="button"
                disabled={isModerationLoading}
                onClick={() => {
                  setPropertyToReject(null);
                  setRejectionReason("");
                  setModerationError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reject"
                disabled={isModerationLoading}
                onClick={rejectProperty}
              >
                {isModerationLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ModeratorMainPage;
