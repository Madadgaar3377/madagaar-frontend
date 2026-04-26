import React, { useState, useEffect } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { getUser } from "../utils/auth";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AnimatedSection from "../components/AnimatedSection";

export default function LoginPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const location = useLocation();
  const navigate = useNavigate();
  const verifiedMessage = location.state?.message || (location.state?.verified ? "Account verified. Please sign in." : null);

  useEffect(() => {
    // Check if user is already logged in
    if (getUser()){
      const userType = getUser().userType || getUser().UserType;
      if (userType === "user") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/dashboard"; // Admin/other types can use same dashboard for now
      }
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const fetchClientIp = async () => {
    try {
      const r = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(3000) });
      const d = await r.json();
      return d?.ip || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      const clientIp = await fetchClientIp();
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, loginSource: "madadgaar", ...(clientIp && { clientIp }) }),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        if (data?.code === "EMAIL_NOT_VERIFIED" && data?.email) {
          const message = data?.message || "Please verify your email before logging in. We've sent you a verification code.";
          toast(message, { icon: "📧", duration: 5000 });
          navigate("/account/verify-otp", { state: { email: data.email, fromUnverified: true, message } });
          setLoading(false);
          return;
        }
        toast.error(data?.message || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }

      const token = data?.token;
      const userType = (data?.user?.UserType || data?.user?.userType || "user").toLowerCase();

      // If agent, redirect to agent panel with token for auto-login
      if (userType === "agent" && token) {
        const agentPanelUrl = "https://agent.madadgaar.com.pk";
        const url = `${agentPanelUrl}/login?token=${encodeURIComponent(token)}`;
        toast.success("Redirecting to agent panel...");
        window.location.href = url;
        return;
      }

      // If partner, redirect to partner panel with token for auto-login
      if (userType === "partner" && token) {
        const partnerPanelUrl = "https://partner.madadgaar.com.pk";
        const url = `${partnerPanelUrl}?token=${encodeURIComponent(token)}`;
        toast.success("Redirecting to partner dashboard...");
        window.location.href = url;
        return;
      }

      // Store token and user for non-partner
      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("access_token", token);
      }
      if (data?.user) {
        const safeUser = { ...data.user };
        delete safeUser.password;
        delete safeUser.verificationOtp;
        delete safeUser.passwordResetOtp;
        delete safeUser.verificationOtpExpiryTime;
        delete safeUser.passwordResetOtpExpiryTime;
        localStorage.setItem("user", JSON.stringify(safeUser));
      }

      toast.success("Signed in successfully");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 section-padding">
      <AnimatedSection animation="fadeIn" delay={0} className="w-full max-w-md mx-auto">
      <div className="w-full bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6 safe-margin">
        <div className="mb-6 text-center">
          <img src="Media/Group%2033.png" alt="Logo" className="mx-auto h-12 mb-3" />
          <h1 className="text-2xl font-semibold">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
        </div>

        {verifiedMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-100 px-3 py-2 rounded">
            {verifiedMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)] ${
                fieldErrors.email ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(183,36,42)] ${
                fieldErrors.password ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              <span className="text-gray-600">Remember me</span>
            </label>

            <NavLink to="/account/forgot" className="text-sm text-[rgb(183,36,42)] hover:underline">Forgot?</NavLink>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg btn-primary font-medium min-h-touch disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={() => window.location.href = `${apiUrl}/auth/google`}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
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

        <div className="mt-4 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/account/register" className="text-[rgb(183,36,42)] hover:underline">Sign up</a>
        </div>
      </div>
      </AnimatedSection>
    </div>
  );
}
