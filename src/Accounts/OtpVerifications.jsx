"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
    <div
      onPaste={handlePaste}
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        maxWidth: "288px",
        margin: "0 auto",
      }}
    >
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
          aria-label={`Digit ${index + 1}`}
          style={{
            width: "42px",
            height: "48px",
            flex: "0 0 42px",
            boxSizing: "border-box",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 700,
            border: "1px solid transparent",
            borderRadius: "12px",
            background: "#eef2f6",
            color: "#0f172a",
            outline: "none",
            lineHeight: "1",
            padding: 0,
          }}
          onFocus={(e) => {
            e.target.style.background = "#fff";
            e.target.style.borderColor = "rgba(183,36,42,0.35)";
            e.target.style.boxShadow = "0 0 0 4px rgba(183,36,42,0.10)";
          }}
          onBlur={(e) => {
            e.target.style.background = "#eef2f6";
            e.target.style.borderColor = "transparent";
            e.target.style.boxShadow = "none";
          }}
        />
      ))}
    </div>
  );

  if (!effectiveEmail) {
    return (
      <AuthSplitLayout
        tagline="SECURE · VERIFY · CONTINUE"
        title="Confirm it’s really you."
        subtitle="Enter the email you used to sign up. We’ll send a one-time Madadgaar code."
        footLinks={["Secure OTP", "Expires quickly", "Inbox delivery"]}
      >
        <div className="mb-6">
          <h2
            className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
            style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
          >
            Verify your account
          </h2>
          <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
            We’ll email you a 6-digit OTP to continue.
          </p>
        </div>

        <AuthFormCard>
          <form onSubmit={handleRequestOtpForEmail} className="space-y-4">
            <div>
              <label className={authLabelClass}>Email</label>
              <input
                type="email"
                value={emailForResend}
                onChange={(e) => setEmailForResend(e.target.value)}
                placeholder="you@example.com"
                className={authInputClass}
                required
                autoComplete="email"
              />
            </div>
            <AuthPrimaryButton disabled={resendLoading}>
              {resendLoading ? "Sending OTP…" : "Send OTP"}
            </AuthPrimaryButton>
          </form>

          <p className="mt-5 text-center text-[13px] text-slate-500">
            Already have an account?{" "}
            <Link href="/account" className={authLinkClass}>
              Log in
            </Link>
          </p>
        </AuthFormCard>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      tagline="SECURE · VERIFY · CONTINUE"
      title="Almost there — activate your account."
      subtitle="Enter the code we sent to your inbox to unlock Madadgaar."
      footLinks={["Secure OTP", "Expires quickly", "Inbox delivery"]}
    >
      <div className="mb-6">
        <h2
          className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Enter OTP
        </h2>
        <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
          Check your email for a 6-digit verification code.
        </p>
      </div>

      <AuthFormCard>
        {(fromUnverified || navState?.message || urlEmail) && (
          <div className="mb-5 text-[13px] text-amber-900 bg-amber-50 border border-amber-100 px-3.5 py-2.5 rounded-xl leading-relaxed">
            {urlEmail
              ? "Opened from your verification email. Confirming your account…"
              : verifyMessage}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={authLabelClass}>Email</label>
            <div className="relative">
              <input
                type="text"
                value={effectiveEmail}
                readOnly
                className={`${authInputClass} pr-16 truncate`}
              />
              <button
                type="button"
                onClick={handleChangeEmail}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-[12px] ${authLinkClass}`}
              >
                Change
              </button>
            </div>
          </div>

          <div>
            <label className={`${authLabelClass} text-center`}>Enter 6-digit OTP</label>
            {otpInputs}
          </div>

          <AuthPrimaryButton disabled={loading}>
            {loading ? "Verifying…" : "Verify OTP"}
          </AuthPrimaryButton>
        </form>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          Didn&apos;t get OTP?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading || resendCooldown > 0}
            className={`${authLinkClass} disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline`}
          >
            {resendLoading
              ? "Sending…"
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend OTP"}
          </button>
        </p>
      </AuthFormCard>
    </AuthSplitLayout>
  );
}

export default function OtpVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
          <p className="text-slate-500 text-sm">Loading verification…</p>
        </div>
      }
    >
      <OtpVerifyPageInner />
    </Suspense>
  );
}
