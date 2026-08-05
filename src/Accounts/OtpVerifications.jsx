"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { consumeNavigationState, pushWithState } from "../utils/navigationState";
import AuthSplitLayout, {
  AuthFormCard,
  AuthPrimaryButton,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "./AuthSplitLayout";

/** Web OTP verification — same flow as the mobile app. */
function OtpVerifyInner() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navState] = useState(() => consumeNavigationState() || {});
  const otpRefs = useRef([]);

  const urlEmail = (searchParams.get("email") || "").trim().toLowerCase();
  const prefilledEmail = navState?.email || urlEmail || "";
  const fromUnverified = navState?.fromUnverified === true;
  const verifyMessage =
    navState?.message ||
    "We've sent a 6-digit verification code to your email (and SMS if available).";

  const [email, setEmail] = useState(prefilledEmail);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otp = digits.join("");
  const effectiveEmail = email.trim().toLowerCase();

  useEffect(() => {
    if (!email && urlEmail) setEmail(urlEmail);
  }, [urlEmail, email]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const setDigitAt = (index, value) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    if (!effectiveEmail) {
      toast.error("Email is required");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    if (verifyLoading) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`${apiUrl}/verifyAccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: effectiveEmail, otp }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        toast.error(data?.message || "Invalid or expired OTP");
        setDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        return;
      }
      toast.success(data?.message || "Account verified! You can sign in now.");
      setTimeout(() => {
        pushWithState(router, "/account", {
          verified: true,
          message: "Account verified. Please sign in.",
        });
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error("Network error — please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (!effectiveEmail) {
      toast.error("Email is required");
      return;
    }
    if (resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const res = await fetch(`${apiUrl}/reSendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: effectiveEmail, platform: "web" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        toast.error(data?.message || "Failed to resend OTP");
      } else {
        toast.success(data?.message || "OTP sent. Check your email.");
        setResendCooldown(60);
        setDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error — please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      tagline="SECURE · VERIFY · CONTINUE"
      title="Enter the code we sent you."
      subtitle="Check your email (and SMS) for a 6-digit Madadgaar verification code — same as the mobile app."
      footLinks={["6-digit OTP", "Valid 10 min", "Email + SMS"]}
    >
      <div className="mb-6">
        <h2
          className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Verify your email
        </h2>
        <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
          Enter the 6-digit code to activate your account.
        </p>
      </div>

      <AuthFormCard>
        {(fromUnverified || navState?.message || effectiveEmail) && (
          <div className="mb-5 text-[13px] text-amber-900 bg-amber-50 border border-amber-100 px-3.5 py-2.5 rounded-xl leading-relaxed">
            {verifyMessage}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className={authLabelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={authInputClass}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className={authLabelClass}>Verification code</label>
            <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigitAt(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-semibold tracking-widest rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b7242a]/30 focus:border-[#b7242a]"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <AuthPrimaryButton disabled={verifyLoading || otp.length !== 6}>
            {verifyLoading ? "Verifying…" : "Verify account"}
          </AuthPrimaryButton>
        </form>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            className={authLinkClass}
            disabled={resendLoading || resendCooldown > 0}
            onClick={handleResend}
          >
            {resendLoading
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend OTP"}
          </button>
        </p>

        <p className="mt-4 text-center text-[13px] text-slate-500">
          Already verified?{" "}
          <Link href="/account" className={authLinkClass}>
            Log in
          </Link>
        </p>
        <p className="mt-3 text-center text-[12px] text-slate-400">
          Wrong email?{" "}
          <button
            type="button"
            className={authLinkClass}
            onClick={() =>
              pushWithState(router, "/account/register", {
                previousFormData: { email: effectiveEmail },
                currentUnverifiedEmail: effectiveEmail,
              })
            }
          >
            Update &amp; resend
          </button>
        </p>
      </AuthFormCard>
    </AuthSplitLayout>
  );
}

export default function OtpVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
          <p className="text-slate-500 text-sm">Loading…</p>
        </div>
      }
    >
      <OtpVerifyInner />
    </Suspense>
  );
}
