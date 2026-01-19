import React, { useState } from "react";
import { backendBaseUrl } from "../constants/apiUrl"; // adjust path if needed
import { useNavigate } from "react-router-dom";

const API = (backendBaseUrl || "").replace(/\/$/, "");

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function validateEmail(e) {
    return /\S+@\S+\.\S+/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/forgetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok || (body && body.success === false)) {
        setError(body?.message || "Failed to send reset OTP.");
      } else {
        setSuccess(body?.message || "OTP sent to your email. Check your inbox.");
        // Navigate to reset page with email
        setTimeout(() => {
          navigate("/account/reset", { state: { email: email.trim() } });
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center section-padding">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-4 sm:p-6 mx-auto safe-margin">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the email tied to your account. We'll send a one-time code (OTP) to reset your password.
        </p>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-3 text-sm text-green-600">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]"
            required
          />

          <div className="flex items-center justify-between gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-[rgb(183,36,42)] text-white font-medium hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/account")}
              className="px-4 py-2 rounded-lg border text-sm text-gray-700"
            >
              Back
            </button>
          </div>
        </form>

        <div className="text-xs text-gray-400 mt-4">
          If you don't receive an email in a few minutes, check your spam folder or try again.
        </div>
      </div>
    </div>
  );
}
