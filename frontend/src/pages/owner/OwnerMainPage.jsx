import { useEffect, useState } from "react";
import { getMyProperties } from "../../services/propertyApi";
import Navbar from "../../components/Navbar";
import DashboardCard from "../../components/dashboardCard/DashboardCard";
import ownerIllustration from "../../assets/myproperty-illustration.png";
import houseIcon from "../../assets/icons/property-house.svg";
import PropertyFormPopup from "../../components/propertyFormPopup/PropertyFormPopup";
import PropertyDetailsPopup from "../../components/propertyDetailsPopup/PropertyDetailsPopup";
import "./OwnerMainPage.css";

function OwnerHomePage() {
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [propertiesError, setPropertiesError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        setIsLoadingProperties(true);
        setPropertiesError("");

        const ownerProperties = await getMyProperties();
        setProperties(ownerProperties);
      } catch (error) {
        setPropertiesError(error.message);
      } finally {
        setIsLoadingProperties(false);
      }
    }

    loadProperties();
  }, []);

  return (
    <div className="owner-page">
      <Navbar ariaLabel="Owner navigation" />

      <main className="owner-main">
        <div className="owner-hero-wrap">
          <section className="owner-hero">
            <div className="owner-hero-text">
              <p>Owner dashboard</p>
              <h1>Your properties, ready to settle in</h1>
              <span>
                Add new listings, track approval status, and keep every home’s
                details organized in one cozy place.
              </span>
            </div>

            <div className="owner-hero-art">
              <img src={ownerIllustration} alt="" />
            </div>
          </section>
        </div>

        <section className="owner-properties-board">
          <div className="owner-board-tab">
            <img
              src={houseIcon}
              className="dashboard-tab-icon tab-house-icon"
              alt=""
            />
            <span>My Properties</span>
          </div>

          {isLoadingProperties ? (
            <div className="owner-empty-state">
              <h2>Loading properties...</h2>
              <p>We're getting your listings ready.</p>
            </div>
          ) : propertiesError ? (
            <div className="owner-empty-state">
              <h2>Could not load properties</h2>
              <p>{propertiesError}</p>
            </div>
          ) : properties.length > 0 ? (
            <div className="owner-properties-grid">
              {properties.map((property) => (
                <DashboardCard
                  key={property._id}
                  property={property}
                  onClick={setSelectedProperty}
                />
              ))}
            </div>
          ) : (
            <div className="owner-empty-state">
              <h2>No properties yet</h2>
              <p>Your first listing will appear here once you add it.</p>
            </div>
          )}
        </section>

        <button
          type="button"
          className="owner-add-property"
          onClick={() => {
            setPropertyToEdit(null);
            setIsPropertyFormOpen(true);
          }}
        >
          <span>+</span>
          <strong>List a property</strong>
        </button>
      </main>
      {isPropertyFormOpen && (
        <PropertyFormPopup
          propertyToEdit={propertyToEdit}
          onClose={() => {
            setIsPropertyFormOpen(false);
            setPropertyToEdit(null);
          }}
          onPropertyCreated={(property) =>
            setProperties((currentProperties) => [
              property,
              ...currentProperties,
            ])
          }
          onPropertyUpdated={(updatedProperty) => {
            setProperties((currentProperties) =>
              currentProperties.map((property) =>
                property._id === updatedProperty._id
                  ? updatedProperty
                  : property,
              ),
            );
            setSelectedProperty(updatedProperty);
          }}
        />
      )}

      {selectedProperty && (
        <PropertyDetailsPopup
          key={selectedProperty._id}
          property={selectedProperty}
          mode="owner"
          onClose={() => setSelectedProperty(null)}
          onEdit={(property) => {
            setPropertyToEdit(property);
            setSelectedProperty(null);
            setIsPropertyFormOpen(true);
          }}
          onPropertyUpdated={(updatedProperty) => {
            setProperties((currentProperties) =>
              currentProperties.map((property) =>
                property._id === updatedProperty._id
                  ? updatedProperty
                  : property,
              ),
            );
            setSelectedProperty(updatedProperty);
          }}
          onPropertyDeleted={(propertyId) => {
            setProperties((currentProperties) =>
              currentProperties.filter((property) => property._id !== propertyId),
            );
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
}

export default OwnerHomePage;
