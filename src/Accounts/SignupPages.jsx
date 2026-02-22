import React, { useState, useMemo, useEffect, useRef } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, UserCircle, Upload, X, Phone } from "lucide-react";
import { SIGNUP_DECLARATIONS } from "../constants/signupDeclarations";
import toast from "react-hot-toast";

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
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(initialFormData);

  // Prefill form when returning from OTP "Change email" (keep previous data, user can change email)
  const hasPrefilled = useRef(false);
  useEffect(() => {
    const prev = location.state?.previousFormData;
    if (prev && typeof prev === "object" && !hasPrefilled.current) {
      hasPrefilled.current = true;
      setFormData({
        ...initialFormData,
        ...prev,
        email: prev.email || "",
      });
    }
  }, [location.state]);
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

  const handleChange = (e) =>
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

    const currentUnverifiedEmail = location.state?.currentUnverifiedEmail;

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
          navigate("/account/verify-otp", {
            state: { email: emailToVerify, previousFormData: { ...formData, email: emailToVerify } },
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
          navigate("/account/verify-otp", {
            state: {
              email: formData.email,
              fromUnverified: true,
              previousFormData: { ...formData },
              currentUnverifiedEmail: formData.email,
            },
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
        navigate("/account/verify-otp", { state: { email: formData.email } });
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Network error — please try again.");
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[rgb(183,36,42)]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-72 h-72 bg-red-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-amber-100/30 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">Join Madadgaar — one account for users, agents & partners</p>
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
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-gray-100 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-0.5 -right-0.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <UserCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="mt-3 cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                {uploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[rgb(183,36,42)] border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
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
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    name="userName"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.userName}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    name="phoneNumber"
                    type="tel"
                    placeholder="e.g. 03001234567"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className={`${inputBase} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Must be at least 8 characters</p>
              </div>

              {/* Account type — moved to end before terms */}
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
                        onChange={handleChange}
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
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[rgb(183,36,42)] focus:ring-[rgb(183,36,42)] shrink-0"
                        />
                        <label htmlFor={key} className="text-sm text-gray-600 cursor-pointer leading-snug">
                          {isTerms && (
                            <>I agree to the <Link to="/terms-and-conditions" className="text-[rgb(183,36,42)] font-medium hover:underline" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link></>
                          )}
                          {isPrivacy && (
                            <>I agree to the <Link to="/privacy-policy" className="text-[rgb(183,36,42)] font-medium hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link></>
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
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="px-6 sm:px-8 pb-6 pt-2 text-center border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link to="/account" className="text-[rgb(183,36,42)] font-semibold hover:underline">
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
