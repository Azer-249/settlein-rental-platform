function LocationSection({ formData, setFormData }) {
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

  const nearbyOptions = [
    { name: "nearMetro", label: "Near a metro station" },
    { name: "nearBusStop", label: "Near a bus stop" },
    { name: "nearMall", label: "Near a mall" },
    { name: "nearPark", label: "Near a park" },
    { name: "nearHospital", label: "Near a hospital" },
    { name: "cityCenter", label: "In the city center" },
  ];

  function handleCityChange(event) {
    const city = event.target.value;

    setFormData((previous) => ({
      ...previous,
      location: {
        ...previous.location,
        city,
        districts: [],
        nearMetro: city === "Tbilisi" ? previous.location.nearMetro : false,
      },
    }));
  }

  function handleDistrictChange(event) {
    const { value, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      location: {
        ...previous.location,
        districts: checked
          ? [...previous.location.districts, value]
          : previous.location.districts.filter(
              (district) => district !== value,
            ),
      },
    }));
  }

  function handleNearbyChange(event) {
    const { name, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      location: {
        ...previous.location,
        [name]: checked,
      },
    }));
  }

  const availableDistricts = districtsByCity[formData.location.city] || [];

  return (
    <section>
      <h2>Where would you like to live?</h2>

      <label htmlFor="city">City</label>
      <select
        id="city"
        value={formData.location.city}
        onChange={handleCityChange}
      >
        <option value="">Select a city</option>

        {Object.keys(districtsByCity).map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {formData.location.city && (
        <fieldset>
          <legend>Select one or more areas</legend>

          {availableDistricts.map((district) => (
            <label key={district}>
              <input
                type="checkbox"
                value={district}
                checked={formData.location.districts.includes(district)}
                onChange={handleDistrictChange}
              />
              {district}
            </label>
          ))}
        </fieldset>
      )}

      <fieldset>
        <legend>What would you like nearby?</legend>

        {nearbyOptions
          .filter(
            (option) =>
              option.name !== "nearMetro" ||
              formData.location.city === "Tbilisi",
          )
          .map((option) => (
            <label key={option.name}>
              <input
                type="checkbox"
                name={option.name}
                checked={formData.location[option.name]}
                onChange={handleNearbyChange}
              />
              {option.label}
            </label>
          ))}
      </fieldset>
    </section>
  );
}

export default LocationSection;
