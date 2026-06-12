import React, { useState, useMemo } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, UserCircle, Upload, X, Phone } from "lucide-react";
import { SIGNUP_DECLARATIONS } from "../constants/signupDeclarations";
import toast from "react-hot-toast";
import { consumeNavigationState, pushWithState } from "../utils/navigationState";

const getInitialDeclarations = () => {
  const obj = {};
  SIGNUP_DECLARATIONS.forEach((sec, si) => {
    sec.items.forEach((_, ii) => {
      obj[`${sec.section}-${ii}`] = false;
    });
  });
  return obj;
};

const USER_TYPES = [
  { value: "user", label: "User", desc: "Browse and apply for products" },
  { value: "agent", label: "Agent", desc: "Assist users and earn commission" },
  { value: "partner", label: "Partner", desc: "List your business products" },
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

  const allDeclarationsAccepted = useMemo(() => {
    return Object.values(declarationsChecked).every(Boolean);
  }, [declarationsChecked]);

  const setDeclaration = (key, value) => {
    setDeclarationsChecked((prev) => ({ ...prev, [key]: value }));
  };

  const updateFormField = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${apiUrl}/upload-image`, {
        method: "POST",
        body: formData,
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
      // "Change email" flow: update existing unverified account (same data, only email can change). No new account.
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

        toast.success(data?.message || "Account updated. Check your email for OTP.");
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
        const isUnverified = data?.code === "USER_NOT_VERIFIED" ||
          (data?.message && String(data.message).toLowerCase().includes("not verified"));
        if (isUnverified) {
          toast.error(data?.message || "Account not verified. Please verify with OTP.");
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

      toast.success(data?.message || "Signup successful! Check your email for OTP.");
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

  const inputBase =
    "w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)]/30 focus:border-[rgb(183,36,42)] focus:bg-white transition-all duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center py-10 sm:py-14 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 size-80 bg-[rgb(183,36,42)]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 size-72 bg-red-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 size-48 bg-amber-100/30 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">Join Madadgaar  one account for users, agents & partners</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-7">
              <div className="relative group">
                {formData.profilePic ? (
                  <>
                    <img
                      src={formData.profilePic}
                      alt="Profile"
                      className="size-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-gray-100 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-0.5 -right-0.5 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="size-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <UserCircle className="size-10 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="mt-3 cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                {uploadingImage ? (
                  <>
                    <div className="size-4 border-2 border-[rgb(183,36,42)] border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    {formData.profilePic ? "Change photo" : "Upload photo"}
                  </>
                )}
              </label>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={updateFormField}
                    required
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
                  <input
                    name="userName"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.userName}
                    onChange={updateFormField}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
                  <input
                    name="phoneNumber"
                    type="tel"
                    placeholder="e.g. 03001234567"
                    value={formData.phoneNumber}
                    onChange={updateFormField}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={updateFormField}
                    required
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={updateFormField}
                    required
                    minLength={8}
                    className={`${inputBase} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters</p>
              </div>

              {/* Account type  moved to end before terms */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">I am signing up as <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {USER_TYPES.map((opt) => (
                    <label
                      key={opt.value}
                      className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.userType === opt.value
                          ? "border-[rgb(183,36,42)] bg-red-50/80 shadow-sm"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
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
                      <span className={`font-semibold ${formData.userType === opt.value ? "text-[rgb(183,36,42)]" : "text-gray-800"}`}>
                        {opt.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Terms & Privacy */}
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                {SIGNUP_DECLARATIONS.map((sec) =>
                  sec.items.map((label, idx) => {
                    const key = `${sec.section}-${idx}`;
                    const isTerms = idx === 0;
                    const isPrivacy = idx === 1;
                    return (
                      <div key={key} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={key}
                          checked={declarationsChecked[key] || false}
                          onChange={(e) => setDeclaration(key, e.target.checked)}
                          className="mt-0.5 size-4 rounded border-gray-300 text-[rgb(183,36,42)] focus:ring-[rgb(183,36,42)] shrink-0"
                        />
                        <label htmlFor={key} className="text-sm text-gray-600 cursor-pointer leading-snug">
                          {isTerms && (
                            <>I agree to the <Link href="/terms-and-conditions" className="text-[rgb(183,36,42)] font-medium hover:underline" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link></>
                          )}
                          {isPrivacy && (
                            <>I agree to the <Link href="/privacy-policy" className="text-[rgb(183,36,42)] font-medium hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link></>
                          )}
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || uploadingImage || !allDeclarationsAccepted}
              className="mt-6 w-full py-3.5 rounded-xl bg-[rgb(183,36,42)] text-white font-semibold shadow-lg shadow-red-900/20 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>


            {/* Divider */}
            <div className="relative my-6 px-6 sm:px-8">
              <div className="absolute inset-0 flex items-center px-6 sm:px-8">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Button */}
            <div className="px-6 sm:px-8 pb-4">
              <button
                type="button"
                onClick={() => window.location.href = `${apiUrl.replace(/\/api$/, "")}/auth/google`}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
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
                Google
              </button>
            </div>

          <div className="px-6 sm:px-8 pb-6 pt-2 text-center border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link href="/account" className="text-[rgb(183,36,42)] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} Madadgaar. All rights reserved.
        </p>
      </div>
    </div>
  );
}
