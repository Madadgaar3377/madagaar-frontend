// auth.js - Madadgaar Authentication Utilities

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!(localStorage.getItem("authToken") || localStorage.getItem("access_token"));
}

/**
 * Get authentication token
 * @returns {string|null}
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken") || localStorage.getItem("access_token");
}

/**
 * Get current user data
 * @returns {Object|null}
 */
export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

/**
 * Get user type
 * @returns {string} - "user", "admin", "agent", "partner"
 */
export function getUserType() {
  const user = getUser();
  return user?.UserType || user?.userType || "user";
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
export function isAdmin() {
  const userType = getUserType();
  return userType === "admin";
}

/**
 * Check if user is regular user
 * @returns {boolean}
 */
export function isRegularUser() {
  const userType = getUserType();
  return userType === "user";
}

/**
 * Logout user and clear all auth data
 * @param {string} redirectPath - Path to redirect after logout
 */
export function logout(redirectPath = "/account") {
  if (typeof window === "undefined") return;

  localStorage.removeItem("authToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("authData");

  localStorage.removeItem("dashboardData");
  localStorage.removeItem("dashboardDataTime");

  window.location.href = redirectPath;
}

/**
 * Clear dashboard cache (call when data changes)
 */
export function clearDashboardCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("dashboardData");
  localStorage.removeItem("dashboardDataTime");
}

/**
 * Set authentication data
 * @param {string} token
 * @param {Object} user
 */
export function setAuthData(token, user) {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("access_token", token);
  }

  if (user) {
    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.verificationOtp;
    delete safeUser.passwordResetOtp;
    delete safeUser.verificationOtpExpiryTime;
    delete safeUser.passwordResetOtpExpiryTime;

    localStorage.setItem("user", JSON.stringify(safeUser));
  }
}
