// auth.js
export function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function logout(redirectPath = "/login") {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  // optionally remove other custom keys...
  window.location.href = redirectPath;
}
