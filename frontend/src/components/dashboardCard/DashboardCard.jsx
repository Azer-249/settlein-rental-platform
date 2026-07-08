import "./DashboardCard.css";
import actionPauseIcon from "../../assets/icons/action-pause.svg";
import amenityRoomsIcon from "../../assets/icons/amenity-rooms.svg";
import lariIcon from "../../assets/icons/lari-svgrepo-com.svg";
import propertyAreaRulerIcon from "../../assets/icons/property-area-ruler.svg";
import statusApprovedIcon from "../../assets/icons/status-approved-line.svg";
import statusPendingIcon from "../../assets/icons/status-pending-line.svg";
import statusRejectedIcon from "../../assets/icons/status-rejected-line.svg";
import { getCoverImage } from "../../utils/propertyImages";

const statusLabels = {
  pending: "Waiting",
  approved: "Live",
  rejected: "Needs changes",
  paused: "Paused",
};

const statusDescriptions = {
  pending: "Waiting for moderator approval",
  approved: "Approved and visible to renters",
  rejected: "Rejected by moderator",
  paused: "Approved but not currently available",
};

const statusIcons = {
  pending: statusPendingIcon,
  approved: statusApprovedIcon,
  rejected: statusRejectedIcon,
  paused: actionPauseIcon,
  "interest-pending": statusPendingIcon,
  "interest-approved": statusApprovedIcon,
  "interest-rejected": statusRejectedIcon,
  "interest-withdrawn": actionPauseIcon,
  "interest-unavailable": actionPauseIcon,
};

function DashboardCard({
  property,
  onClick,
  statusLabel,
  statusDescription,
  statusClassName,
}) {
  const title = property.basicInformation?.title || "Untitled property";
  const city = property.location?.city || "";
  const district = property.location?.district || "";
  const price = property.pricing?.monthlyRent;
  const roomCount = property.propertyDetails?.roomCount;
  const area = property.propertyDetails?.area;
  const imageUrl = getCoverImage(property.images)?.url;
  const moderationStatus = property.moderationStatus || "pending";
  const availabilityStatus = property.availabilityStatus || "available";
  const status =
    moderationStatus === "approved" && availabilityStatus !== "available"
      ? "paused"
      : moderationStatus;

  const locationText = [city, district].filter(Boolean).join(", ");
  const defaultStatusLabel = statusLabels[status] || status;
  const defaultStatusDescription =
    statusDescriptions[status] || "Property status";

  const finalStatusLabel = statusLabel || defaultStatusLabel;
  const finalStatusDescription = statusDescription || defaultStatusDescription;
  const finalStatusClassName = statusClassName || status;
  const statusIcon = statusIcons[finalStatusClassName] || statusIcons[status];

  function handleCardClick() {
    onClick?.(property);
  }

  function handleStatusClick(event) {
    event.stopPropagation();
  }

  return (
    <article
      className="dashboard-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="dashboard-card-image-area">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="dashboard-card-image" />
        ) : (
          <div className="dashboard-card-image-placeholder">
            <span>No image yet</span>
          </div>
        )}
      </div>

      <div className="dashboard-card-content">
        <div className="dashboard-card-header">
          <div>
            <h3>{title}</h3>
            {locationText && (
              <p className="dashboard-card-location">{locationText}</p>
            )}
          </div>
          {price !== undefined && (
            <span className="dashboard-card-price">
              <img src={lariIcon} className="dashboard-card-price-icon" alt="" />
              {price}
            </span>
          )}
        </div>

        <div className="dashboard-card-bottom">
          <div className="dashboard-card-details">
            {roomCount !== undefined && (
              <div className="dashboard-card-detail">
                <img
                  src={amenityRoomsIcon}
                  className="dashboard-card-detail-icon"
                  alt=""
                />
                <div>
                  <strong>{roomCount === 0 ? "Studio" : roomCount}</strong>
                  <span>{roomCount === 0 ? "type" : "rooms"}</span>
                </div>
              </div>
            )}

            {area !== undefined && (
              <div className="dashboard-card-detail">
                <img
                  src={propertyAreaRulerIcon}
                  className="dashboard-card-detail-icon"
                  alt=""
                />
                <div>
                  <strong>{area} m²</strong>
                  <span>area</span>
                </div>
              </div>
            )}
          </div>

          <button
            className={`dashboard-card-status ${finalStatusClassName}`}
            type="button"
            onClick={handleStatusClick}
            aria-label={finalStatusDescription}
            title={finalStatusDescription}
          >
            <span>
              {statusIcon && (
                <img
                  src={statusIcon}
                  className="dashboard-card-status-icon"
                  alt=""
                />
              )}
              {finalStatusLabel}
            </span>
            <small>{finalStatusDescription}</small>
          </button>
        </div>
      </div>
    </article>
  );
}

export default DashboardCard;
