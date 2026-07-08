import { useEffect, useState } from "react";
import "./PropertyDetailsPopup.css";
import PropertyImageViewer from "../propertyImageViewer/PropertyImageViewer";
import actionCheckIcon from "../../assets/icons/action-check.svg";
import actionPassIcon from "../../assets/icons/action-pass.svg";
import actionDeleteIcon from "../../assets/icons/action-delete.svg";
import actionEditSquareIcon from "../../assets/icons/action-edit-square.svg";
import actionInfoIcon from "../../assets/icons/action-info.svg";
import actionPauseIcon from "../../assets/icons/action-pause.svg";
import actionPlayIcon from "../../assets/icons/action-play.svg";
import amenityFloorsIcon from "../../assets/icons/amenity-floors.svg";
import amenityRoomsIcon from "../../assets/icons/amenity-rooms.svg";
import amenitySinkIcon from "../../assets/icons/amenity-sink.svg";
import amenitySofaIcon from "../../assets/icons/amenity-sofa.svg";
import carouselArrowNextIcon from "../../assets/icons/carousel-arrow-next.svg";
import carouselArrowPreviousIcon from "../../assets/icons/carousel-arrow-previous.svg";
import callPhoneHeartIcon from "../../assets/icons/call-phone-heart-svgrepo-com.svg";
import contactEmailIcon from "../../assets/icons/contact-email.svg";
import contactLanguageIcon from "../../assets/icons/contact-language.svg";
import contactPhoneIcon from "../../assets/icons/contact-phone.svg";
import contactWhatsappIcon from "../../assets/icons/contact-whatsapp.svg";
import documentFinancialIcon from "../../assets/icons/document-financial.svg";
import documentTextIcon from "../../assets/icons/document-text.svg";
import lariIcon from "../../assets/icons/lari-svgrepo-com.svg";
import locationPinSolidIcon from "../../assets/icons/location-pin-solid.svg";
import mediaPhotoGalleryIcon from "../../assets/icons/media-photo-gallery.svg";
import mediaVideoPlayIcon from "../../assets/icons/media-video-play.svg";
import personIcon from "../../assets/icons/person-svgrepo-com.svg";
import propertyAreaRulerIcon from "../../assets/icons/property-area-ruler.svg";
import propertyFloorIcon from "../../assets/icons/property-floor.svg";
import propertyHouseIcon from "../../assets/icons/property-house.svg";
import statusRenterGroupIcon from "../../assets/icons/status-renter-group.svg";
import statusUsersApprovedIcon from "../../assets/icons/status-users-approved.svg";
import statusUsersDeclinedIcon from "../../assets/icons/status-users-declined.svg";
import {
  featureLabels,
  nearbyLabels,
  tenantRuleLabels,
} from "../../utils/propertyOptionLabels";
import { getCoverFirstImages } from "../../utils/propertyImages";
import {
  approvePropertyInterest,
  deleteProperty,
  getPropertyInterests,
  rejectPropertyInterest,
  updateProperty,
  withdrawRenterInterest,
} from "../../services/propertyApi";

function formatValue(value, fallback = "Not added") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return value;
}

