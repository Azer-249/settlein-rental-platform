import { useEffect, useMemo, useState } from "react";
import {
  createProperty,
  deletePropertyDocument,
  deletePropertyImage,
  deletePropertyVideo,
  setPropertyCoverImage,
  updateProperty,
  uploadPropertyDocuments,
  uploadPropertyImages,
  uploadPropertyVideo,
} from "../../services/propertyApi";
import coverIcon from "../../assets/icons/cover-svgrepo-com.svg";
import {
  featureOptions,
  nearbyOptions,
  tenantRuleOptions,
} from "../../utils/propertyOptionLabels";
import "./PropertyFormPopup.css";

const initialFormData = {
  basicInformation: {
    title: "",
    description: "",
  },
  location: {
    city: "",
    district: "",
    address: "",
    nearMall: false,
    nearPark: false,
    nearMetro: false,
    nearHospital: false,
    nearBusStop: false,
    cityCenter: false,
  },
  pricing: {
    monthlyRent: "",
    depositRequired: false,
    depositAmount: "",
    currency: "GEL",
  },
  propertyDetails: {
    propertyType: "apartment",
    roomCount: "",
    bathroomCount: "",
    area: "",
    floor: "",
    totalFloors: "",
    furnished: false,
    newBuilding: false,
  },
  tenantRules: {
    acceptsStudents: false,
    acceptsFamilies: false,
    acceptsPets: false,
    allowsSmoking: false,
    nightlifeFriendly: false,
    quietLifestyle: false,
    allowsShortTerm: false,
    allowsLongTerm: false,
  },
  livingSituation: {
    rentalType: "entire-property",
    roommatePreference: "any",
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

const formSteps = ["Media", "Basics", "Details", "Rules"];

function getCoverImageId(images = []) {
  return images.find((image) => image?.isCover)?._id || images[0]?._id || "";
}

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedDocumentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

const maxImageBytes = 5 * 1024 * 1024;
const maxDocumentBytes = 10 * 1024 * 1024;
const maxVideoBytes = 50 * 1024 * 1024;
const minImageWidth = 1200;
const minImageHeight = 900;

const districtsByCity = {
  Tbilisi: [
    "Vake",
    "Saburtalo",
    "Mtatsminda",
    "Dighomi",
    "Nadzaladevi",
    "Vera",
    "Didube",
    "Gldani",
    "Isani",
    "Samgori",
    "Varketili",
    "Ortachala",
    "Krtsanisi",
    "Avlabari",
    "Chughureti",
    "Lilo",
  ],
  Batumi: [
    "Old Batumi",
    "New Boulevard",
    "Khimshiashvili Area",
    "Airport Area",
    "Makhinjauri",
    "Gonio",
    "Kvariati",
    "Green Cape (Mtsvane Kontskhi)",
  ],
  Kutaisi: [
    "City Centre",
    "Nikea",
    "Avangardi",
    "Sapichkhia",
    "Asakiani",
    "Youth Park Area",
  ],
  Rustavi: [
    "Old Rustavi",
    "New Rustavi",
    "19th Microdistrict",
    "Friendship Avenue Area",
  ],
};

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}

function preventNegativeNumberKey(event) {
  if (event.key === "-") {
    event.preventDefault();
  }
}

function removeNegativeSigns(value) {
  return value.replace(/-/g, "");
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image dimensions."));
    };

    image.src = objectUrl;
  });
}

async function getImageFilesError(files) {
  if (files.length === 0) {
    return "Please upload at least one property image.";
  }

  if (files.length > 12) {
    return "Please upload a maximum of 12 property images.";
  }

  for (const file of files) {
    if (!allowedImageTypes.includes(file.type)) {
      return "Images must be JPEG, PNG, or WebP.";
    }

    if (file.size > maxImageBytes) {
      return "Each image must be 5 MB or smaller.";
    }

    const dimensions = await getImageDimensions(file);

    if (
      dimensions.width < minImageWidth ||
      dimensions.height < minImageHeight
    ) {
      return `Images must be at least ${minImageWidth}x${minImageHeight}px.`;
    }
  }

  return "";
}

