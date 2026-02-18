import React, { useState, useMemo, useEffect, useRef } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, UserCircle, Upload, X } from "lucide-react";
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

const initialFormData = {
  name: "",
  userName: "",
  email: "",
  password: "",
  profilePic: "",
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
        password: formData.password,
        profilePic: formData.profilePic || undefined,
        UserType: "user",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-300 rounded-full opacity-10 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          {/* <div className="inline-block p-3 bg-gradient-to-br from-[rgb(183,36,42)] to-red-700 rounded-2xl mb-4 shadow-xl">
            <img src="/Media/Group%2033.png" alt="logo" className="w-16 h-16 rounded-xl object-cover" />
          </div> */}
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[rgb(183,36,42)] to-red-700 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 font-medium">Join Madadgaar today</p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {formData.profilePic ? (
                  <div className="relative group">
                    <img
                      src={formData.profilePic}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-red-100 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 border-4 border-red-100 flex items-center justify-center shadow-lg">
                    <UserCircle className="w-12 h-12 text-red-600" />
                  </div>
                )}
              </div>
              <label className="mt-4 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  {uploadingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {formData.profilePic ? "Change Photo" : "Upload Photo"}
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="userName"
                  type="text"
                  placeholder="Choose a username (optional)"
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            {/* Terms & Privacy – checkboxes only */}
            <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              {SIGNUP_DECLARATIONS.map((sec) =>
                sec.items.map((label, idx) => {
                  const key = `${sec.section}-${idx}`;
                  const isTerms = idx === 0;
                  const isPrivacy = idx === 1;
                  return (
                    <div key={key} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={declarationsChecked[key] || false}
                        onChange={(e) => setDeclaration(key, e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[rgb(183,36,42)] focus:ring-[rgb(183,36,42)] shrink-0"
                      />
                      <label htmlFor={key} className="text-sm text-gray-700 cursor-pointer">
                        {isTerms && (
                          <>
                            I agree to the{" "}
                            <Link to="/terms-and-conditions" className="text-[rgb(183,36,42)] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link>
                          </>
                        )}
                        {isPrivacy && (
                          <>
                            I agree to the{" "}
                            <Link to="/privacy-policy" className="text-[rgb(183,36,42)] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy & Data Protection Policy</Link>
                          </>
                        )}
                      </label>
                    </div>
                  );
                })
              )}
            </div>

            {/* Submit Button - enabled only when all declarations checked */}
            <button
              type="submit"
              disabled={loading || uploadingImage || !allDeclarationsAccepted}
              className="w-full bg-gradient-to-r from-[rgb(183,36,42)] to-red-700 text-white py-3.5 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/account"
                className="text-[rgb(183,36,42)] hover:text-red-700 font-bold transition-colors hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} Madadgaar. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
