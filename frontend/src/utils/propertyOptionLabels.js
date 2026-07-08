export const nearbyOptions = [
  ["nearMall", "Near mall"],
  ["nearPark", "Near park"],
  ["nearMetro", "Near metro"],
  ["nearHospital", "Near hospital"],
  ["nearBusStop", "Near bus stop"],
  ["cityCenter", "City center"],
];

export const tenantRuleOptions = [
  ["acceptsStudents", "Accepts students"],
  ["acceptsFamilies", "Accepts families"],
  ["acceptsPets", "Accepts pets"],
  ["allowsSmoking", "Allows smoking"],
  ["nightlifeFriendly", "Nightlife friendly"],
  ["quietLifestyle", "Quiet lifestyle"],
  ["allowsShortTerm", "Allows short-term"],
  ["allowsLongTerm", "Allows long-term"],
];

export const featureOptions = [
  ["wifi", "Wi-Fi"],
  ["balcony", "Balcony"],
  ["parkingArea", "Parking area"],
  ["elevator", "Elevator"],
  ["airConditioner", "Air conditioner"],
  ["heatingSystem", "Heating system"],
  ["washingMachine", "Washing machine"],
  ["dryer", "Dryer"],
  ["dishwasher", "Dishwasher"],
  ["kitchenEquipment", "Kitchen equipment"],
  ["refrigerator", "Refrigerator"],
  ["microwave", "Microwave"],
  ["tv", "TV"],
  ["privateBathroom", "Private bathroom"],
  ["securityCameras", "Security cameras"],
  ["gatedBuilding", "Gated building"],
  ["garden", "Garden"],
  ["terrace", "Terrace"],
  ["storageRoom", "Storage room"],
  ["swimmingPool", "Swimming pool"],
  ["gymAccess", "Gym access"],
];

export const nearbyLabels = Object.fromEntries(nearbyOptions);
export const tenantRuleLabels = Object.fromEntries(tenantRuleOptions);
export const featureLabels = Object.fromEntries(featureOptions);
