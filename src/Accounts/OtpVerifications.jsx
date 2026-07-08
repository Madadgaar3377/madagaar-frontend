"use client";

import React, { useState, useEffect, useRef } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import { consumeNavigationState, pushWithState } from "../utils/navigationState";

const OTP_LENGTH = 6;

export default function OtpVerifyPage() {
  const apiUrl = backendBaseUrl.replace(/\/$/, "");
  const router = useRouter();
  const [navState] = useState(() => consumeNavigationState() || {});
  const prefilledEmail = navState?.email || "";
  const previousFormData = navState?.previousFormData || null;
  const fromUnverified = navState?.fromUnverified === true;
  const verifyMessage =
    navState?.message ||
    "Please verify your email before logging in. We've sent you a verification code.";

  const [email, setEmail] = useState(prefilledEmail);
  const [emailForResend, setEmailForResend] = useState(""); // when no email in state, user types here first
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const formRef = useRef(null);
  const hasAutoSubmitted = useRef(false);
  /** After "Invalid OTP" (or any verify error), auto-verify is disabled; only button click will submit */
  const autoVerifyDisabled = useRef(false);

  const effectiveEmail = email || emailForResend.trim();

  const otp = otpDigits.join("");

  // Auto-verify when all 6 digits are entered (or pasted) – only once; after error, only button click
  useEffect(() => {
    if (otp.length < OTP_LENGTH) {
      hasAutoSubmitted.current = false;
      return;
    }
    if (!effectiveEmail || loading || hasAutoSubmitted.current || autoVerifyDisabled.current) return;
    hasAutoSubmitted.current = true;
    const timer = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 400);
    return () => clearTimeout(timer);
  }, [otp, effectiveEmail, loading]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    const toUse = effectiveEmail || emailForResend.trim();
    if (!toUse) {
      toast.error("Email is required to resend OTP");
      return;
    }
    if (resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const res = await fetch(`${apiUrl}/reSendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: toUse }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || (data && data.success === false)) {
        toast.error(data?.message || "Failed to resend OTP");
      } else {
        if (!email) setEmail(toUse);
        toast.success(data?.message || "OTP sent to your email.");
        setResendCooldown(60);
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Network error  please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleRequestOtpForEmail = async (e) => {
    e.preventDefault();
    const toUse = emailForResend.trim();
    if (!toUse) {
      toast.error("Please enter your email");
      return;
    }
    setResendLoading(true);
    try {
      const res = await fetch(`${apiUrl}/reSendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: toUse }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || (data && data.success === false)) {
        toast.error(data?.message || "Failed to send OTP. Check if this email is registered.");
        setResendLoading(false);
        return;
      }
      setEmail(toUse);
      toast.success("OTP sent. Enter the code below.");
      setResendCooldown(60);
    } catch (err) {
      toast.error("Network error  please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const chars = pasted.split("");
    setOtpDigits((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => { next[i] = c; });
      return next;
    });
    const nextFocus = Math.min(chars.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!effectiveEmail) {
      toast.error("Email is required");
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/verifyAccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: effectiveEmail, otp }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        autoVerifyDisabled.current = true;
        toast.error(data?.message || "Verification failed");
        setLoading(false);
        return;
      }

      toast.success("Account verified successfully! Redirecting to sign in...");

      setTimeout(() => {
        pushWithState(router, "/account", {
          verified: true,
          message: "Account verified. Please sign in.",
        });
      }, 1500);
    } catch (err) {
      console.error("OTP verify error:", err);
      autoVerifyDisabled.current = true;
      toast.error("Network error  please try again.");
    } finally {
      setLoading(false);
    }
  };

  // No email: show "Enter email" to request OTP first (e.g. user opened verify-otp in new tab)
  if (!effectiveEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 section-padding">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 sm:p-6 mx-auto safe-margin">
          <h2 className="text-xl font-semibold mb-2 text-center">Verify Your Account</h2>
          <p className="text-center text-gray-600 text-sm mb-4">
            Enter the email you used to sign up. We&apos;ll send you an OTP to verify.
          </p>
          <form onSubmit={handleRequestOtpForEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={emailForResend}
                onChange={(e) => setEmailForResend(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[rgb(183,36,42)] focus:ring-1 focus:ring-[rgb(183,36,42)] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={resendLoading}
              className="w-full py-2.5 rounded-md text-white font-medium bg-[rgb(183,36,42)] hover:opacity-95 disabled:opacity-70"
            >
              {resendLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/account" className="text-[rgb(183,36,42)] font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 section-padding">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 sm:p-6 mx-auto safe-margin">
        <h2 className="text-xl font-semibold mb-4 text-center">OTP Verification</h2>
        {(fromUnverified || navState?.message) && (
          <p className="text-center text-amber-700 text-sm mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {verifyMessage}
          </p>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Email – display with option to change */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 font-medium">
                {effectiveEmail}
              </div>
              <Link
                href="/account/register"
                state={{
                  previousFormData: previousFormData || { email: effectiveEmail },
                  currentUnverifiedEmail: effectiveEmail,
                }}
                className="shrink-0 text-sm font-semibold text-[rgb(183,36,42)] hover:underline whitespace-nowrap"
              >
                Change email
              </Link>
            </div>
          </div>

          {/* OTP – one digit per box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setDigit(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-[rgb(183,36,42)] focus:ring-2 focus:ring-[rgb(183,36,42)]/20 outline-none"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-2 rounded-md text-white font-medium ${loading ? "bg-[rgb(183,36,42)]/70 cursor-not-allowed" : "bg-[rgb(183,36,42)] hover:opacity-95"}`}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Didn&apos;t get OTP?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading || resendCooldown > 0}
            className="text-[rgb(183,36,42)] font-semibold underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
          >
            {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
