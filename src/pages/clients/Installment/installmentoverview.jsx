// src/pages/InstallmentDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, NavLink } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";

const PLACEHOLDER = "/placeholder.png";
const BRAND = "rgb(183,36,42)";

/* ---------- helpers ---------- */
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
function safe(obj, path, fallback = "-") {
  try {
    return path
      .split(".")
      .reduce((s, k) => (s && s[k] !== undefined ? s[k] : null), obj) ?? fallback;
  } catch {
    return fallback;
  }
}
function isObjectPresent(obj, key) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined && obj[key] !== null;
}

/* ---------- component ---------- */
export default function InstallmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);

  // fetch plan
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
          let data = payload;
          if (payload && payload.success !== undefined && payload.data !== undefined) data = payload.data;
          // backend might return array or object
          const planObj = Array.isArray(data) ? data[0] : data;
          if (mounted) setPlan(planObj || null);
        }
      } catch (err) {
        console.error(err);
        setError("Network error — could not fetch plan.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPlan();
    return () => (mounted = false);
  }, [apiUrl, id]);

  // images + embed
  const images = useMemo(() => {
    if (!plan) return [PLACEHOLDER];
    return Array.isArray(plan.productImages) && plan.productImages.length ? plan.productImages : [PLACEHOLDER];
  }, [plan]);

  const embed = useMemo(() => {
    if (!plan || !plan.videoUrl) return null;
    return isYouTubeUrl(plan.videoUrl) ? getYouTubeEmbed(plan.videoUrl) : plan.videoUrl;
  }, [plan]);

  // determine types to show
  const detected = useMemo(() => {
    if (!plan) return {};
    const cat = (plan.category || plan.customCategory || "").toLowerCase();

    const hasGeneral = isObjectPresent(plan, "generalFeatures");
    const hasPerformance = isObjectPresent(plan, "performance");
    const hasDisplay = isObjectPresent(plan, "display");
    const hasBattery = isObjectPresent(plan, "battery");
    const hasCamera = isObjectPresent(plan, "camera");
    const hasMemory = isObjectPresent(plan, "memory");
    const hasConnectivity = isObjectPresent(plan, "connectivity");
    const hasAC = isObjectPresent(plan, "airConditioner");
    const hasElectricalBike = isObjectPresent(plan, "electricalBike");
    const hasMechanicalBike = isObjectPresent(plan, "mechanicalBike");

    // heuristics by category
    const isMobileCat = /phone|mobile|smartphone|samsung|apple|xiaomi|vivo|oppo|realme|galaxy|iphone/.test(cat);
    const isTvCat = /tv|television|led|oled|qled|smart tv/.test(cat);
    const isACCat = /air|ac|air conditioner|split|cooler/.test(cat);
    const isBikeCat = /bike|motorcycle|electrical|electric/.test(cat);
    const isWashingMachine = /wash|washing|machine|washer|dryer/.test(cat);

    return {
      hasGeneral,
      hasPerformance,
      hasDisplay,
      hasBattery,
      hasCamera,
      hasMemory,
      hasConnectivity,
      hasAC,
      hasElectricalBike,
      hasMechanicalBike,
      isMobileCat,
      isTvCat,
      isACCat,
      isBikeCat,
      isWashingMachine,
      category: cat,
    };
  }, [plan]);

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
          Plan not found.
          <button onClick={() => navigate(-1)} className="ml-2 text-[rgb(183,36,42)] underline">
            Go back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto max-h-7xl bg-white rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* left: carousel */}
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

            <div className="p-3 flex gap-2 overflow-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`p-0 rounded overflow-hidden border ${i === index ? "ring-2 ring-[rgb(183,36,42)]" : "opacity-80"}`}
                >
                  <img src={src} alt={`thumb-${i}`} onError={(e) => (e.currentTarget.src = PLACEHOLDER)} className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* right: details */}
          <div className="lg:col-span-2 p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{plan.productName}</h1>
                <div className="text-sm text-gray-500 mt-1">
                  {plan.companyName || plan.companyNameOther || plan.category}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Price</div>
                <div className="text-xl font-bold" style={{ color: BRAND }}>
                  PKR {Number(plan.price || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Down: PKR {Number(plan.downpayment || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* video */}
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
            <div className="rounded-md overflow-hidden  p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                <NavLink className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white" to={`/installment/get-now/${encodeURIComponent(plan._id)|| ""}`}>
                  Get Now
                </NavLink>
                <a className="px-4 py-2 rounded-md border" href={`mailto:${(plan.user && plan.user.email) || ""}`}>
                  Email
                </a>
                
              </div>
            </div>


            {/* description */}
            <div className="prose max-w-none text-gray-700">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="whitespace-pre-line">{plan.description || plan.productName || "No description"}</p>
            </div>

            {/* ---------- dynamic specifications ---------- */}
            <section className="mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Specifications</h3>
                <div className="text-sm text-gray-500">Auto-selected based on product data</div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Generic / general features */}
                {detected.hasGeneral && (
                  <SpecCard title="General">
                    <SpecRow label="OS" value={safe(plan, "generalFeatures.operatingSystem")} />
                    <SpecRow label="SIM" value={safe(plan, "generalFeatures.simSupport")} />
                    <SpecRow label="Dimensions" value={safe(plan, "generalFeatures.phoneDimensions")} />
                    <SpecRow label="Weight" value={safe(plan, "generalFeatures.phoneWeight")} />
                    <SpecRow label="Colors" value={safe(plan, "generalFeatures.colors")} />
                  </SpecCard>
                )}

                {/* Performance */}
                {detected.hasPerformance && (
                  <SpecCard title="Performance">
                    <SpecRow label="Processor" value={safe(plan, "performance.processor")} />
                    <SpecRow label="GPU" value={safe(plan, "performance.gpu")} />
                  </SpecCard>
                )}

                {/* Display (TV / phone displays) */}
                {detected.hasDisplay && (
                  <SpecCard title="Display">
                    <SpecRow label="Screen" value={safe(plan, "display.screenSize")} />
                    <SpecRow label="Resolution" value={safe(plan, "display.screenResolution")} />
                    <SpecRow label="Technology" value={safe(plan, "display.technology")} />
                    <SpecRow label="Protection" value={safe(plan, "display.protection")} />
                  </SpecCard>
                )}

                {/* Battery */}
                {detected.hasBattery && (
                  <SpecCard title="Battery">
                    <div className="text-sm text-gray-700">{safe(plan, "battery.type")}</div>
                  </SpecCard>
                )}

                {/* Camera */}
                {detected.hasCamera && (
                  <SpecCard title="Camera">
                    <SpecRow label="Front" value={safe(plan, "camera.frontCamera")} />
                    <SpecRow label="Back" value={safe(plan, "camera.backCamera")} />
                    <SpecRow label="Features" value={safe(plan, "camera.features")} />
                  </SpecCard>
                )}

                {/* Memory */}
                {detected.hasMemory && (
                  <SpecCard title="Memory & Storage">
                    <SpecRow label="Internal" value={safe(plan, "memory.internalMemory")} />
                    <SpecRow label="RAM" value={safe(plan, "memory.ram")} />
                    <SpecRow label="Card slot" value={safe(plan, "memory.cardSlot")} />
                  </SpecCard>
                )}

                {/* Connectivity */}
                {detected.hasConnectivity && (
                  <SpecCard title="Connectivity">
                    <SpecRow label="Data" value={safe(plan, "connectivity.data")} />
                    <SpecRow label="NFC" value={safe(plan, "connectivity.nfc")} />
                    <SpecRow label="Bluetooth" value={safe(plan, "connectivity.bluetooth")} />
                    <SpecRow label="Infrared" value={safe(plan, "connectivity.infrared")} />
                  </SpecCard>
                )}

                {/* Air conditioner */}
                {detected.hasAC && (
                  <SpecCard title="Air Conditioner">
                    <SpecRow label="Brand" value={safe(plan, "airConditioner.brand")} />
                    <SpecRow label="Model" value={safe(plan, "airConditioner.model")} />
                    <SpecRow label="Capacity (Ton)" value={safe(plan, "airConditioner.capacityInTon")} />
                    <SpecRow label="Energy" value={safe(plan, "airConditioner.energyEfficient")} />
                    <SpecRow label="Warranty" value={safe(plan, "airConditioner.warranty")} />
                  </SpecCard>
                )}

                {/* Electrical bike */}
                {detected.hasElectricalBike && (
                  <SpecCard title="Electric Bike">
                    <SpecRow label="Motor Power" value={safe(plan, "electricalBike.motorRatedPower")} />
                    <SpecRow label="Battery" value={safe(plan, "electricalBike.battery")} />
                    <SpecRow label="Max Speed" value={safe(plan, "electricalBike.maxSpeed")} />
                    <SpecRow label="Range" value={safe(plan, "electricalBike.maxDistanceRange")} />
                    <SpecRow label="Charging Time" value={safe(plan, "electricalBike.chargingTime")} />
                  </SpecCard>
                )}

                {/* Mechanical Bike */}
                {detected.hasMechanicalBike && (
                  <SpecCard title="Mechanical Bike">
                    <SpecRow label="Engine" value={safe(plan, "mechanicalBike.generalFeatures.engine")} />
                    <SpecRow label="Transmission" value={safe(plan, "mechanicalBike.performance.transmission")} />
                    <SpecRow label="Ground Clearance" value={safe(plan, "mechanicalBike.performance.groundClearance")} />
                    <SpecRow label="Seat Height" value={safe(plan, "mechanicalBike.assembly.seatHeight")} />
                  </SpecCard>
                )}

                {/* fallback: show a few simple fields if none of the spec blocks matched */}
                {!detected.hasGeneral &&
                  !detected.hasPerformance &&
                  !detected.hasDisplay &&
                  !detected.hasBattery &&
                  !detected.hasCamera &&
                  !detected.hasMemory &&
                  !detected.hasConnectivity &&
                  !detected.hasAC &&
                  !detected.hasElectricalBike &&
                  !detected.hasMechanicalBike && (
                    <SpecCard title="Details">
                      <SpecRow label="Category" value={plan.category || plan.customCategory || "-"} />
                      <SpecRow label="Tenure" value={plan.tenure || plan.customTenure || "-"} />
                      <SpecRow label="Installment" value={`PKR ${Number(plan.installment || 0).toLocaleString()}`} />
                      <SpecRow label="City" value={plan.city || "-"} />
                    </SpecCard>
                  )}
              </div>
            </section>

            {/* quick facts */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Fact label="Installment" value={`PKR ${Number(plan.installment || 0).toLocaleString()}`} />
              <Fact label="Tenure" value={plan.tenure || plan.customTenure || "—"} />
              <Fact label="City" value={plan.city || "—"} />
              <Fact label="Category" value={plan.category || plan.customCategory || "—"} />
            </div>

            {/* seller & actions */}
            <div className="mt-2 border-t pt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                  {plan.user?.fullName?.charAt(0)?.toUpperCase() || (typeof plan.user === "object" && plan.user?.businessName?.charAt(0)?.toUpperCase()) || "S"}
                </div>
                <div>
                  <div className="text-sm font-medium">{(plan.user && plan.user.fullName) || plan.user?.businessName || "Seller"}</div>
                  <div className="text-xs text-gray-500">{(plan.user && plan.user.city) || plan.user?.address || ""}</div>
                </div>
              </div>

              
            </div>

            {/* debug */}
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

/* ---------- small UI components ---------- */
function SpecCard({ title, children }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-1 border-b last:border-b-0">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm text-gray-700 ml-3 text-right">{value ?? "-"}</div>
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