function formatPropertyType(type) {
  if (!type) return "Not added";

  return type
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatAvailabilityStatus(status) {
  if (status === "unavailable") {
    return "Paused";
  }

  return formatPropertyType(status);
}

function formatAreaValue(value) {
  const formattedValue = formatValue(value);

  return formattedValue === "Not added"
    ? formattedValue
    : `${formattedValue} m\u00b2`;
}

function getEnabledLabels(source = {}, labels = {}) {
  return Object.entries(labels)
    .filter(([key]) => source?.[key])
    .map(([, label]) => label);
}

function formatFileSize(size) {
  if (!size) return "Size not available";

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocumentFormat(document) {
  return (document?.format || "").toLowerCase();
}

function isImageDocument(document) {
  const format = getDocumentFormat(document);

  return (
    document?.resourceType === "image" ||
    ["jpg", "jpeg", "png", "webp"].includes(format)
  );
}

function isPdfDocument(document) {
  const format = getDocumentFormat(document);
  const originalName = document?.originalName || "";

  return format === "pdf" || originalName.toLowerCase().endsWith(".pdf");
}

const interestStatusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

function PropertyDetailsPopup({
  property,
  interest,
  mode = "view",
  onClose,
  onInterestWithdrawn,
  onEdit,
  onPropertyUpdated,
  onPropertyDeleted,
  onApproveProperty,
  onRejectProperty,
  isModerationActionLoading = false,
  moderationActionError = "",
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const [ownerInterests, setOwnerInterests] = useState([]);
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);
  const [interestsError, setInterestsError] = useState("");
  const [respondingInterestId, setRespondingInterestId] = useState("");
  const [isWithdrawingInterest, setIsWithdrawingInterest] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [ownerActionError, setOwnerActionError] = useState("");
  const [isOwnerActionLoading, setIsOwnerActionLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isOwnerMode = mode === "owner";
  const isModeratorMode = mode === "moderator";
  const canWithdrawInterest =
    mode === "renter-interest" &&
    (interest?.status === "pending" || interest?.status === "approved");
  const canViewOwnerContact =
    mode === "renter-interest" &&
    interest?.status === "approved" &&
    interest?.ownerContact;

  useEffect(() => {
    if (!isOwnerMode || !property?._id) {
      return;
    }

    async function loadOwnerInterests() {
      try {
        setIsLoadingInterests(true);
        setInterestsError("");

        const interests = await getPropertyInterests(property._id);
        setOwnerInterests(interests);
      } catch (error) {
        setInterestsError(error.message);
      } finally {
        setIsLoadingInterests(false);
      }
    }

    loadOwnerInterests();
  }, [isOwnerMode, property?._id]);

  if (!property) {
    return null;
  }

  const basicInformation = property.basicInformation || {};
  const location = property.location || {};
  const pricing = property.pricing || {};
  const propertyDetails = property.propertyDetails || {};
  const tenantRules = property.tenantRules || {};
  const livingSituation = property.livingSituation || {};
  const features = property.features || {};
  const images = getCoverFirstImages(property.images || []);
  const videoTour = property.videoTour || {};
  const propertyDocuments = Array.isArray(property.propertyDocuments)
    ? property.propertyDocuments
    : [];

  const title = basicInformation.title || "Untitled property";
  const description =
    basicInformation.description || "No description added yet.";
  const currentImage = images[currentImageIndex];
  const isApproved = property.moderationStatus === "approved";
  const isAvailable = property.availabilityStatus === "available";
  const availabilityLabel = formatAvailabilityStatus(
    property.availabilityStatus || "available",
  );

  const nearbyPlaces = getEnabledLabels(location, nearbyLabels);
  const enabledTenantRules = getEnabledLabels(tenantRules, tenantRuleLabels);
  const enabledFeatures = getEnabledLabels(features, featureLabels);
  const canViewVideoTour = Boolean(videoTour.url) && isModeratorMode;
  const canViewPropertyDocuments =
    propertyDocuments.length > 0 && isModeratorMode;

  function showPreviousImage() {
    if (images.length <= 1) return;

    setCurrentImageIndex((index) =>
      index === 0 ? images.length - 1 : index - 1,
    );
  }

  function showNextImage() {
    if (images.length <= 1) return;

    setCurrentImageIndex((index) =>
      index === images.length - 1 ? 0 : index + 1,
    );
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  async function respondToInterest(interestId, nextStatus) {
    try {
      setRespondingInterestId(interestId);
      setInterestsError("");

      const updatedInterest =
        nextStatus === "approved"
          ? await approvePropertyInterest(property._id, interestId)
          : await rejectPropertyInterest(property._id, interestId);

      setOwnerInterests((currentInterests) =>
        currentInterests.map((interest) =>
          interest._id === updatedInterest._id
            ? {
                ...interest,
                ...updatedInterest,
                renter: interest.renter,
              }
            : interest,
        ),
      );
    } catch (error) {
      setInterestsError(error.message);
    } finally {
      setRespondingInterestId("");
    }
  }

  async function handleWithdrawInterest() {
    if (!interest?._id || isWithdrawingInterest) return;

    try {
      setIsWithdrawingInterest(true);
      setWithdrawError("");

      await withdrawRenterInterest(interest._id);
      onInterestWithdrawn?.(interest._id);
    } catch (error) {
      setWithdrawError(error.message);
    } finally {
      setIsWithdrawingInterest(false);
    }
  }

  async function handleToggleAvailability() {
    if (!isOwnerMode || isOwnerActionLoading) return;

    try {
      setIsOwnerActionLoading(true);
      setOwnerActionError("");

      const updatedProperty = await updateProperty(property._id, {
        availabilityStatus: isAvailable ? "unavailable" : "available",
      });

      onPropertyUpdated?.(updatedProperty);
    } catch (error) {
      setOwnerActionError(error.message);
    } finally {
      setIsOwnerActionLoading(false);
    }
  }

  async function handleDeleteProperty() {
    if (!isOwnerMode || isOwnerActionLoading) return;

    try {
      setIsOwnerActionLoading(true);
      setOwnerActionError("");

      await deleteProperty(property._id);
      onPropertyDeleted?.(property._id);
    } catch (error) {
      setOwnerActionError(error.message);
      setIsDeleteConfirmOpen(false);
    } finally {
      setIsOwnerActionLoading(false);
    }
  }

  return (
    <div className="property-popup-backdrop" onMouseDown={handleBackdropClick}>
      <article className="property-popup" aria-label={`${title} details`}>
        <button
          className="property-popup-close"
          type="button"
          onClick={onClose}
          aria-label="Close property details"
        >
          ×
        </button>

        {isOwnerMode && (
          <div className="property-popup-owner-actions">
            <button
              className="property-popup-side-action edit"
              type="button"
              disabled={isOwnerActionLoading}
              onClick={() => onEdit?.(property)}
              aria-label="Edit property"
              title="Edit property"
            >
              <SvgIcon icon={actionEditSquareIcon} className="action-icon" />
            </button>

            <button
              className="property-popup-side-action pause"
              type="button"
              disabled={isOwnerActionLoading}
              onClick={handleToggleAvailability}
              aria-label={isAvailable ? "Pause property" : "Activate property"}
              title={isAvailable ? "Pause property" : "Activate property"}
            >
              <SvgIcon
                icon={isAvailable ? actionPauseIcon : actionPlayIcon}
                className="action-icon"
              />
            </button>

            <button
              className="property-popup-side-action delete"
              type="button"
              disabled={isOwnerActionLoading}
              onClick={() => setIsDeleteConfirmOpen(true)}
              aria-label="Delete property"
              title="Delete property"
            >
              <SvgIcon icon={actionDeleteIcon} className="action-icon" />
            </button>
          </div>
        )}

        {isModeratorMode && (
          <div className="property-popup-owner-actions">
            <button
              className="property-popup-side-action approve"
              type="button"
              disabled={isModerationActionLoading}
              onClick={() => onApproveProperty?.(property)}
              aria-label="Approve property"
              title="Approve property"
            >
              <SvgIcon icon={statusUsersApprovedIcon} className="action-icon" />
            </button>

            <button
              className="property-popup-side-action reject"
              type="button"
              disabled={isModerationActionLoading}
              onClick={() => onRejectProperty?.(property)}
              aria-label="Reject property"
              title="Reject property"
            >
              <SvgIcon icon={statusUsersDeclinedIcon} className="action-icon" />
            </button>
          </div>
        )}

        <section className="property-popup-gallery">
          <div className="property-popup-main-image-wrap">
            {currentImage?.url ? (
              <button
                className="property-popup-main-image-button"
                type="button"
                onClick={() => setIsImageViewerOpen(true)}
                aria-label="Open larger property image viewer"
              >
                <img
                  src={currentImage.url}
                  alt={title}
                  className="property-popup-main-image"
                />
              </button>
            ) : (
              <div className="property-popup-image-placeholder">
                No image added yet
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  className="property-popup-arrow previous"
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Show previous image"
                >
                  <SvgIcon
                    icon={carouselArrowPreviousIcon}
                    className="carousel-arrow-icon"
                  />
                </button>

                <button
                  className="property-popup-arrow next"
                  type="button"
                  onClick={showNextImage}
                  aria-label="Show next image"
                >
                  <SvgIcon
                    icon={carouselArrowNextIcon}
                    className="carousel-arrow-icon"
                  />
                </button>
              </>
            )}

            {images.length > 0 && (
              <div className="property-popup-image-count">
                <SvgIcon
                  icon={mediaPhotoGalleryIcon}
                  className="image-count-icon"
                />
                <span>
                  {currentImageIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>

          <div
            className="property-popup-thumbnails"
            aria-label="Property images"
          >
            {images.length > 0 ? (
              images.map((image, index) => (
                <button
                  key={image._id || image.publicId || image.url}
                  className={`property-popup-thumbnail ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img src={image.url} alt="" aria-hidden="true" />
                </button>
              ))
            ) : (
              <p>No thumbnails</p>
            )}
          </div>
          <div className="property-popup-heading">
            {(isOwnerMode || isModeratorMode || isApproved) && (
              <p
                className={`property-popup-status ${
                  isAvailable ? "available" : "paused"
                }`}
              >
                {availabilityLabel}
              </p>
            )}

            <h2>{title}</h2>

            <p className="property-popup-location">
              <SvgIcon
                icon={locationPinSolidIcon}
                className="property-popup-location-icon"
              />
              <span>
                {[location.city, location.district, location.address]
                  .filter(Boolean)
                  .join(", ") || "Location not added"}
              </span>
            </p>

            <div className="property-popup-price-row">
              <div className="property-popup-price">
                <SvgIcon icon={lariIcon} className="main-price-icon" />
                <strong>{formatValue(pricing.monthlyRent)}</strong>
                <span>/ month</span>
              </div>

              {canViewOwnerContact && (
                <button
                  className="property-popup-contact-button"
                  type="button"
                  onClick={() => setIsContactPopupOpen(true)}
                >
                  Owner contact
                </button>
              )}
            </div>

            <p className="property-popup-description">{description}</p>
          </div>
        </section>

        <section className="property-popup-info">
          {(ownerActionError || moderationActionError) && (
            <p className="property-popup-owner-error" role="alert">
              {ownerActionError || moderationActionError}
            </p>
          )}

          <div className="property-popup-section">
            <h3 className="property-popup-section-title">
              <SvgIcon icon={actionInfoIcon} className="section-title-icon" />
              <span>Property details</span>
            </h3>

            <div className="property-popup-detail-grid">
              <Detail
                label="Type"
                value={formatPropertyType(propertyDetails.propertyType)}
                icon={propertyHouseIcon}
              />
              <Detail
                label="Rooms"
                value={formatValue(propertyDetails.roomCount)}
                icon={amenityRoomsIcon}
              />
              <Detail
                label="Bathrooms"
                value={formatValue(propertyDetails.bathroomCount)}
                icon={amenitySinkIcon}
              />
              <Detail
                label="Area"
                value={formatAreaValue(propertyDetails.area)}
                icon={propertyAreaRulerIcon}
              />
              <Detail
                label="Floor"
                value={formatValue(propertyDetails.floor)}
                icon={propertyFloorIcon}
              />
              <Detail
                label="Total floors"
                value={formatValue(propertyDetails.totalFloors)}
                icon={amenityFloorsIcon}
              />
              <Detail
                label="Furnished"
                value={formatValue(propertyDetails.furnished)}
                icon={amenitySofaIcon}
              />
              <Detail
                label="New building"
                value={formatValue(propertyDetails.newBuilding)}
                icon={propertyHouseIcon}
              />
            </div>
          </div>

          <div className="property-popup-section">
            <h3 className="property-popup-section-title">
              <SvgIcon
                icon={documentFinancialIcon}
                className="section-title-icon"
              />
              <span>Pricing</span>
            </h3>

            <div className="property-popup-detail-grid">
              <Detail
                label="Monthly rent"
                value={`${formatValue(pricing.monthlyRent)} / month`}
                icon={lariIcon}
                iconClassName="price-lari-icon"
              />
              <Detail
                label="Deposit required"
                value={formatValue(pricing.depositRequired)}
                icon={documentFinancialIcon}
              />
              <Detail
                label="Deposit amount"
                value={formatValue(pricing.depositAmount)}
                icon={lariIcon}
                iconClassName="price-lari-icon"
              />
            </div>
          </div>

          {canViewPropertyDocuments && (
            <DocumentReviewSection documents={propertyDocuments} />
          )}

          {canViewVideoTour && (
            <div className="property-popup-section">
              <h3 className="property-popup-section-title">
                <SvgIcon
                  icon={mediaVideoPlayIcon}
                  className="section-title-icon"
                />
                <span>Video tour</span>
              </h3>

              <video
                className="property-popup-video"
                src={videoTour.url}
                controls
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <div className="property-popup-section">
            <h3 className="property-popup-section-title">
              <SvgIcon
                icon={statusRenterGroupIcon}
                className="section-title-icon"
              />
              <span>Living situation</span>
            </h3>

            <div className="property-popup-detail-grid">
              <Detail
                label="Rental type"
                value={formatPropertyType(livingSituation.rentalType)}
                icon={statusRenterGroupIcon}
              />
              <Detail
                label="Roommate preference"
                value={formatPropertyType(livingSituation.roommatePreference)}
                icon={statusRenterGroupIcon}
              />
            </div>
          </div>

          <TagSection
            title="Nearby"
            items={nearbyPlaces}
            emptyText="No nearby details added"
          />
          <TagSection
            title="Tenant rules"
            items={enabledTenantRules}
            emptyText="No tenant rules added"
          />
          <TagSection
            title="Features"
            items={enabledFeatures}
            emptyText="No features added"
          />

          {property.rejectionReason && (
            <div className="property-popup-rejection">
              <h3>Rejection reason</h3>
              <p>{property.rejectionReason}</p>
            </div>
          )}

          {canWithdrawInterest && (
            <div className="property-popup-renter-actions">
              {withdrawError && (
                <p className="property-popup-renter-action-error" role="alert">
                  {withdrawError}
                </p>
              )}

              <button
                type="button"
                className="property-popup-withdraw-button"
                disabled={isWithdrawingInterest}
                onClick={handleWithdrawInterest}
              >
                {isWithdrawingInterest ? "Withdrawing..." : "Withdraw interest"}
              </button>
            </div>
          )}

          {isOwnerMode && (
            <OwnerInterestSection
              interests={ownerInterests}
              isLoading={isLoadingInterests}
              error={interestsError}
              respondingInterestId={respondingInterestId}
              onApprove={(interestId) =>
                respondToInterest(interestId, "approved")
              }
              onReject={(interestId) =>
                respondToInterest(interestId, "rejected")
              }
            />
          )}
        </section>
      </article>
      {isImageViewerOpen && (
        <PropertyImageViewer
          key={currentImageIndex}
          images={images}
          initialIndex={currentImageIndex}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}

      {isContactPopupOpen && (
        <OwnerContactPopup
          ownerContact={interest.ownerContact}
          onClose={() => setIsContactPopupOpen(false)}
        />
      )}

      {isDeleteConfirmOpen && (
        <DeletePropertyConfirmPopup
          title={title}
          isDeleting={isOwnerActionLoading}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeleteProperty}
        />
      )}
    </div>
  );
}

function DeletePropertyConfirmPopup({
  title,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onCancel?.();
    }
  }

  return (
    <div
      className="property-delete-confirm-backdrop"
      onMouseDown={handleBackdropClick}
    >
      <section className="property-delete-confirm-popup">
        <h2>Delete property?</h2>
        <p>
          Are you sure you want to delete <strong>{title}</strong>? This cannot
          be undone.
        </p>

        <div className="property-delete-confirm-actions">
          <button type="button" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>

          <button
            type="button"
            className="delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </section>
    </div>
  );
}

function OwnerContactPopup({ ownerContact, onClose }) {
  const owner = ownerContact?.owner || {};
  const ownerProfile = ownerContact?.ownerProfile || {};
  const languages = ownerProfile.languages || [];
  const preferredContactMethods = ownerProfile.preferredContactMethods || [];

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  return (
    <div className="owner-contact-backdrop" onMouseDown={handleBackdropClick}>
      <section className="owner-contact-popup">
        <button
          className="owner-contact-close"
          type="button"
          onClick={onClose}
          aria-label="Close owner contact information"
        >
          ×
        </button>

        <p className="owner-contact-eyebrow">Owner contact</p>
        <h2 className="owner-contact-title">
          <SvgIcon icon={personIcon} className="owner-contact-title-icon" />
          <span>{owner.fullName || "Property owner"}</span>
        </h2>

        <div className="owner-contact-grid">
          <ContactDetail
            label="Email"
            value={owner.email}
            icon={contactEmailIcon}
          />
          <ContactDetail
            label="Phone"
            value={ownerProfile.phoneNumber}
            icon={contactPhoneIcon}
          />
          <ContactDetail
            label="WhatsApp"
            value={ownerProfile.whatsappNumber}
            icon={contactWhatsappIcon}
          />
          <ContactDetail
            label="Preferred contact"
            icon={callPhoneHeartIcon}
            value={
              preferredContactMethods.length > 0
                ? preferredContactMethods.join(", ")
                : ""
            }
          />
          <ContactDetail
            label="Languages"
            icon={contactLanguageIcon}
            value={languages.length > 0 ? languages.join(", ") : ""}
          />
        </div>
      </section>
    </div>
  );
}

function ContactDetail({ label, value, icon }) {
  return (
    <div className="owner-contact-detail">
      {icon && <SvgIcon icon={icon} className="owner-contact-detail-icon" />}
      <div>
        <span>{label}</span>
        <strong>{value || "Not added"}</strong>
      </div>
    </div>
  );
}

function DocumentReviewSection({ documents }) {
  return (
    <div className="property-popup-section property-popup-documents">
      <div className="property-popup-section-heading">
        <h3 className="property-popup-section-title">
          <SvgIcon icon={documentTextIcon} className="section-title-icon" />
          <span>Property documents</span>
        </h3>
        <span>{documents.length} files</span>
      </div>

      <div className="property-popup-document-list">
        {documents.map((document, index) => (
          <PropertyDocumentPreview
            key={document._id || document.publicId || document.url}
            document={document}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function PropertyDocumentPreview({ document, index }) {
  const label = document.originalName || `Document ${index + 1}`;
  const format = getDocumentFormat(document);
  const isImage = isImageDocument(document);
  const isPdf = isPdfDocument(document);
  const displayFormat = format ? format.toUpperCase() : "FILE";

  return (
    <article className="property-popup-document-card">
      <div className="property-popup-document-preview">
        {isImage && document.url ? (
          <img src={document.url} alt={label} />
        ) : isPdf && document.url ? (
          <object data={document.url} type="application/pdf" title={label}>
            <a href={document.url} target="_blank" rel="noreferrer">
              Open PDF
            </a>
          </object>
        ) : (
          <div className="property-popup-document-icon">{displayFormat}</div>
        )}
      </div>

      <div className="property-popup-document-info">
        <div>
          <strong>{label}</strong>
          <span>
            {displayFormat} - {formatFileSize(document.bytes)}
          </span>
        </div>

        {document.url && (
          <a href={document.url} target="_blank" rel="noreferrer">
            Open
          </a>
        )}
      </div>
    </article>
  );
}

function OwnerInterestSection({
  interests,
  isLoading,
  error,
  respondingInterestId,
  onApprove,
  onReject,
}) {
  return (
    <div className="property-popup-section property-popup-owner-interests">
      <h3>Interested renters</h3>

      {isLoading ? (
        <p className="property-popup-empty-text">Loading renter requests...</p>
      ) : error ? (
        <p className="property-popup-owner-error">{error}</p>
      ) : interests.length === 0 ? (
        <p className="property-popup-empty-text">
          No renters have shown interest yet.
        </p>
      ) : (
        <div className="property-popup-interest-list">
          {interests.map((interest) => {
            const renter = interest.renter || {};
            const isPending = interest.status === "pending";
            const isResponding = respondingInterestId === interest._id;

            return (
              <div key={interest._id} className="property-popup-interest-card">
                <div className="property-popup-renter-info">
                  {renter.profilePicture ? (
                    <img src={renter.profilePicture} alt="" />
                  ) : (
                    <span>{renter.fullName?.[0] || "R"}</span>
                  )}

                  <div>
                    <strong>{renter.fullName || "Unnamed renter"}</strong>
                    <p>{renter.email || "No email added"}</p>
                  </div>
                </div>

                <div className="property-popup-interest-actions">
                  {isPending ? (
                    <div className="property-popup-interest-buttons">
                      <button
                        type="button"
                        className="approve"
                        disabled={isResponding}
                        onClick={() => onApprove(interest._id)}
                      >
                        <SvgIcon
                          icon={actionCheckIcon}
                          className="inline-button-icon"
                        />
                        Approve
                      </button>

                      <button
                        type="button"
                        className="reject"
                        disabled={isResponding}
                        onClick={() => onReject(interest._id)}
                      >
                        <SvgIcon
                          icon={actionPassIcon}
                          className="inline-button-icon reject-inline-icon"
                        />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`property-popup-interest-status ${interest.status}`}
                    >
                      {interestStatusLabels[interest.status] || interest.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, icon, iconClassName = "" }) {
  return (
    <div className="property-popup-detail">
      {icon && (
        <SvgIcon
          icon={icon}
          className={`detail-card-icon ${iconClassName}`.trim()}
        />
      )}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SvgIcon({ icon, className = "" }) {
  return (
    <img
      src={icon}
      className={`popup-icon ${className}`.trim()}
      alt=""
    />
  );
}

function TagSection({ title, items, emptyText }) {
  return (
    <div className="property-popup-section">
      <h3>{title}</h3>

      {items.length > 0 ? (
        <div className="property-popup-tags">
          {items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : (
        <p className="property-popup-empty-text">{emptyText}</p>
      )}
    </div>
  );
}

export default PropertyDetailsPopup;
