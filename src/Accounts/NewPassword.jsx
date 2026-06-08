import React, { useEffect, useState } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import { consumeNavigationState } from "../utils/navigationState";

const API = (backendBaseUrl || "").replace(/\/$/, "");

export default function ResetPassword() {
  const router = useRouter();
  const [navState] = useState(() => consumeNavigationState() || {});
  const prefillEmail = navState?.email || "";

  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  function validatePassword(p) {
    return p && p.length >= 8;
  }

  async function handleReset(e) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (!otp.trim()) {
      toast.error("Please enter the OTP sent to your email.");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/newPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otp.trim(), 
          newPassword: password 
        }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok || (body && body.success === false)) {
        toast.error(body?.message || "Reset failed. Please check OTP and try again.");
      } else {
        toast.success(body?.message || "Password reset successfully! Redirecting to login...");
        setTimeout(() => router.push("/account"), 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center section-padding">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-4 sm:p-6 mx-auto safe-margin">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reset Password</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the OTP we sent to your email and choose a new password.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">OTP (6 digits)</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">New Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Confirm Password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              placeholder="Repeat new password"
              required
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-[rgb(183,36,42)] text-white font-medium disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/account")}
              className="px-4 py-2 rounded-lg border text-sm text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="text-xs text-gray-400 mt-4">
          If your OTP expired, go back to Forgot Password and request a new one.
        </div>
      </div>
    </div>
  );
}
