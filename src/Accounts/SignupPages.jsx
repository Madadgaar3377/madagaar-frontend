"use client";

import React, { useState, useMemo } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCircle, Upload, X } from "lucide-react";
import { SIGNUP_DECLARATIONS } from "../constants/signupDeclarations";
import toast from "react-hot-toast";
import { consumeNavigationState, pushWithState } from "../utils/navigationState";
import AuthSplitLayout, {
  AuthFormCard,
  AuthPrimaryButton,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "./AuthSplitLayout";

const getInitialDeclarations = () => {
  const obj = {};
  SIGNUP_DECLARATIONS.forEach((sec) => {
    sec.items.forEach((_, ii) => {
      obj[`${sec.section}-${ii}`] = false;
    });
  });
  return obj;
};

const USER_TYPES = [
  { value: "user", label: "User", desc: "Browse & apply" },
  { value: "agent", label: "Agent", desc: "Earn commission" },
  { value: "partner", label: "Partner", desc: "List products" },
];

const initialFormData = {
  name: "",
  userName: "",
  email: "",
  phoneNumber: "",
  password: "",
  profilePic: "",
  userType: "user",
};

export default function SignupPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const router = useRouter();
  const [initialNavState] = useState(() => consumeNavigationState() || {});

  const [formData, setFormData] = useState(() => {
    const prev = initialNavState?.previousFormData;
    if (prev && typeof prev === "object") {
      return {
        ...initialFormData,
        ...prev,
        email: prev.email || "",
      };
    }
    return initialFormData;
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [declarationsChecked, setDeclarationsChecked] = useState(getInitialDeclarations);

  const allDeclarationsAccepted = useMemo(
    () => Object.values(declarationsChecked).every(Boolean),
    [declarationsChecked]
  );

  const setDeclaration = (key, value) => {
    setDeclarationsChecked((prev) => ({ ...prev, [key]: value }));
  };

  const updateFormField = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${apiUrl}/upload-image`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (res.ok && (data.imageUrl || data.url || data.data?.url || data.data)) {
        const imageUrl = data.imageUrl || data.url || data.data?.url || data.data;
        setFormData((prev) => ({ ...prev, profilePic: imageUrl }));
      } else {
        toast.error(data.message || "Image upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profilePic: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }
    if (!allDeclarationsAccepted) {
      toast.error("You must accept Terms & Conditions and Privacy Policy to sign up");
      setLoading(false);
      return;
    }

    const currentUnverifiedEmail = initialNavState?.currentUnverifiedEmail;

    try {
      if (currentUnverifiedEmail) {
        const updatePayload = {
          currentEmail: currentUnverifiedEmail,
          newEmail: formData.email.trim(),
          name: formData.name,
          userName: formData.userName || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          password: formData.password,
          profilePic: formData.profilePic || undefined,
        };

        const res = await fetch(`${apiUrl}/updateUnverifiedEmail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.success === false)) {
          toast.error(data?.message || "Update failed");
          setLoading(false);
          return;
        }

        toast.success(data?.message || "Account updated. Check your email for the verification link.");
        const emailToVerify = data?.email || formData.email;
        setTimeout(() => {
          pushWithState(router, "/account/verify-otp", {
            email: emailToVerify,
            previousFormData: { ...formData, email: emailToVerify },
          });
        }, 1500);
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        userName: formData.userName || undefined,
        email: formData.email,
        phoneNumber: (formData.phoneNumber || "").trim() || undefined,
        password: formData.password,
        profilePic: formData.profilePic || undefined,
        UserType: formData.userType || "user",
        termsAccepted: true,
      };

      const res = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        const isUnverified =
          data?.code === "USER_NOT_VERIFIED" ||
          (data?.message && String(data.message).toLowerCase().includes("not verified"));
        if (isUnverified) {
          toast.error(data?.message || "Account not verified. Check your email for the verification link.");
          pushWithState(router, "/account/verify-otp", {
            email: formData.email,
            fromUnverified: true,
            previousFormData: { ...formData },
            currentUnverifiedEmail: formData.email,
          });
          setLoading(false);
          return;
        }
        const errMsg = data?.message || data?.error || `Signup failed (${res.status})`;
        toast.error(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
        setLoading(false);
        return;
      }

      toast.success(data?.message || "Signup successful! Check your email for the verification link.");
      setTimeout(() => {
        pushWithState(router, "/account/verify-otp", { email: formData.email });
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Network error  please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      tagline="JOIN · COMPARE · GROW"
      title="One account for loans, insurance and more."
      subtitle="Create your Madadgaar profile as a user, agent, or business partner  then explore trusted plans."
      footLinks={["Free to join", "Verify by email link", "Users · Agents · Partners"]}
    >
      <div className="mb-6">
        <h2
          className="text-[1.75rem] font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
        >
          Create account
        </h2>
        <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
          Users, agents and partners  one simple signup.
        </p>
      </div>

      <AuthFormCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {formData.profilePic ? (
                <>
                  <img
                    src={formData.profilePic}
                    alt="Profile"
                    className="size-14 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 size-5 bg-primary text-white rounded-full flex items-center justify-center shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="size-14 rounded-full bg-[#eef2f6] border border-dashed border-slate-300 flex items-center justify-center">
                  <UserCircle className="size-7 text-slate-400" />
                </div>
              )}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#eef2f6] hover:bg-slate-200 text-slate-700 text-[12px] font-semibold transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
              {uploadingImage ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : (
                <>
                  <Upload className="size-3.5" />
                  {formData.profilePic ? "Change photo" : "Upload photo"}
                </>
              )}
            </label>
          </div>

          <div>
            <label className={authLabelClass}>
              Full name <span className="text-primary">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={updateFormField}
              required
              className={authInputClass}
            />
          </div>

          <div>
            <label className={authLabelClass}>
              Username <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              name="userName"
              type="text"
              placeholder="Choose a username"
              value={formData.userName}
              onChange={updateFormField}
              className={authInputClass}
            />
          </div>

          <div>
            <label className={authLabelClass}>Phone number</label>
            <input
              name="phoneNumber"
              type="tel"
              placeholder="e.g. 03001234567"
              value={formData.phoneNumber}
              onChange={updateFormField}
              className={authInputClass}
            />
          </div>

          <div>
            <label className={authLabelClass}>
              Email <span className="text-primary">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={updateFormField}
              required
              className={authInputClass}
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-slate-700">
                Password <span className="text-primary">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-[12px] font-medium text-slate-500 hover:text-primary"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={updateFormField}
              required
              minLength={8}
              className={authInputClass}
              autoComplete="new-password"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">Must be at least 8 characters</p>
          </div>

          <div>
            <label className={`${authLabelClass} mb-2`}>
              I am signing up as <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {USER_TYPES.map((opt) => (
                <label
                  key={opt.value}
                  className={`relative flex flex-col items-center text-center p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.userType === opt.value
                      ? "border-primary bg-primary-50"
                      : "border-transparent bg-[#eef2f6] hover:bg-slate-200/70"
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value={opt.value}
                    checked={formData.userType === opt.value}
                    onChange={updateFormField}
                    className="sr-only"
                  />
                  <span
                    className={`text-[13px] font-semibold ${
                      formData.userType === opt.value ? "text-primary" : "text-slate-800"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 rounded-xl bg-[#eef2f6]/80 p-3.5">
            {SIGNUP_DECLARATIONS.map((sec) =>
              sec.items.map((label, idx) => {
                const key = `${sec.section}-${idx}`;
                const isTerms = idx === 0;
                const isPrivacy = idx === 1;
                return (
                  <div key={key} className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id={key}
                      checked={declarationsChecked[key] || false}
                      onChange={(e) => setDeclaration(key, e.target.checked)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-primary focus:ring-primary shrink-0"
                    />
                    <label htmlFor={key} className="text-[12px] text-slate-600 cursor-pointer leading-snug">
                      {isTerms && (
                        <>
                          I agree to the{" "}
                          <Link
                            href="/terms-and-conditions"
                            className={authLinkClass}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Terms & Conditions
                          </Link>
                        </>
                      )}
                      {isPrivacy && (
                        <>
                          I agree to the{" "}
                          <Link
                            href="/privacy-policy"
                            className={authLinkClass}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Privacy Policy
                          </Link>
                        </>
                      )}
                    </label>
                  </div>
                );
              })
            )}
          </div>

          <AuthPrimaryButton disabled={loading || uploadingImage || !allDeclarationsAccepted}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </AuthPrimaryButton>
        </form>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          Already have an account?{" "}
          <Link href="/account" className={authLinkClass}>
            Log in
          </Link>
        </p>
      </AuthFormCard>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-[#f7f8fa] px-3 text-slate-400 font-medium">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = `${apiUrl.replace(/\/api$/, "")}/auth/google`;
        }}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-[14px] font-medium hover:bg-slate-50 transition-colors shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed">
        By continuing you agree to Madadgaar Terms and Privacy Policy.
      </p>
    </AuthSplitLayout>
  );
}
