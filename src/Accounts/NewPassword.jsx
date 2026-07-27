"use client";

import React, { useEffect, useState } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { consumeNavigationState } from "../utils/navigationState";
import AuthSplitLayout, {
  AuthFormCard,
  AuthPrimaryButton,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "./AuthSplitLayout";

const API = (backendBaseUrl || "").replace(/\/$/, "");

export default function ResetPassword() {
  const router = useRouter();
  const [navState] = useState(() => consumeNavigationState() || {});
  const prefillEmail = navState?.email || "";

  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          newPassword: password,
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
    <AuthSplitLayout
      tagline="SECURE · RESET · CONTINUE"
      title="Choose a new password and get back in."
      subtitle="Enter the OTP from your email, then set a strong new Madadgaar password."
      footLinks={["Secure OTP", "Fast recovery", "Account safety"]}
    >
      <div className="mb-6">
        <h2
          className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Reset password
        </h2>
        <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
          Enter the OTP we sent and choose a new password.
        </p>
      </div>

      <AuthFormCard>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className={authLabelClass}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className={authInputClass}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className={authLabelClass}>OTP (6 digits)</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={authInputClass}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-slate-700">New password</label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-[12px] font-medium text-slate-500 hover:text-primary"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className={authInputClass}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className={authLabelClass}>Confirm password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type={showPassword ? "text" : "password"}
              className={authInputClass}
              placeholder="Repeat new password"
              required
              autoComplete="new-password"
            />
          </div>

          <AuthPrimaryButton disabled={loading}>
            {loading ? "Resetting…" : "Reset password"}
          </AuthPrimaryButton>
        </form>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          OTP expired?{" "}
          <Link href="/account/forgot" className={authLinkClass}>
            Request a new one
          </Link>
        </p>
      </AuthFormCard>
    </AuthSplitLayout>
  );
}
