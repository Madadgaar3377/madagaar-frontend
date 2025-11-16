import React, { useState, useEffect } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { isAuthenticated } from "../utils/auth";

export default function LoginPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");

  useEffect(() => {
    // If the user already has a token, redirect to dashboard
    if (isAuthenticated()) {
      window.location.href = "/dashboard";
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        // Backend may return field-level errors under data.error
        if (data && data.error) {
          // Map known backend keys to our fields
          const errs = {};
          if (data.error.passwordError) errs.password = data.error.passwordError;
          if (data.error.numberError) errs.email = data.error.numberError; // backend used 'numberError' for invalid credentials
          if (Object.keys(errs).length) {
            setFieldErrors(errs);
          } else {
            setGeneralError(data.error.message || JSON.stringify(data.error) || "Login failed");
          }
        } else {
          setGeneralError(`Login failed (${res.status})`);
        }
        setLoading(false);
        return;
      }

      // success
      const token = data?.access_token || data?.token || data?.accessToken;
      if (token) {
        // Keep backward-compatible key and a more explicit key
        localStorage.setItem("authToken", token);
        localStorage.setItem("access_token", token);
      }
      // optional refresh token
      if (data?.refresh_token || data?.refreshToken) {
        localStorage.setItem("refresh_token", data?.refresh_token || data?.refreshToken);
      }
        // Store user and full auth data, but remove sensitive fields before saving
        if (data) {
          try {
            const fullData = JSON.parse(JSON.stringify(data));
            if (fullData.user && typeof fullData.user === "object") {
              const safeUser = { ...fullData.user };
              // remove sensitive fields from stored user copy
              delete safeUser.password;
              delete safeUser.verificationOtp;
              delete safeUser.passwordResetOtp;
              delete safeUser.verificationOtpExpiryTime;
              // store sanitized user separately for quick access
              localStorage.setItem("user", JSON.stringify(safeUser));

              // also store full auth response but with sanitized user
              fullData.user = safeUser;
              localStorage.setItem("authData", JSON.stringify(fullData));
            } else {
              // no user object, store whatever we have
              localStorage.setItem("authData", JSON.stringify(fullData));
            }
          } catch (err) {
            // fallback: store raw pieces if JSON fails
            if (data.user) {
              try { localStorage.setItem("user", JSON.stringify(data.user)); } catch {}
            }
            try { localStorage.setItem("authData", JSON.stringify(data)); } catch {}
          }
        }

      // navigate to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setGeneralError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6 text-center">
          <img src="Media/Group%2033.png" alt="Logo" className="mx-auto h-12 mb-3" />
          <h1 className="text-2xl font-semibold">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
        </div>

        {generalError && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 px-3 py-2 rounded">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)] ${
                fieldErrors.email ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)] ${
                fieldErrors.password ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              <span className="text-gray-600">Remember me</span>
            </label>

            <a href="/forgot-password" className="text-sm text-[rgb(183,36,42)] hover:underline">Forgot?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-medium ${
              loading ? "bg-[rgb(183,36,42)]/70 cursor-not-allowed" : "bg-[rgb(183,36,42)] hover:opacity-95"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/account/register" className="text-[rgb(183,36,42)] hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  );
}
