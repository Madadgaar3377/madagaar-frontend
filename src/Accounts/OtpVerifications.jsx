import React, { useState, useEffect, useRef } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const OTP_LENGTH = 6;

export default function OtpVerifyPage() {
  const apiUrl = backendBaseUrl.replace(/\/$/, "");
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";

  const [email] = useState(prefilledEmail);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const formRef = useRef(null);
  const hasAutoSubmitted = useRef(false);
  /** After "Invalid OTP" (or any verify error), auto-verify is disabled; only button click will submit */
  const autoVerifyDisabled = useRef(false);

  const otp = otpDigits.join("");

  // Auto-verify when all 6 digits are entered (or pasted) – only once; after error, only button click
  useEffect(() => {
    if (otp.length < OTP_LENGTH) {
      hasAutoSubmitted.current = false;
      return;
    }
    if (!email || loading || hasAutoSubmitted.current || autoVerifyDisabled.current) return;
    hasAutoSubmitted.current = true;
    const timer = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 400);
    return () => clearTimeout(timer);
  }, [otp, email, loading]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is required to resend OTP");
      return;
    }
    if (resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const res = await fetch(`${apiUrl}/reSendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || (data && data.success === false)) {
        toast.error(data?.message || "Failed to resend OTP");
      } else {
        toast.success(data?.message || "OTP sent to your email.");
        setResendCooldown(60);
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Network error — please try again.");
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

    if (!email) {
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
        body: JSON.stringify({ email, otp }),
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
        navigate("/account", { state: { verified: true, message: "Account verified. Please sign in." } });
      }, 1500);
    } catch (err) {
      console.error("OTP verify error:", err);
      autoVerifyDisabled.current = true;
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 section-padding">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4 sm:p-6 mx-auto safe-margin">
        <h2 className="text-xl font-semibold mb-4 text-center">OTP Verification</h2>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Email – read-only, display only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 font-medium">
              {email || "—"}
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
          Didn't get OTP?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!email || resendLoading || resendCooldown > 0}
            className="text-[rgb(183,36,42)] font-semibold underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
          >
            {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
