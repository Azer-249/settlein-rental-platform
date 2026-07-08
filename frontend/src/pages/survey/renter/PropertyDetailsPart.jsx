const roomOptions = [
  { value: 0, label: "Studio", shortLabel: "Studio" },
  { value: 1, label: "1 room", shortLabel: "1" },
  { value: 2, label: "2 rooms", shortLabel: "2" },
  { value: 3, label: "3 rooms", shortLabel: "3" },
  { value: 4, label: "4 rooms", shortLabel: "4" },
  { value: 5, label: "5 rooms", shortLabel: "5" },
  { value: 6, label: "6+ rooms", shortLabel: "6+" },
];

const bathroomOptions = [
  { value: 1, label: "1 bathroom", shortLabel: "1" },
  { value: 2, label: "2 bathrooms", shortLabel: "2" },
  { value: 3, label: "3 bathrooms", shortLabel: "3" },
  { value: 4, label: "4+ bathrooms", shortLabel: "4+" },
];

function PropertyDetailsSection({ formData, setFormData }) {
  const propertyDetails = formData.propertyDetails;

  const propertyTypeOptions = [
    { name: "villa", label: "House" },
    { name: "duplex", label: "Duplex" },
    { name: "apartment", label: "Apartment" },
  ];

  const preferenceOptions = [
    { name: "firstFloor", label: "First floor" },
    { name: "lastFloor", label: "Last floor" },
    { name: "furnished", label: "Furnished" },
    { name: "newBuilding", label: "New building" },
  ];

  function handleValueChange(event) {
    const { name, value, type, checked } = event.target;

    const numericFields = ["minArea", "maxArea"];

    const cleanedValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;

    setFormData((previous) => ({
      ...previous,
      propertyDetails: {
        ...previous.propertyDetails,
        [name]: type === "checkbox" ? checked : cleanedValue,
      },
    }));
  }

  function handleArraySelection(field, value, checked) {
    setFormData((previous) => ({
      ...previous,
      propertyDetails: {
        ...previous.propertyDetails,
        [field]: checked
          ? [...previous.propertyDetails[field], value]
          : previous.propertyDetails[field].filter((item) => item !== value),
      },
    }));
  }

  const areaIsInvalid =
    propertyDetails.minArea !== "" &&
    propertyDetails.maxArea !== "" &&
    Number(propertyDetails.maxArea) < Number(propertyDetails.minArea);

  return (
    <section>
      <h2>Tell us about your ideal property</h2>

      <div className="count-selection-list">
        <div
          className="count-selection-row"
          role="group"
          aria-labelledby="room-count-question"
        >
          <p id="room-count-question">How many rooms do you need?</p>

          <div className="count-options">
            {roomOptions.map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  aria-label={option.label}
                  checked={propertyDetails.roomCount.includes(option.value)}
                  onChange={(event) =>
                    handleArraySelection(
                      "roomCount",
                      option.value,
                      event.target.checked,
                    )
                  }
                />
                {option.shortLabel}
              </label>
            ))}
          </div>
        </div>

        <div
          className="count-selection-row"
          role="group"
          aria-labelledby="bathroom-count-question"
        >
          <p id="bathroom-count-question">How many bathrooms do you need?</p>

          <div className="count-options">
            {bathroomOptions.map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  aria-label={option.label}
                  checked={propertyDetails.bathroomCount.includes(option.value)}
                  onChange={(event) =>
                    handleArraySelection(
                      "bathroomCount",
                      option.value,
                      event.target.checked,
                    )
                  }
                />
                {option.shortLabel}
              </label>
            ))}
          </div>
        </div>
      </div>

      <fieldset>
        <legend>What size should the property be?</legend>

        <div className="area-inputs">
          <div>
            <label htmlFor="minimum-area">Minimum area (m²)</label>
            <input
              id="minimum-area"
              name="minArea"
              type="text"
              inputMode="numeric"
              value={propertyDetails.minArea}
              onChange={handleValueChange}
            />
          </div>

          <div>
            <label htmlFor="maximum-area">Maximum area (m²)</label>
            <input
              id="maximum-area"
              name="maxArea"
              type="text"
              inputMode="numeric"
              value={propertyDetails.maxArea}
              onChange={handleValueChange}
            />
          </div>
        </div>

        {areaIsInvalid && (
          <p role="alert">Maximum area cannot be lower than minimum area.</p>
        )}
      </fieldset>

      <fieldset>
        <legend>What types of property are you looking for?</legend>

        {propertyTypeOptions.map((type) => (
          <label key={type.name}>
            <input
              type="checkbox"
              name={type.name}
              checked={propertyDetails[type.name]}
              onChange={handleValueChange}
            />
            {type.label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Do you have any other preferences?</legend>

        {preferenceOptions.map((preference) => (
          <label key={preference.name}>
            <input
              type="checkbox"
              name={preference.name}
              checked={propertyDetails[preference.name]}
              onChange={handleValueChange}
            />
            {preference.label}
          </label>
        ))}
      </fieldset>
    </section>
  );
}

export default PropertyDetailsSection;