function getDocumentFilesError(files) {
  if (files.length === 0) {
    return "Please upload at least one property document.";
  }

  if (files.length > 5) {
    return "Please upload a maximum of 5 property documents.";
  }

  for (const file of files) {
    if (!allowedDocumentTypes.includes(file.type)) {
      return "Documents must be PDF, JPEG, PNG, or WebP.";
    }

    if (file.size > maxDocumentBytes) {
      return "Each property document must be 10 MB or smaller.";
    }
  }

  return "";
}

function getVideoFileError(file) {
  if (!file) {
    return "Please upload one video tour.";
  }

  if (!allowedVideoTypes.includes(file.type)) {
    return "Video tour must be MP4, WebM, or MOV.";
  }

  if (file.size > maxVideoBytes) {
    return "Video tour must be 50 MB or smaller.";
  }

  return "";
}

function cleanPayload(formData) {
  return {
    ...formData,
    pricing: {
      ...formData.pricing,
      monthlyRent: toNumber(formData.pricing.monthlyRent),
      depositAmount: formData.pricing.depositRequired
        ? toNumber(formData.pricing.depositAmount) || 0
        : 0,
    },
    propertyDetails: {
      ...formData.propertyDetails,
      roomCount: toNumber(formData.propertyDetails.roomCount),
      bathroomCount: toNumber(formData.propertyDetails.bathroomCount),
      area: toNumber(formData.propertyDetails.area),
      floor: toNumber(formData.propertyDetails.floor),
      totalFloors: toNumber(formData.propertyDetails.totalFloors),
    },
  };
}

function getLivingSituationValue(livingSituation) {
  if (livingSituation.rentalType === "entire-property") {
    return "entire-property";
  }

  if (livingSituation.roommatePreference === "female") {
    return "shared-female";
  }

  if (livingSituation.roommatePreference === "male") {
    return "shared-male";
  }

  return "shared-any";
}

