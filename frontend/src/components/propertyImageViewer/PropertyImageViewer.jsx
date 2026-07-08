import { useState } from "react";
import galleryIcon from "../../assets/icons/media-photo-gallery.svg";
import "./PropertyImageViewer.css";

function PropertyImageViewer({ images = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!images.length) {
    return null;
  }

  const currentImage = images[currentIndex];

  function showPreviousImage() {
    setCurrentIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  }

  function showNextImage() {
    setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  return (
    <div className="image-viewer-backdrop" onMouseDown={handleBackdropClick}>
      <section className="image-viewer" aria-label="Property image viewer">
        <button
          className="image-viewer-close"
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
        >
          ×
        </button>

        <div className="image-viewer-main">
          {images.length > 1 && (
            <button
              className="image-viewer-arrow previous"
              type="button"
              onClick={showPreviousImage}
              aria-label="Show previous image"
            >
              ‹
            </button>
          )}

          <div className="image-viewer-image-frame">
            <img
              src={currentImage.url}
              alt={`Property image ${currentIndex + 1}`}
              className="image-viewer-image"
            />

            <span className="image-viewer-count">
              <img
                src={galleryIcon}
                className="image-viewer-count-icon"
                alt=""
              />
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {images.length > 1 && (
            <button
              className="image-viewer-arrow next"
              type="button"
              onClick={showNextImage}
              aria-label="Show next image"
            >
              ›
            </button>
          )}
        </div>

        <div className="image-viewer-footer">
          <div className="image-viewer-thumbnails">
            {images.map((image, index) => (
              <button
                key={image._id || image.publicId || image.url}
                className={`image-viewer-thumbnail ${
                  index === currentIndex ? "active" : ""
                }`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show image ${index + 1}`}
              >
                <img src={image.url} alt="" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PropertyImageViewer;
