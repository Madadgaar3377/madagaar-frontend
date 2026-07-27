"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import { consumeNavigationState, pushWithState } from "../utils/navigationState";
import AuthSplitLayout from "./AuthSplitLayout";

const OTP_LENGTH = 6;

function OtpVerifyPageInner() {
  const apiUrl = backendBaseUrl.replace(/\/$/, "");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navState] = useState(() => consumeNavigationState() || {});

  const urlEmail = (searchParams.get("email") || "").trim().toLowerCase();
  const urlOtp = (searchParams.get("otp") || "").replace(/\D/g, "").slice(0, OTP_LENGTH);

  const prefilledEmail = navState?.email || urlEmail || "";
  const previousFormData = navState?.previousFormData || null;
  const fromUnverified = navState?.fromUnverified === true;
  const verifyMessage =
    navState?.message ||
    "Please verify your email before logging in. We've sent you a verification code.";

  const [email, setEmail] = useState(prefilledEmail);
  const [emailForResend, setEmailForResend] = useState("");
  const [otpDigits, setOtpDigits] = useState(() =>
    urlOtp.length === OTP_LENGTH ? urlOtp.split("") : Array(OTP_LENGTH).fill("")
  );
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const formRef = useRef(null);
  const hasAutoSubmitted = useRef(false);
  const autoVerifyDisabled = useRef(false);

  const effectiveEmail = email || emailForResend.trim();
  const otp = otpDigits.join("");

  useEffect(() => {
    if (!email && urlEmail) setEmail(urlEmail);
  }, [urlEmail, email]);

  useEffect(() => {
    if (urlOtp.length === OTP_LENGTH) setOtpDigits(urlOtp.split(""));
  }, [urlOtp]);

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
      chars.forEach((c, i) => {
        next[i] = c;
      });
      return next;
    });
    const nextFocus = Math.min(chars.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleChangeEmail = () => {
    pushWithState(router, "/account/register", {
      previousFormData: previousFormData || { email: effectiveEmail },
      currentUnverifiedEmail: effectiveEmail,
    });
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

  const otpInputs = (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2" onPaste={handlePaste}>
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(e) => setDigit(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-full aspect-square min-w-0 text-center text-base sm:text-lg font-bold border-2 border-stone-200 rounded-xl bg-white text-stone-900 focus:border-[rgb(183,36,42)] focus:ring-2 focus:ring-[rgb(183,36,42)]/20 outline-none transition-all"
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );

  if (!effectiveEmail) {
    return (
      <AuthSplitLayout
        eyebrow="Email verification"
        title="Confirm it’s really you"
        subtitle="Enter the email you used to sign up. We’ll send a one-time code."
      >
        <div className="mb-6">
          <h2
            className="text-2xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
          >
            Verify your account
          </h2>
          <p className="mt-1.5 text-sm text-stone-500">
            We’ll email you a 6-digit OTP to continue.
          </p>
        </div>

        <form onSubmit={handleRequestOtpForEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
              <input
                type="email"
                value={emailForResend}
                onChange={(e) => setEmailForResend(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]/25 focus:border-[rgb(183,36,42)]"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={resendLoading}
            className="w-full py-3 rounded-xl text-white text-sm font-bold bg-[rgb(183,36,42)] hover:bg-red-700 disabled:opacity-70 transition-all"
          >
            {resendLoading ? "Sending OTP…" : "Send OTP"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/account" className="text-[rgb(183,36,42)] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      eyebrow="Email verification"
      title="Almost there"
      subtitle="Enter the code we sent to your inbox to activate your Madadgaar account."
    >
      <div className="mb-6">
        <h2
          className="text-2xl font-extrabold text-stone-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Enter OTP
        </h2>
        <p className="mt-1.5 text-sm text-stone-500">
          Check your email for a 6-digit verification code.
        </p>
      </div>

      {(fromUnverified || navState?.message || urlEmail) && (
        <p className="mb-4 text-center text-amber-800 text-xs bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2.5 leading-relaxed">
          {urlEmail
            ? "Opened from your verification email. Confirming your account…"
            : verifyMessage}
        </p>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Email</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 px-3 py-2.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-700 text-sm font-medium truncate">
              {effectiveEmail}
            </div>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="shrink-0 text-xs font-bold text-[rgb(183,36,42)] hover:underline px-1"
            >
              Change
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-3 text-center">
            Enter 6-digit OTP
          </label>
          {otpInputs}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all ${
            loading
              ? "bg-[rgb(183,36,42)]/70 cursor-not-allowed"
              : "bg-[rgb(183,36,42)] hover:bg-red-700 shadow-lg shadow-red-900/15"
          }`}
        >
          {loading ? "Verifying…" : "Verify OTP"}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-stone-500">
        Didn&apos;t get OTP?{" "}
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendLoading || resendCooldown > 0}
          className="text-[rgb(183,36,42)] font-bold underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          {resendLoading
            ? "Sending…"
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend OTP"}
        </button>
      </div>
    </AuthSplitLayout>
  );
}

export default function OtpVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f6]">
          <p className="text-stone-500 text-sm">Loading verification…</p>
        </div>
      }
    >
      <OtpVerifyPageInner />
    </Suspense>
  );
}
