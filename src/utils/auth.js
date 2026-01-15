// auth.js - Madadgaar Authentication Utilities

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!(localStorage.getItem("authToken") || localStorage.getItem("access_token"));
}

/**
 * Get authentication token
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem("authToken") || localStorage.getItem("access_token");
}

/**
 * Get current user data
 * @returns {Object|null}
 */
export function getUser() {
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
  // Clear all authentication-related data
  localStorage.removeItem("authToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("authData");
  
  // Redirect to login
  window.location.href = redirectPath;
}

/**
 * Set authentication data
 * @param {string} token 
 * @param {Object} user 
 */
export function setAuthData(token, user) {
  if (token) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("access_token", token);
  }
  
  if (user) {
    // Sanitize user data before storing
    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.verificationOtp;
    delete safeUser.passwordResetOtp;
    delete safeUser.verificationOtpExpiryTime;
    delete safeUser.passwordResetOtpExpiryTime;
    
    localStorage.setItem("user", JSON.stringify(safeUser));
  }
}
