const renterLifeGroups = [
  {
    key: "lifestyle",
    title: "Lifestyle",
    options: [
      { name: "smoker", label: "Smoker" },
      { name: "petOwner", label: "Pet owner" },
      { name: "nightlifeFriendly", label: "Nightlife-friendly" },
      { name: "quietLifestyle", label: "Quiet lifestyle" },
      { name: "studentFriendly", label: "Student-friendly" },
      { name: "familyFriendly", label: "Family-friendly" },
    ],
  },
  {
    key: "livingSituation",
    title: "Living situation",
    options: [
      { name: "livingAlone", label: "Living alone" },
      { name: "family", label: "Living with family" },
      { name: "sharedApartment", label: "Shared apartment" },
      { name: "femaleRoommates", label: "Female roommates" },
      { name: "maleRoommates", label: "Male roommates" },
      { name: "longTermStay", label: "Long-term stay" },
      { name: "shortTermStay", label: "Short-term stay" },
    ],
  },
  {
    key: "features",
    title: "Desired features",
    options: [
      { name: "wifi", label: "Wi-Fi" },
      { name: "balcony", label: "Balcony" },
      { name: "parkingArea", label: "Parking area" },
      { name: "elevator", label: "Elevator" },
      { name: "airConditioner", label: "Air conditioner" },
      { name: "heatingSystem", label: "Heating system" },
      { name: "washingMachine", label: "Washing machine" },
      { name: "dryer", label: "Dryer" },
      { name: "dishwasher", label: "Dishwasher" },
      { name: "kitchenEquipment", label: "Kitchen equipment" },
      { name: "refrigerator", label: "Refrigerator" },
      { name: "microwave", label: "Microwave" },
      { name: "tv", label: "TV" },
      { name: "privateBathroom", label: "Private bathroom" },
      { name: "securityCameras", label: "Security cameras" },
      { name: "gatedBuilding", label: "Gated building" },
      { name: "garden", label: "Garden" },
      { name: "terrace", label: "Terrace" },
      { name: "storageRoom", label: "Storage room" },
      { name: "swimmingPool", label: "Swimming pool" },
      { name: "gymAccess", label: "Gym access" },
    ],
  },
];

function RenterLifeSection({ formData, setFormData }) {
  function handleLifeChange(section, event) {
    const { name, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [name]: checked,
      },
    }));
  }

  return (
    <section>
      <h2>Tell us more about your lifestyle</h2>

      {renterLifeGroups.map((group) => (
        <fieldset key={group.key}>
          <legend>{group.title}</legend>

          <div className="dropdown-options">
            {group.options.map((option) => (
              <label key={option.name}>
                <input
                  type="checkbox"
                  name={option.name}
                  checked={formData[group.key][option.name]}
                  onChange={(event) => handleLifeChange(group.key, event)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </section>
  );
}

export default RenterLifeSection;
