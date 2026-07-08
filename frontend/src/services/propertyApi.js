const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function getToken() {
  return localStorage.getItem("settleInToken");
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export async function getApprovedProperties() {
  const response = await request("/api/properties");

  return response.data.properties;
}

export async function getRenterFeed(limit = 20) {
  const response = await request(`/api/renter-feed?limit=${limit}`);

  return response.data.matches;
}

export async function rejectRenterFeedProperty(propertyId) {
  const response = await request(`/api/renter-feed/${propertyId}/reject`, {
    method: "POST",
  });

  return response.data.interaction;
}

export async function markRenterFeedInterest(propertyId) {
  const response = await request(`/api/renter-feed/${propertyId}/interest`, {
    method: "POST",
  });

  return response.data.interest;
}

export async function getMyRenterInterests() {
  const response = await request("/api/renter-interests/me");

  return response.data.interests;
}

export async function withdrawRenterInterest(interestId) {
  const response = await request(`/api/renter-interests/${interestId}`, {
    method: "DELETE",
  });

  return response.data.interest;
}

export async function getPropertyInterests(propertyId) {
  const response = await request(`/api/properties/${propertyId}/interests`);

  return response.data.interests;
}

export async function approvePropertyInterest(propertyId, interestId) {
  const response = await request(
    `/api/properties/${propertyId}/interests/${interestId}/approve`,
    {
      method: "PATCH",
    },
  );

  return response.data.interest;
}

export async function rejectPropertyInterest(propertyId, interestId) {
  const response = await request(
    `/api/properties/${propertyId}/interests/${interestId}/reject`,
    {
      method: "PATCH",
    },
  );

  return response.data.interest;
}

export async function getMyProperties() {
  const response = await request("/api/properties/mine");

  return response.data.properties;
}

export async function getPropertyById(propertyId) {
  const response = await request(`/api/properties/${propertyId}`);

  return response.data;
}

export async function createProperty(
  propertyData,
  imageFiles,
  documentFiles,
  videoFile,
) {
  const formData = new FormData();

  formData.append("propertyData", JSON.stringify(propertyData));

  imageFiles.forEach((image) => {
    formData.append("images", image);
  });

  documentFiles.forEach((document) => {
    formData.append("documents", document);
  });

  formData.append("video", videoFile);

  const response = await request("/api/properties", {
    method: "POST",
    body: formData,
  });

  return response.data.property;
}

export async function updateProperty(propertyId, payload) {
  const response = await request(`/api/properties/${propertyId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data.property;
}

export async function uploadPropertyImages(propertyId, files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await request(`/api/properties/${propertyId}/images`, {
    method: "POST",
    body: formData,
  });

  return response.data.property;
}

export async function uploadPropertyDocuments(propertyId, files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("documents", file);
  });

  const response = await request(`/api/properties/${propertyId}/documents`, {
    method: "POST",
    body: formData,
  });

  return response.data.property;
}

export async function uploadPropertyVideo(propertyId, file) {
  const formData = new FormData();

  formData.append("video", file);

  const response = await request(`/api/properties/${propertyId}/video-tour`, {
    method: "POST",
    body: formData,
  });

  return response.data.property;
}

export async function deletePropertyImage(propertyId, imageId) {
  const response = await request(
    `/api/properties/${propertyId}/images/${imageId}`,
    {
      method: "DELETE",
    },
  );

  return response.data.property;
}

export async function setPropertyCoverImage(propertyId, imageId) {
  const response = await request(
    `/api/properties/${propertyId}/images/${imageId}/cover`,
    {
      method: "PATCH",
    },
  );

  return response.data.property;
}

export async function deletePropertyVideo(propertyId) {
  const response = await request(`/api/properties/${propertyId}/video-tour`, {
    method: "DELETE",
  });

  return response.data.property;
}

export async function deletePropertyDocument(propertyId, documentId) {
  const response = await request(
    `/api/properties/${propertyId}/documents/${documentId}`,
    {
      method: "DELETE",
    },
  );

  return response.data.property;
}

export async function deleteProperty(propertyId) {
  await request(`/api/properties/${propertyId}`, {
    method: "DELETE",
  });
}

export async function getPendingModerationProperties() {
  const response = await request("/api/moderation/properties/pending");

  return response.data.properties;
}

export async function approveModerationProperty(propertyId) {
  const response = await request(
    `/api/moderation/properties/${propertyId}/approve`,
    {
      method: "PATCH",
    },
  );

  return response.data.property;
}

export async function rejectModerationProperty(propertyId, rejectionReason) {
  const response = await request(
    `/api/moderation/properties/${propertyId}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ rejectionReason }),
    },
  );

  return response.data.property;
}
