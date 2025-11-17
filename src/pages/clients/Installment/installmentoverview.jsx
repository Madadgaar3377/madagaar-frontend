// src/pages/InstallmentDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";

const BRAND = "rgb(183,36,42)";
const PLACEHOLDER = "/placeholder.png";

function isYouTubeUrl(url = "") {
  try {
    return /(youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
  } catch {
    return false;
  }
}
function getYouTubeEmbed(url = "") {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function InstallmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchPlan() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/installmentplan/get/public/${encodeURIComponent(id)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Failed to load (${res.status})`);
        } else {
          const data = payload?.data ?? payload; // assume backend returns plan object or { data: plan }
          // If backend sends array: data may be [plan] — handle both
          const planObj = Array.isArray(data) ? data[0] : data;
          if (mounted) setPlan(planObj || null);
        }
      } catch (err) {
        console.error("fetch plan error:", err);
        setError("Network error — could not fetch plan.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPlan();
    return () => (mounted = false);
  }, [apiUrl, id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-gray-600">Loading plan details…</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );

  if (!plan)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-gray-600">
          Plan not found. <button onClick={() => navigate(-1)} className="ml-2 text-[rgb(183,36,42)] underline">Go back</button>
        </div>
      </div>
    );

  const images = Array.isArray(plan.productImages) && plan.productImages.length ? plan.productImages : [PLACEHOLDER];
  const embed = isYouTubeUrl(plan.videoUrl) ? getYouTubeEmbed(plan.videoUrl) : plan.videoUrl;

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left: carousel */}
          <div className="lg:col-span-1 bg-gray-100">
            <div className="relative">
              <img
                src={images[index]}
                onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                alt={plan.productName}
                className="w-full h-80 object-contain bg-white"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* thumbnails */}
            <div className="p-3 flex gap-2 overflow-auto">
              {images.map((src, i) => (
                <button key={i} onClick={() => setIndex(i)} className={`p-0 rounded overflow-hidden border ${i === index ? "ring-2 ring-[rgb(183,36,42)]" : "opacity-80"}`}>
                  <img src={src} alt={`thumb-${i}`} onError={(e) => (e.currentTarget.src = PLACEHOLDER)} className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: details */}
          <div className="lg:col-span-2 p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{plan.productName}</h1>
                <div className="text-sm text-gray-500 mt-1">{plan.companyName || plan.companyNameOther || plan.category}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-xl font-bold text-[rgb(183,36,42)]">PKR {Number(plan.price || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Down: PKR {Number(plan.downpayment || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* video if present */}
            {embed && (
              <div className="rounded-md overflow-hidden border">
                {isYouTubeUrl(plan.videoUrl) ? (
                  <iframe
                    title="product-video"
                    src={embed}
                    className="w-full h-64"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video controls src={plan.videoUrl} className="w-full h-64 object-contain bg-black" />
                )}
              </div>
            )}

            {/* description */}
            <div className="prose max-w-none text-gray-700">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="whitespace-pre-line">{plan.description || plan.productName || "No description"}</p>
            </div>

            {/* quick facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Fact label="Installment" value={`PKR ${Number(plan.installment || 0).toLocaleString()}`} />
              <Fact label="Tenure" value={plan.tenure || plan.customTenure || "—"} />
              <Fact label="City" value={plan.city || "—"} />
              <Fact label="Category" value={plan.category || plan.customCategory || "—"} />
            </div>

            {/* seller block & actions */}
            <div className="mt-2 border-t pt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                  {plan.user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div>
                  <div className="text-sm font-medium">{plan.user?.fullName || plan.user?.businessName || "Seller"}</div>
                  <div className="text-xs text-gray-500">{plan.user?.city || plan.user?.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white" href={`tel:${plan.user?.number || ""}`}>Call Seller</a>
                <a className="px-4 py-2 rounded-md border" href={`mailto:${plan.user?.email || ""}`}>Email</a>
                <Link className="px-4 py-2 rounded-md border bg-white" to="/installments">Back</Link>
              </div>
            </div>

            {/* full JSON debug (optional) */}
            <details className="mt-3 text-xs text-gray-400">
              <summary className="cursor-pointer">Raw data (debug)</summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(plan, null, 2)}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-medium text-gray-800">{value}</div>
    </div>
  );
}
