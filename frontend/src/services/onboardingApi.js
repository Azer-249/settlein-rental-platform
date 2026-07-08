const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function authenticatedRequest(path, options = {}) {
  const token = localStorage.getItem("settleInToken");

  if (!token) {
    throw new Error("Please sign in before submitting the survey.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export async function getMe() {
  const result = await authenticatedRequest("/api/auth/me");

  return result.data.user;
}

export async function submitOnboarding(role, payload) {
  const endpoint =
    role === "renter" ? "/api/renter-preferences" : "/api/owner-profile";

  const result = await authenticatedRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const freshUser = await getMe();

  return {
    ...result,
    user: freshUser,
  };
}

export async function getMyRenterPreferences() {
  const result = await authenticatedRequest("/api/renter-preferences/me");

  return result.data.preferences;
}

export async function updateMyRenterPreferences(payload) {
  const result = await authenticatedRequest("/api/renter-preferences/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return result.data.preferences;
}

export async function updateMyRole(role) {
  const roleResponse = await authenticatedRequest("/api/auth/me/role", {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

  return roleResponse.data.user;
}