function stringifyNumber(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function getEditableFormData(property) {
  if (!property) {
    return initialFormData;
  }

  return {
    basicInformation: {
      ...initialFormData.basicInformation,
      ...property.basicInformation,
    },
    location: {
      ...initialFormData.location,
      ...property.location,
    },
    pricing: {
      ...initialFormData.pricing,
      ...property.pricing,
      monthlyRent: stringifyNumber(property.pricing?.monthlyRent),
      depositAmount: stringifyNumber(property.pricing?.depositAmount),
    },
    propertyDetails: {
      ...initialFormData.propertyDetails,
      ...property.propertyDetails,
      roomCount: stringifyNumber(property.propertyDetails?.roomCount),
      bathroomCount: stringifyNumber(property.propertyDetails?.bathroomCount),
      area: stringifyNumber(property.propertyDetails?.area),
      floor: stringifyNumber(property.propertyDetails?.floor),
      totalFloors: stringifyNumber(property.propertyDetails?.totalFloors),
    },
    tenantRules: {
      ...initialFormData.tenantRules,
      ...property.tenantRules,
    },
    livingSituation: {
      ...initialFormData.livingSituation,
      ...property.livingSituation,
    },
    features: {
      ...initialFormData.features,
      ...property.features,
    },
  };
}

function getMediaId(media) {
  return media?._id || media?.publicId || media?.url;
}

function PropertyFormPopup({
  onClose,
  onPropertyCreated,
  onPropertyUpdated,
  propertyToEdit,
}) {
  const isEditMode = Boolean(propertyToEdit);
  const [formData, setFormData] = useState(() =>
    getEditableFormData(propertyToEdit),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [imageFiles, setImageFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [existingImages, setExistingImages] = useState(
    propertyToEdit?.images || [],
  );
  const [existingDocuments, setExistingDocuments] = useState(
    propertyToEdit?.propertyDocuments || [],
  );
  const [existingVideo, setExistingVideo] = useState(
    propertyToEdit?.videoTour?.url ? propertyToEdit.videoTour : null,
  );
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [removedDocumentIds, setRemovedDocumentIds] = useState([]);
  const [shouldRemoveVideo, setShouldRemoveVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCoverImageId, setPendingCoverImageId] = useState(() =>
    getCoverImageId(propertyToEdit?.images || []),
  );
  const [error, setError] = useState("");

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === formSteps.length - 1;

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  function updateSection(section, field, value) {
    setFormData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  }

  function handleInputChange(section, field, event) {
    const { type, checked, value } = event.target;

    updateSection(section, field, type === "checkbox" ? checked : value);
  }

  function handleNonNegativeNumberChange(section, field, event) {
    updateSection(section, field, removeNegativeSigns(event.target.value));
  }

  function handleCityChange(event) {
    const city = event.target.value;

    setFormData((current) => ({
      ...current,
      location: {
        ...current.location,
        city,
        district: "",
        nearMetro: city === "Tbilisi" ? current.location.nearMetro : false,
      },
    }));
  }

  async function handleImagesChange(event) {
    const files = Array.from(event.target.files || []);
    const nextFiles = [...imageFiles, ...files];

    if (existingImages.length + nextFiles.length > 12) {
      setError("Please upload a maximum of 12 property images.");
      event.target.value = "";
      return;
    }

    const fileError = await getImageFilesError(nextFiles);

    if (fileError) {
      setError(fileError);
      event.target.value = "";
      return;
    }

    setError("");
    setImageFiles(nextFiles);
    event.target.value = "";
  }

  function handleDocumentsChange(event) {
    const files = Array.from(event.target.files || []);
    const nextFiles = [...documentFiles, ...files];

    if (existingDocuments.length + nextFiles.length > 5) {
      setError("Please upload a maximum of 5 property documents.");
      event.target.value = "";
      return;
    }

    const fileError = getDocumentFilesError(nextFiles);

    if (fileError) {
      setError(fileError);
      event.target.value = "";
      return;
    }

    setError("");
    setDocumentFiles(nextFiles);
    event.target.value = "";
  }

  function handleVideoChange(event) {
    const file = event.target.files?.[0] || null;
    const fileError = getVideoFileError(file);

    if (fileError) {
      setVideoFile(null);
      setError(fileError);
      event.target.value = "";
      return;
    }

    setError("");
    setVideoFile(file);
    event.target.value = "";
  }

  function removeImageFile(indexToRemove) {
    setImageFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove),
    );
  }

  function removeDocumentFile(indexToRemove) {
    setDocumentFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove),
    );
  }

  function removeVideoFile() {
    setVideoFile(null);
  }

  function removeExistingImage(imageToRemove) {
    setExistingImages((currentImages) => {
      const nextImages = currentImages.filter(
        (image) => getMediaId(image) !== getMediaId(imageToRemove),
      );

      if (imageToRemove._id === pendingCoverImageId) {
        const nextCoverImageId = getCoverImageId(nextImages);
        setPendingCoverImageId(nextCoverImageId);

        return nextImages.map((image) => ({
          ...image,
          isCover: image._id === nextCoverImageId,
        }));
      }

      return nextImages;
    });
    setRemovedImageIds((currentIds) => [...currentIds, imageToRemove._id]);
  }

  function removeExistingDocument(documentToRemove) {
    setExistingDocuments((currentDocuments) =>
      currentDocuments.filter(
        (document) => getMediaId(document) !== getMediaId(documentToRemove),
      ),
    );
    setRemovedDocumentIds((currentIds) => [
      ...currentIds,
      documentToRemove._id,
    ]);
  }

  function removeExistingVideo() {
    setExistingVideo(null);
    setShouldRemoveVideo(true);
  }

  function handleSetCoverImage(image) {
    if (!isEditMode || !image?._id || image._id === pendingCoverImageId) {
      return;
    }

    setError("");
    setPendingCoverImageId(image._id);
    setExistingImages((currentImages) =>
      currentImages.map((currentImage) => ({
        ...currentImage,
        isCover: currentImage._id === image._id,
      })),
    );
  }

  function handleLivingSituationChange(event) {
    const value = event.target.value;

    const livingSituationMap = {
      "entire-property": {
        rentalType: "entire-property",
        roommatePreference: "any",
      },
      "shared-any": {
        rentalType: "shared-apartment",
        roommatePreference: "any",
      },
      "shared-female": {
        rentalType: "shared-apartment",
        roommatePreference: "female",
      },
      "shared-male": {
        rentalType: "shared-apartment",
        roommatePreference: "male",
      },
    };

    setFormData((current) => ({
      ...current,
      livingSituation: livingSituationMap[value],
    }));
  }

  async function goToNextStep() {
    const stepError = await getStepError();

    if (stepError) {
      setError(stepError);
      return;
    }

    setError("");
    setCurrentStep((step) => Math.min(step + 1, formSteps.length - 1));
  }

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function getStepError(step = currentStep) {
    if (step === 0) {
      if (isEditMode) {
        const totalImageCount = existingImages.length + imageFiles.length;
        const totalDocumentCount =
          existingDocuments.length + documentFiles.length;
        const hasVideo = Boolean(existingVideo) || Boolean(videoFile);

        if (totalImageCount === 0) {
          return "Please keep or upload at least one property image.";
        }

        if (totalImageCount > 12) {
          return "Please keep or upload a maximum of 12 property images.";
        }

        if (totalDocumentCount === 0) {
          return "Please keep or upload at least one property document.";
        }

        if (totalDocumentCount > 5) {
          return "Please keep or upload a maximum of 5 property documents.";
        }

        if (!hasVideo) {
          return "Please keep or upload one video tour.";
        }

        return (
          (imageFiles.length > 0 ? await getImageFilesError(imageFiles) : "") ||
          (documentFiles.length > 0
            ? getDocumentFilesError(documentFiles)
            : "") ||
          (videoFile ? getVideoFileError(videoFile) : "")
        );
      }

      return (
        (await getImageFilesError(imageFiles)) ||
        getDocumentFilesError(documentFiles) ||
        getVideoFileError(videoFile)
      );
    }

    if (step === 1) {
      if (!formData.basicInformation.title.trim()) {
        return "Please add a property title.";
      }

      if (!formData.basicInformation.description.trim()) {
        return "Please add a property description.";
      }

      if (!formData.location.city.trim()) {
        return "Please add the city.";
      }

      if (!formData.location.district.trim()) {
        return "Please add the district.";
      }

      if (!formData.location.address.trim()) {
        return "Please add the address.";
      }

      if (!formData.pricing.monthlyRent) {
        return "Please add the monthly rent.";
      }

      if (formData.pricing.depositRequired && !formData.pricing.depositAmount) {
        return "Please add the deposit amount.";
      }
    }

    if (step === 2) {
      if (!formData.propertyDetails.propertyType) {
        return "Please choose a property type.";
      }

      if (!formData.propertyDetails.roomCount) {
        return "Please add the room count.";
      }

      if (!formData.propertyDetails.bathroomCount) {
        return "Please add the bathroom count.";
      }

      if (!formData.propertyDetails.area) {
        return "Please add the property area.";
      }

      if (!formData.livingSituation.rentalType) {
        return "Please choose a rental type.";
      }
    }

    return "";
  }

  async function handleSubmit() {
    const firstError =
      (await getStepError(0)) ||
      (await getStepError(1)) ||
      (await getStepError(2)) ||
      (await getStepError(3));

    if (firstError) {
      setError(firstError);
      return;
    }
    try {
      setIsSubmitting(true);
      setError("");

      const payload = cleanPayload(formData);
      let savedProperty;

      if (isEditMode) {
        savedProperty = await updateProperty(propertyToEdit._id, payload);

        const imageIdsToRemove = removedImageIds.filter(Boolean);
        const documentIdsToRemove = removedDocumentIds.filter(Boolean);
        const imageIdsToRemoveBeforeUpload =
          existingImages.length === 0 && imageFiles.length > 0
            ? imageIdsToRemove.slice(0, -1)
            : imageIdsToRemove;
        const imageIdsToRemoveAfterUpload =
          existingImages.length === 0 && imageFiles.length > 0
            ? imageIdsToRemove.slice(-1)
            : [];

        for (const imageId of imageIdsToRemoveBeforeUpload) {
          savedProperty = await deletePropertyImage(
            propertyToEdit._id,
            imageId,
          );
        }

        for (const documentId of documentIdsToRemove) {
          savedProperty = await deletePropertyDocument(
            propertyToEdit._id,
            documentId,
          );
        }

        if (imageFiles.length > 0) {
          savedProperty = await uploadPropertyImages(
            propertyToEdit._id,
            imageFiles,
          );
        }

        if (videoFile) {
          savedProperty = await uploadPropertyVideo(
            propertyToEdit._id,
            videoFile,
          );
        } else if (shouldRemoveVideo) {
          savedProperty = await deletePropertyVideo(propertyToEdit._id);
        }

        if (documentFiles.length > 0) {
          savedProperty = await uploadPropertyDocuments(
            propertyToEdit._id,
            documentFiles,
          );
        }

        for (const imageId of imageIdsToRemoveAfterUpload) {
          savedProperty = await deletePropertyImage(
            propertyToEdit._id,
            imageId,
          );
        }

        const savedImages = savedProperty.images || [];
        const savedCoverImageId = getCoverImageId(savedImages);
        const pendingCoverStillExists = savedImages.some(
          (image) => image._id === pendingCoverImageId,
        );

        if (
          pendingCoverStillExists &&
          pendingCoverImageId !== savedCoverImageId
        ) {
          savedProperty = await setPropertyCoverImage(
            propertyToEdit._id,
            pendingCoverImageId,
          );
        }

        onPropertyUpdated?.(savedProperty);
      } else {
        savedProperty = await createProperty(
          payload,
          imageFiles,
          documentFiles,
          videoFile,
        );

        onPropertyCreated?.(savedProperty);
      }

      onClose?.();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="property-form-backdrop" onMouseDown={handleBackdropClick}>
      <section className="property-form-popup">
        <button
          className="property-form-close"
          type="button"
          onClick={onClose}
          aria-label="Close property form"
        >
          ×
        </button>

        <div className="property-form-header">
          <p>{isEditMode ? "Owner listing edit" : "Owner listing"}</p>
          <h2>{isEditMode ? "Edit property" : "List a property"}</h2>
          <span>
            {isEditMode
              ? "Update the details renters need to understand your home."
              : "Add the details renters need to understand your home."}
          </span>
        </div>

        <ol className="property-form-progress" aria-label="Property form steps">
          {formSteps.map((step, index) => {
            const status =
              index < currentStep
                ? "completed"
                : index === currentStep
                  ? "active"
                  : "";

            return (
              <li key={step} className={status}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </li>
            );
          })}
        </ol>

        <div className="property-form-content">
          {currentStep === 0 && (
            <MediaStep
              imageFiles={imageFiles}
              documentFiles={documentFiles}
              videoFile={videoFile}
              existingImages={existingImages}
              existingDocuments={existingDocuments}
              existingVideo={existingVideo}
              onImagesChange={handleImagesChange}
              onDocumentsChange={handleDocumentsChange}
              onVideoChange={handleVideoChange}
              onRemoveImage={removeImageFile}
              onRemoveDocument={removeDocumentFile}
              onRemoveVideo={removeVideoFile}
              onRemoveExistingImage={removeExistingImage}
              onRemoveExistingDocument={removeExistingDocument}
              onRemoveExistingVideo={removeExistingVideo}
              onSetCoverImage={handleSetCoverImage}
              pendingCoverImageId={pendingCoverImageId}
            />
          )}

          {currentStep === 1 && (
            <BasicsStep
              formData={formData}
              handleInputChange={handleInputChange}
              handleNonNegativeNumberChange={handleNonNegativeNumberChange}
              handleCityChange={handleCityChange}
            />
          )}

          {currentStep === 2 && (
            <DetailsStep
              formData={formData}
              handleInputChange={handleInputChange}
              handleNonNegativeNumberChange={handleNonNegativeNumberChange}
              handleLivingSituationChange={handleLivingSituationChange}
            />
          )}

          {currentStep === 3 && (
            <RulesStep
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}
        </div>

        {error && <p className="property-form-error">{error}</p>}

        <div className="property-form-actions">
          {!isFirstStep && (
            <button
              className="property-form-nav previous"
              type="button"
              onClick={goToPreviousStep}
            >
              Previous
            </button>
          )}

          {!isLastStep ? (
            <button
              className="property-form-nav next"
              type="button"
              onClick={goToNextStep}
            >
              Next
            </button>
          ) : (
            <button
              className="property-form-submit"
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Submitting..."
                : isEditMode
                  ? "Save changes"
                  : "Submit property"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function MediaStep({
  imageFiles,
  documentFiles,
  videoFile,
  existingImages,
  existingDocuments,
  existingVideo,
  onImagesChange,
  onDocumentsChange,
  onVideoChange,
  onRemoveImage,
  onRemoveDocument,
  onRemoveVideo,
  onRemoveExistingImage,
  onRemoveExistingDocument,
  onRemoveExistingVideo,
  onSetCoverImage,
  pendingCoverImageId,
}) {
  return (
    <div className="property-form-step">
      <h3>Images and documents</h3>

      <p className="property-form-help">
        Upload property images, verification documents, and one video tour.
        Documents and video are for verification and will not be shown to
        renters.
      </p>

      <div className="property-file-box">
        <div className="property-file-header">
          <span>Property images</span>
          <p>{existingImages.length + imageFiles.length} files</p>
        </div>

        <label className="property-file-picker">
          Add files
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={onImagesChange}
          />
        </label>

        {imageFiles.length > 0 && (
          <MediaPreviewGrid files={imageFiles} onRemove={onRemoveImage} />
        )}

        {existingImages.length > 0 && (
          <ExistingMediaPreviewGrid
            files={existingImages}
            type="image"
            onRemove={onRemoveExistingImage}
            onSetCover={onSetCoverImage}
            pendingCoverImageId={pendingCoverImageId}
          />
        )}
      </div>

      <div className="property-file-box">
        <div className="property-file-header">
          <span>Property documents</span>
          <p>{existingDocuments.length + documentFiles.length} files</p>
        </div>

        <label className="property-file-picker">
          Add files
          <input
            type="file"
            accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={onDocumentsChange}
          />
        </label>

        {documentFiles.length > 0 && (
          <MediaPreviewGrid files={documentFiles} onRemove={onRemoveDocument} />
        )}

        {existingDocuments.length > 0 && (
          <ExistingMediaPreviewGrid
            files={existingDocuments}
            type="document"
            onRemove={onRemoveExistingDocument}
          />
        )}
      </div>

      <div className="property-file-box">
        <div className="property-file-header">
          <span>Video tour</span>
          <p>
            {videoFile
              ? videoFile.name
              : existingVideo
                ? "Existing video selected"
                : "No video selected"}
          </p>
        </div>

        <label className="property-file-picker">
          Choose file
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={onVideoChange}
          />
        </label>

        {videoFile && (
          <MediaPreviewGrid files={[videoFile]} onRemove={onRemoveVideo} />
        )}

        {existingVideo && !videoFile && (
          <ExistingMediaPreviewGrid
            files={[existingVideo]}
            type="video"
            onRemove={onRemoveExistingVideo}
          />
        )}
      </div>
    </div>
  );
}

function ExistingMediaPreviewGrid({
  files,
  type,
  onRemove,
  onSetCover,
  pendingCoverImageId = "",
}) {
  return (
    <div className="property-media-preview-grid">
      {files.map((file) => (
        <ExistingMediaPreviewItem
          key={getMediaId(file)}
          file={file}
          type={type}
          onRemove={() => onRemove(file)}
          onSetCover={onSetCover ? () => onSetCover(file) : undefined}
          isPendingCover={pendingCoverImageId === file._id}
        />
      ))}
    </div>
  );
}

function ExistingMediaPreviewItem({
  file,
  type,
  onRemove,
  onSetCover,
  isPendingCover,
}) {
  const isImage = type === "image";
  const isVideo = type === "video";
  const label = file.originalName || file.format || "Existing file";
  const canSetCover = isImage && onSetCover && !isPendingCover;

  return (
    <div
      className={`property-media-preview-item ${
        file.isCover ? "is-cover" : ""
      }`.trim()}
    >
      <button
        type="button"
        className="property-media-remove"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        x
      </button>

      {isImage && file.url && <img src={file.url} alt={label} />}

      {isImage && (
        <button
          type="button"
          className={`property-media-cover ${
            isPendingCover ? "active" : ""
          }`.trim()}
          onClick={canSetCover ? onSetCover : undefined}
          disabled={!canSetCover}
          aria-label={
            isPendingCover
              ? `${label} is selected as the cover image`
              : `Make ${label} cover`
          }
          title={isPendingCover ? "Selected cover" : "Make cover"}
        >
          <img src={coverIcon} alt="" />
          <span>{isPendingCover ? "Cover" : ""}</span>
        </button>
      )}

      {isVideo && file.url && <video src={file.url} muted />}

      {!isImage && !isVideo && (
        <div className="property-media-file-icon">
          {file.format?.toUpperCase() || "DOC"}
        </div>
      )}

      <div className="property-media-file-info">
        <span>{label}</span>
        <small>
          {file.bytes ? formatFileSize(file.bytes) : "Already uploaded"}
        </small>
      </div>
    </div>
  );
}

function MediaPreviewGrid({ files, onRemove }) {
  return (
    <div className="property-media-preview-grid">
      {files.map((file, index) => (
        <MediaPreviewItem
          key={`${file.name}-${file.size}-${index}`}
          file={file}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
}

function MediaPreviewItem({ file, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";

  const previewUrl = useMemo(() => {
    return isImage || isVideo ? URL.createObjectURL(file) : "";
  }, [file, isImage, isVideo]);

  useEffect(() => {
    if (!previewUrl) return undefined;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="property-media-preview-item">
      <button
        type="button"
        className="property-media-remove"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        ×
      </button>

      {isImage && previewUrl && <img src={previewUrl} alt={file.name} />}

      {isVideo && previewUrl && <video src={previewUrl} muted />}

      {!isImage && !isVideo && (
        <div className="property-media-file-icon">{isPdf ? "PDF" : "DOC"}</div>
      )}

      <div className="property-media-file-info">
        <span>{file.name}</span>
        <small>{formatFileSize(file.size)}</small>
      </div>
    </div>
  );
}

function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function BasicsStep({
  formData,
  handleInputChange,
  handleNonNegativeNumberChange,
  handleCityChange,
}) {
  const availableDistricts = districtsByCity[formData.location.city] || [];
  return (
    <div className="property-form-step">
      <h3>Basic information</h3>

      <div className="property-form-grid">
        <Field label="Title">
          <input
            value={formData.basicInformation.title}
            onChange={(event) =>
              handleInputChange("basicInformation", "title", event)
            }
            placeholder="Bright apartment in Saburtalo"
          />
        </Field>

        <Field label="Monthly rent">
          <input
            type="number"
            min="0"
            value={formData.pricing.monthlyRent}
            onKeyDown={preventNegativeNumberKey}
            onChange={(event) =>
              handleNonNegativeNumberChange("pricing", "monthlyRent", event)
            }
            placeholder="1200"
          />
        </Field>

        <Field label="Currency">
          <select
            value={formData.pricing.currency}
            onChange={(event) =>
              handleInputChange("pricing", "currency", event)
            }
          >
            <option value="GEL">GEL</option>
            <option value="USD" disabled>
              USD
            </option>
            <option value="EUR" disabled>
              EUR
            </option>
          </select>
        </Field>

        <Field label="Deposit amount">
          <input
            type="number"
            min="0"
            value={formData.pricing.depositAmount}
            onKeyDown={preventNegativeNumberKey}
            onChange={(event) =>
              handleNonNegativeNumberChange("pricing", "depositAmount", event)
            }
            placeholder="1200"
            disabled={!formData.pricing.depositRequired}
          />
        </Field>
      </div>

      <label className="property-form-checkbox property-deposit-checkbox">
        <input
          type="checkbox"
          checked={formData.pricing.depositRequired}
          onChange={(event) =>
            handleInputChange("pricing", "depositRequired", event)
          }
        />
        Deposit required
      </label>

      <Field label="Description">
        <textarea
          value={formData.basicInformation.description}
          onChange={(event) =>
            handleInputChange("basicInformation", "description", event)
          }
          placeholder="Describe the property, neighborhood, light, furniture, and useful details."
          rows="5"
        />
      </Field>

      <h3 className="location-title">Location</h3>

      <div className="property-form-grid">
        <Field label="City">
          <select value={formData.location.city} onChange={handleCityChange}>
            <option value="">Select city</option>
            {Object.keys(districtsByCity).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>

        <Field label="District">
          <select
            value={formData.location.district}
            onChange={(event) =>
              handleInputChange("location", "district", event)
            }
            disabled={!formData.location.city}
          >
            <option value="">Select district</option>
            {availableDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Address">
          <input
            value={formData.location.address}
            onChange={(event) =>
              handleInputChange("location", "address", event)
            }
            placeholder="Example Street 12"
          />
        </Field>
      </div>

      <CheckboxGroup
        title="Nearby"
        section="location"
        options={nearbyOptions}
        formData={formData}
        handleInputChange={handleInputChange}
      />
    </div>
  );
}

function DetailsStep({
  formData,
  handleInputChange,
  handleNonNegativeNumberChange,
  handleLivingSituationChange,
}) {
  return (
    <div className="property-form-step">
      <h3>Property details</h3>

      <div className="property-form-grid">
        <Field label="Property type">
          <select
            value={formData.propertyDetails.propertyType}
            onChange={(event) =>
              handleInputChange("propertyDetails", "propertyType", event)
            }
          >
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="duplex">Duplex</option>
          </select>
        </Field>

        <Field label="Room count">
          <select
            value={formData.propertyDetails.roomCount}
            onChange={(event) =>
              handleInputChange("propertyDetails", "roomCount", event)
            }
          >
            <option value="">Select rooms</option>
            <option value="0">Studio</option>
            <option value="1">1 room</option>
            <option value="2">2 rooms</option>
            <option value="3">3 rooms</option>
            <option value="4">4 rooms</option>
            <option value="5">5 rooms</option>
            <option value="6">6+ rooms</option>
          </select>
        </Field>

        <Field label="Bathroom count">
          <select
            value={formData.propertyDetails.bathroomCount}
            onChange={(event) =>
              handleInputChange("propertyDetails", "bathroomCount", event)
            }
          >
            <option value="">Select bathrooms</option>
            <option value="1">1 bathroom</option>
            <option value="2">2 bathrooms</option>
            <option value="3">3 bathrooms</option>
            <option value="4">4+ bathrooms</option>
          </select>
        </Field>

        <Field label="Area">
          <input
            type="number"
            min="0"
            value={formData.propertyDetails.area}
            onKeyDown={preventNegativeNumberKey}
            onChange={(event) =>
              handleNonNegativeNumberChange("propertyDetails", "area", event)
            }
            placeholder="75"
          />
        </Field>

        <Field label="Floor">
          <input
            type="number"
            min="0"
            value={formData.propertyDetails.floor}
            onKeyDown={preventNegativeNumberKey}
            onChange={(event) =>
              handleNonNegativeNumberChange("propertyDetails", "floor", event)
            }
            placeholder="6"
          />
        </Field>

        <Field label="Total floors">
          <input
            type="number"
            min="0"
            value={formData.propertyDetails.totalFloors}
            onKeyDown={preventNegativeNumberKey}
            onChange={(event) =>
              handleNonNegativeNumberChange(
                "propertyDetails",
                "totalFloors",
                event,
              )
            }
            placeholder="12"
          />
        </Field>

        <Field label="Living situation">
          <select
            value={getLivingSituationValue(formData.livingSituation)}
            onChange={handleLivingSituationChange}
          >
            <option value="entire-property">Entire property</option>
            <option value="shared-any">Shared apartment - any roommates</option>
            <option value="shared-female">
              Shared apartment - female roommates
            </option>
            <option value="shared-male">
              Shared apartment - male roommates
            </option>
          </select>
        </Field>
      </div>

      <div className="property-form-check-group property-form-centered-group">
        <h3>Building details</h3>

        <div className="property-form-options centered">
          <label className="property-form-option">
            <input
              type="checkbox"
              checked={formData.propertyDetails.furnished}
              onChange={(event) =>
                handleInputChange("propertyDetails", "furnished", event)
              }
            />
            <span>Furnished</span>
          </label>

          <label className="property-form-option">
            <input
              type="checkbox"
              checked={formData.propertyDetails.newBuilding}
              onChange={(event) =>
                handleInputChange("propertyDetails", "newBuilding", event)
              }
            />
            <span>New building</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function RulesStep({ formData, handleInputChange }) {
  return (
    <div className="property-form-step">
      <CheckboxGroup
        title="Tenant rules"
        section="tenantRules"
        options={tenantRuleOptions}
        formData={formData}
        handleInputChange={handleInputChange}
      />

      <CheckboxGroup
        title="Features"
        section="features"
        options={featureOptions}
        formData={formData}
        handleInputChange={handleInputChange}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="property-form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function CheckboxGroup({
  title,
  section,
  options,
  formData,
  handleInputChange,
}) {
  return (
    <div className="property-form-check-group">
      <h3>{title}</h3>

      <div className="property-form-options">
        {options.map(([field, label]) => (
          <label key={field} className="property-form-option">
            <input
              type="checkbox"
              checked={formData[section][field]}
              onChange={(event) => handleInputChange(section, field, event)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default PropertyFormPopup;
