import { useState } from "react";
import chevronDownIcon from "../../../../assets/icons/action-chevron-down.svg";
import galleryIcon from "../../../../assets/icons/media-photo-gallery.svg";
import lariIcon from "../../../../assets/icons/lari-svgrepo-com.svg";
import locationIcon from "../../../../assets/icons/location-pin-outline.svg";
import matchIcon from "../../../../assets/icons/status-featured-match.svg";
import nextIcon from "../../../../assets/icons/carousel-arrow-next.svg";
import previousIcon from "../../../../assets/icons/carousel-arrow-previous.svg";
import rulerIcon from "../../../../assets/icons/property-area-ruler.svg";
import roomsIcon from "../../../../assets/icons/amenity-rooms.svg";
import sofaIcon from "../../../../assets/icons/amenity-sofa.svg";
import secureOwnerIcon from "../../../../assets/icons/status-secure-owner.svg";
import { getCoverFirstImages } from "../../../../utils/propertyImages";
import "./PropertyCard.css";

function PropertyCard({ property, onInfoClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const title = property.basicInformation?.title || "Untitled property";
  const description = property.basicInformation?.description || "";
  const city = property.location?.city || "";
  const district = property.location?.district || "";
  const price = property.pricing?.monthlyRent;
  const currency = property.pricing?.currency || "GEL";
  const roomCount = property.propertyDetails?.roomCount;
  const area = property.propertyDetails?.area;
  const furnished = property.propertyDetails?.furnished;
  const propertyType = property.propertyDetails?.propertyType;
  const matchScore = property.matchScore;
  const images = getCoverFirstImages(property.images || []);
  const currentImage = images[currentImageIndex];

  const locationText = [city, district].filter(Boolean).join(", ");
  const hasMultipleImages = images.length > 1;

  function showPreviousImage() {
    setCurrentImageIndex((index) =>
      index === 0 ? images.length - 1 : index - 1,
    );
  }

  function showNextImage() {
    setCurrentImageIndex((index) =>
      index === images.length - 1 ? 0 : index + 1,
    );
  }

  return (
    <article className="property-card-shell">
      <div className="property-card">
        <div className="property-card-image-area">
          {currentImage?.url ? (
            <img
              src={currentImage.url}
              alt={title}
              className="property-card-image"
              draggable={false}
            />
          ) : (
            <div className="property-card-image-placeholder">
              <span>No image yet</span>
            </div>
          )}

          {hasMultipleImages && (
            <>
              <button
                className="property-image-button previous"
                type="button"
                onClick={showPreviousImage}
                aria-label="Show previous property image"
              >
                <img
                  src={previousIcon}
                  className="carousel-icon"
                  alt=""
                  draggable={false}
                />
              </button>

              <button
                className="property-image-button next"
                type="button"
                onClick={showNextImage}
                aria-label="Show next property image"
              >
                <img
                  src={nextIcon}
                  className="carousel-icon"
                  alt=""
                  draggable={false}
                />
              </button>
            </>
          )}

          {matchScore !== undefined && (
            <span className="property-match-badge match-badge">
              <img src={matchIcon} className="badge-icon" alt="" />
              {matchScore}% Match
            </span>
          )}

          {images.length > 0 && (
            <span className="property-image-count">
              <img src={galleryIcon} className="badge-icon" alt="" />
              {currentImageIndex + 1} / {images.length}
            </span>
          )}

          {price !== undefined && (
            <span className="property-price-badge price-badge">
              <img src={lariIcon} className="price-icon" alt="" />
              <span>
                <strong>
                  {currency} {price}
                </strong>
                <small>per month</small>
              </span>
            </span>
          )}

          <button
            className="property-see-more-button"
            type="button"
            onClick={() => onInfoClick?.(property)}
            aria-label={`View details for ${title}`}
          >
            See more
            <img src={chevronDownIcon} className="chevron-icon" alt="" />
          </button>
        </div>

        <div className="property-card-content">
          <div className="property-card-heading">
            <p className="property-type">{propertyType}</p>

            <div className="property-title-row">
              <h3>{title}</h3>
              <span className="property-owner-badge verified-owner">
                <img src={secureOwnerIcon} className="detail-icon" alt="" />
                Verified Owner
              </span>
            </div>

            {locationText && (
              <p className="property-location location-row">
                <img src={locationIcon} className="detail-icon" alt="" />
                {locationText}
              </p>
            )}
          </div>

          {description && <p className="property-description">{description}</p>}

          <div className="property-card-actions">
            {roomCount !== undefined && (
              <span className="property-card-pill card-pill">
                <img src={roomsIcon} className="pill-icon" alt="" />
                {roomCount === 0 ? "Studio" : `${roomCount} rooms`}
              </span>
            )}

            {area !== undefined && (
              <span className="property-card-pill card-pill">
                <img src={rulerIcon} className="pill-icon" alt="" />
                {area} m{"\u00b2"}
              </span>
            )}

            <span className="property-card-pill card-pill">
              <img src={sofaIcon} className="pill-icon" alt="" />
              {furnished ? "Furnished" : "Unfurnished"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
