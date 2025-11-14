import React, { useState, useEffect } from "react";
import { backendBaseUrl } from "../constants/apiUrl";
import { useNavigate, useLocation } from "react-router-dom";

const VERIFY_ENDPOINT = "/auth/verify"; // adjust if different

export default function OtpVerifyPage() {
  const apiUrl = backendBaseUrl.replace(/\/$/, "");
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";

  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail);
  }, [prefilledEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!email) return setMsg({ type: "error", text: "Email is required" });
    if (!otp) return setMsg({ type: "error", text: "OTP is required" });

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}${VERIFY_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        const errText = data?.error?.passwordError || data?.error?.numberError || data?.message || "Verification failed";
        setMsg({ type: "error", text: typeof errText === "string" ? errText : JSON.stringify(errText) });
        setLoading(false);
        return;
      }

      // success: { success: true, access_token, user }
      const token = data?.access_token || data?.token || data?.accessToken;
      if (token) localStorage.setItem("authToken", token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      setMsg({ type: "success", text: "Verified! Redirecting..." });
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      console.error("OTP verify error:", err);
      setMsg({ type: "error", text: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">OTP Verification</h2>

        {msg.text && (
          <div className={`mb-4 px-3 py-2 rounded text-sm ${msg.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="you@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Enter 4-digit OTP" required />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-2 rounded-md text-white font-medium ${loading ? "bg-[rgb(183,36,42)]/70 cursor-not-allowed" : "bg-[rgb(183,36,42)] hover:opacity-95"}`}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Didn't get OTP? <button onClick={() => navigate("/resend-otp")} className="text-[rgb(183,36,42)] underline">Resend</button>
        </div>
      </div>
    </div>
  );
}
