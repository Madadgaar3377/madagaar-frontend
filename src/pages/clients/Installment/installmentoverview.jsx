import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";

const PLACEHOLDER = "/placeholder.png";

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
    if (!obj) return fallback;
    const val = path
      .split(".")
      .reduce((s, k) => (s && s[k] !== undefined ? s[k] : null), obj);
    if (val === null || val === undefined || val === "") return fallback;
    return val;
  } catch {
    return fallback;
  }
}
function isObjectPresent(obj, key) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined && obj[key] !== null && !(Array.isArray(obj[key]) && obj[key].length === 0);
}

function anySpecHasValue(plan, paths = []) {
  for (const p of paths) {
    const v = safe(plan, p, "-");
    if (v !== "-" && v !== null && v !== undefined) return true;
  }
  return false;
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
        const res = await fetch(`${apiUrl}/getInstallment/${encodeURIComponent(id)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Failed to load (${res.status})`);
        } else {
          let data = payload?.data ?? payload;
          if (payload && payload.success !== undefined && payload.data !== undefined) data = payload.data;
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

  // determine selected category key (one of CATEGORIES.keys) and detect available groups
  const detected = useMemo(() => {
    if (!plan) return {};
    const catRaw = (plan.category || plan.customCategory || "").toLowerCase();

    const hasGeneral = isObjectPresent(plan, "generalFeatures") && anySpecHasValue(plan, [
      "generalFeatures.operatingSystem",
      "generalFeatures.simSupport",
      "generalFeatures.phoneDimensions",
    ]);
    const hasPerformance = isObjectPresent(plan, "performance") && anySpecHasValue(plan, ["performance.processor", "performance.gpu"]);
    const hasDisplay = isObjectPresent(plan, "display") && anySpecHasValue(plan, ["display.screenSize", "display.screenResolution"]);
    const hasBattery = isObjectPresent(plan, "battery") && anySpecHasValue(plan, ["battery.type"]);
    const hasCamera = isObjectPresent(plan, "camera") && anySpecHasValue(plan, ["camera.frontCamera", "camera.backCamera"]);
    const hasMemory = isObjectPresent(plan, "memory") && anySpecHasValue(plan, ["memory.internalMemory", "memory.ram"]);
    const hasConnectivity = isObjectPresent(plan, "connectivity") && anySpecHasValue(plan, ["connectivity.data", "connectivity.bluetooth"]);
    const hasAC = isObjectPresent(plan, "airConditioner") && anySpecHasValue(plan, ["airConditioner.brand", "airConditioner.model", "airConditioner.capacityInTon"]);

    // widened electrical bike checks to include multiple possible field names added in schema
    const hasElectricalBike = isObjectPresent(plan, "electricalBike") && anySpecHasValue(plan, [
      "electricalBike.motorRatedPower",
      "electricalBike.motor",
      "electricalBike.battery",
      "electricalBike.batterySpec",
      "electricalBike.maxSpeed",
      "electricalBike.maxDistanceRange",
      "electricalBike.rangeKm",
      "electricalBike.chargingTime",
      "electricalBike.controllers",
    ]);

    // widened mechanical bike checks
    const hasMechanicalBike = isObjectPresent(plan, "mechanicalBike") && anySpecHasValue(plan, [
      "mechanicalBike.generalFeatures.engine",
      "mechanicalBike.generalFeatures.model",
      "mechanicalBike.generalFeatures.dimensions",
      "mechanicalBike.performance.transmission",
      "mechanicalBike.performance.displacement",
      "mechanicalBike.performance.petrolCapacity",
    ]);

    // heuristics by category text
    const isMobileCat = /phone|mobile|smartphone|samsung|apple|xiaomi|vivo|oppo|realme|galaxy|iphone/.test(catRaw) || hasGeneral || hasDisplay || hasBattery || hasCamera || hasMemory;
    const isACCat = /air|ac|air conditioner|split|cooler/.test(catRaw) || hasAC;
    const isBikeCat = /bike|motorcycle|electrical|electric|scooter|moped/.test(catRaw) || hasElectricalBike || hasMechanicalBike;
    const isTvCat = /tv|television|led|oled|qled|smart tv/.test(catRaw) || hasDisplay;

    // map to our category keys (prefer explicit fields presence over text)
    let selected = "other";
    if (isMobileCat) selected = "mobile";
    else if (isACCat) selected = "airConditioner";
    else if (hasElectricalBike) selected = "electricalBike";
    else if (hasMechanicalBike) selected = "mechanicalBike";

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
      category: catRaw,
      selectedCategoryKey: selected,
    };
  }, [plan]);

  if (loading) return <LoadingPage />;

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

  // helper: should we render a spec block? only when the detected category matches that block (or selected is 'other')
  const shouldShowBlock = (blockKey, hasFlag = false) => {
    if (!detected) return false;
    if (!hasFlag) return detected.selectedCategoryKey === blockKey || detected.selectedCategoryKey === "other";
    return (detected.selectedCategoryKey === blockKey || detected.selectedCategoryKey === "other") && hasFlag;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4 lg:gap-6">
            {/* carousel */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg sm:rounded-xl overflow-hidden">
              <img
                src={images[index]}
                onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                alt={plan.productName}
                className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition text-xl sm:text-2xl font-bold text-gray-700 hover:text-[rgb(183,36,42)]"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setIndex((i) => (i + 1) % images.length)}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition text-xl sm:text-2xl font-bold text-gray-700 hover:text-[rgb(183,36,42)]"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {index + 1} / {images.length}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`flex-shrink-0 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all ${i === index ? "ring-2 sm:ring-4 ring-[rgb(183,36,42)] border-[rgb(183,36,42)] scale-105" : "border-gray-200 opacity-60 hover:opacity-100"}`}>
                  <img src={src} alt={`thumb-${i}`} onError={(e) => (e.currentTarget.src = PLACEHOLDER)} className="h-14 w-20 sm:h-20 sm:w-28 object-cover" />
                </button>
              ))}
            </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-red-100">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 w-full">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">{plan.productName}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">{plan.companyName || plan.companyNameOther || plan.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400 hidden sm:inline"></span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {plan.city}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto sm:text-right bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm sm:min-w-[200px]">
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Total Price</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 bg-clip-text text-transparent">
                  PKR {Number(plan.price || 0).toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2 flex items-center gap-1">
                  <span className="font-medium">Down Payment:</span>
                  <span className="text-[rgb(183,36,42)] font-bold">PKR {Number(plan.downpayment || 0).toLocaleString()}</span>
                </div>
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <NavLink className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-lg bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white font-bold hover:shadow-lg transition-all transform hover:scale-105 text-center" to={`/installment/get-now/${encodeURIComponent(plan._id) || ""}`}>
                🛒 Get Now
              </NavLink>
              <NavLink className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-lg border-2 border-[rgb(183,36,42)] text-[rgb(183,36,42)] font-semibold hover:bg-[rgb(183,36,42)] hover:text-white transition-all text-center" to={`${plan._id ? `/installment/product/CompareProduct/${encodeURIComponent(plan._id)}` : "#"}`}>
                ⚖️ Compare
              </NavLink>
              <NavLink className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-700 hover:text-white transition-all text-center" to={"/installments"}>
                ← Back to List
              </NavLink>
            </div>
          </div>

          {/* description */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-lg sm:text-xl lg:text-2xl">📋</span>
              Product Description
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">{plan.description || plan.productName || "No description available"}</p>
          </div>

          {/* payment plans */}
          {Array.isArray(plan.paymentPlans) && plan.paymentPlans.length > 0 && (
            <section className="mt-3 sm:mt-4 lg:mt-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-lg sm:text-xl lg:text-2xl">💳</span>
                Available Payment Plans
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {plan.paymentPlans.map((p, idx) => (
                  <div key={idx} className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 hover:border-[rgb(183,36,42)] hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-sm font-semibold text-[rgb(183,36,42)] uppercase">{p.planName || `Plan ${idx + 1}`}</div>
                        <div className="text-3xl font-bold text-gray-900 mt-1">PKR {Number(p.installmentPrice || plan.price || 0).toLocaleString()}</div>
                      </div>
                      <div className="bg-[rgb(183,36,42)] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {p.tenureMonths ? `${p.tenureMonths}M` : (p.customTenureLabel || plan.tenure || "—")}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Monthly Payment</span>
                        <span className="text-xl font-bold text-[rgb(183,36,42)]">PKR {Number(p.monthlyInstallment || p.installmentPrice || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Interest Rate</span>
                        <span className="font-medium">{p.interestRatePercent ? `${p.interestRatePercent}%` : p.interestType || "—"}</span>
                      </div>
                      {p.markup > 0 && (
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>Markup</span>
                          <span className="font-medium">PKR {p.markup}</span>
                        </div>
                      )}
                    </div>
                    
                    {Array.isArray(p.installmentSchedule) && p.installmentSchedule.length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-[rgb(183,36,42)] transition">📅 View Schedule</summary>
                        <div className="mt-3 max-h-40 overflow-auto bg-gray-50 rounded-lg p-2">
                          {p.installmentSchedule.map((it, i) => (
                            <div key={i} className="flex justify-between py-2 border-b border-gray-200 last:border-0 text-xs">
                              <span className="font-medium">#{i + 1}</span>
                              <span>{it.dueDate ? new Date(it.dueDate).toLocaleDateString() : "—"}</span>
                              <span className="font-bold">PKR {Number(it.amount || 0).toLocaleString()}</span>
                              <span className={`px-2 py-0.5 rounded ${it.paid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {it.paid ? "✓ Paid" : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {p.otherChargesNote && (
                      <div className="mt-3 text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <span className="font-semibold">Note:</span> {p.otherChargesNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ---------- dynamic specifications ---------- */}
          <section className="mt-3 sm:mt-4 lg:mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-lg sm:text-xl lg:text-2xl">⚙️</span>
                Technical Specifications
              </h3>
              <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">Auto-detected</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Generic / general features (show only for mobile or other) */}
              {shouldShowBlock("mobile", detected.hasGeneral) && (
                <SpecCard title="General">
                  <SpecRow label="OS" value={safe(plan, "generalFeatures.operatingSystem")} />
                  <SpecRow label="SIM" value={safe(plan, "generalFeatures.simSupport")} />
                  <SpecRow label="Dimensions" value={safe(plan, "generalFeatures.phoneDimensions")} />
                  <SpecRow label="Weight" value={safe(plan, "generalFeatures.phoneWeight")} />
                  <SpecRow label="Colors" value={safe(plan, "generalFeatures.colors")} />
                </SpecCard>
              )}

              {/* Performance (mobile / others) */}
              {shouldShowBlock("mobile", detected.hasPerformance) && (
                <SpecCard title="Performance">
                  <SpecRow label="Processor" value={safe(plan, "performance.processor")} />
                  <SpecRow label="GPU" value={safe(plan, "performance.gpu")} />
                </SpecCard>
              )}

              {/* Display */}
              {shouldShowBlock("mobile", detected.hasDisplay) && (
                <SpecCard title="Display">
                  <SpecRow label="Screen" value={safe(plan, "display.screenSize")} />
                  <SpecRow label="Resolution" value={safe(plan, "display.screenResolution")} />
                  <SpecRow label="Technology" value={safe(plan, "display.technology")} />
                  <SpecRow label="Protection" value={safe(plan, "display.protection")} />
                </SpecCard>
              )}

              {/* Battery */}
              {shouldShowBlock("mobile", detected.hasBattery) && (
                <SpecCard title="Battery">
                  <div className="text-sm text-gray-700">{safe(plan, "battery.type")}</div>
                </SpecCard>
              )}

              {/* Camera */}
              {shouldShowBlock("mobile", detected.hasCamera) && (
                <SpecCard title="Camera">
                  <SpecRow label="Front" value={safe(plan, "camera.frontCamera")} />
                  <SpecRow label="Back" value={safe(plan, "camera.backCamera")} />
                  <SpecRow label="Features" value={safe(plan, "camera.features")} />
                </SpecCard>
              )}

              {/* Memory */}
              {shouldShowBlock("mobile", detected.hasMemory) && (
                <SpecCard title="Memory & Storage">
                  <SpecRow label="Internal" value={safe(plan, "memory.internalMemory")} />
                  <SpecRow label="RAM" value={safe(plan, "memory.ram")} />
                  <SpecRow label="Card slot" value={safe(plan, "memory.cardSlot")} />
                </SpecCard>
              )}

              {/* Connectivity */}
              {shouldShowBlock("mobile", detected.hasConnectivity) && (
                <SpecCard title="Connectivity">
                  <SpecRow label="Data" value={safe(plan, "connectivity.data")} />
                  <SpecRow label="NFC" value={safe(plan, "connectivity.nfc")} />
                  <SpecRow label="Bluetooth" value={safe(plan, "connectivity.bluetooth")} />
                  <SpecRow label="Infrared" value={safe(plan, "connectivity.infrared")} />
                </SpecCard>
              )}

              {/* Air conditioner */}
              {shouldShowBlock("airConditioner", detected.hasAC) && (
                <SpecCard title="Air Conditioner">
                  <SpecRow label="Brand" value={safe(plan, "airConditioner.brand")} />
                  <SpecRow label="Model" value={safe(plan, "airConditioner.model")} />
                  <SpecRow label="Capacity (Ton)" value={safe(plan, "airConditioner.capacityInTon")} />
                  <SpecRow label="Energy" value={safe(plan, "airConditioner.energyEfficient")} />
                  <SpecRow label="Warranty" value={safe(plan, "airConditioner.warranty")} />
                </SpecCard>
              )}

              {/* Electrical bike */}
              {shouldShowBlock("electricalBike", detected.hasElectricalBike) && (
                <SpecCard title="Electric Bike">
                  <SpecRow label="Model" value={safe(plan, "electricalBike.model")} />
                  <SpecRow label="Motor" value={safe(plan, "electricalBike.motorRatedPower") !== "-" ? safe(plan, "electricalBike.motorRatedPower") : safe(plan, "electricalBike.motor")} />
                  <SpecRow label="Battery" value={safe(plan, "electricalBike.battery") !== "-" ? safe(plan, "electricalBike.battery") : safe(plan, "electricalBike.batterySpec")} />
                  <SpecRow label="Max Speed" value={safe(plan, "electricalBike.maxSpeed")} />
                  <SpecRow label="Range" value={safe(plan, "electricalBike.maxDistanceRange") !== "-" ? safe(plan, "electricalBike.maxDistanceRange") : safe(plan, "electricalBike.rangeKm")} />
                  <SpecRow label="Charging Time" value={safe(plan, "electricalBike.chargingTime")} />
                  <SpecRow label="Controllers" value={safe(plan, "electricalBike.controllers")} />
                  <SpecRow label="Electricity Consumption" value={safe(plan, "electricalBike.electricityConsumption")} />
                  <SpecRow label="Wheel Base" value={safe(plan, "electricalBike.wheelBase") || safe(plan, "electricalBike.vehicleDimensions")} />
                  <SpecRow label="Ground Clearance" value={safe(plan, "electricalBike.groundClearance")} />
                  <SpecRow label="Tyre (Front)" value={safe(plan, "electricalBike.tyreFront") || safe(plan, "electricalBike.rimsTiresFront")} />
                  <SpecRow label="Tyre (Back)" value={safe(plan, "electricalBike.tyreBack") || safe(plan, "electricalBike.rimsTiresBack")} />
                  <SpecRow label="Shocks" value={safe(plan, "electricalBike.shocks")} />
                  <SpecRow label="Warranty" value={safe(plan, "electricalBike.warranty")} />
                </SpecCard>
              )}

              {/* Mechanical Bike */}
              {shouldShowBlock("mechanicalBike", detected.hasMechanicalBike) && (
                <SpecCard title="Mechanical Bike">
                  <SpecRow label="Model" value={safe(plan, "mechanicalBike.generalFeatures.model")} />
                  <SpecRow label="Dimensions" value={safe(plan, "mechanicalBike.generalFeatures.dimensions")} />
                  <SpecRow label="Weight" value={safe(plan, "mechanicalBike.generalFeatures.weight")} />
                  <SpecRow label="Engine" value={safe(plan, "mechanicalBike.generalFeatures.engine")} />
                  <SpecRow label="Transmission" value={safe(plan, "mechanicalBike.performance.transmission")} />
                  <SpecRow label="Displacement" value={safe(plan, "mechanicalBike.performance.displacement")} />
                  <SpecRow label="Petrol Capacity" value={safe(plan, "mechanicalBike.performance.petrolCapacity")} />
                  <SpecRow label="Compression Ratio" value={safe(plan, "mechanicalBike.assembly.compressionRatio")} />
                  <SpecRow label="Bore & Stroke" value={safe(plan, "mechanicalBike.assembly.boreAndStroke")} />
                  <SpecRow label="Tyre (Front)" value={safe(plan, "mechanicalBike.assembly.tyreAtFront")} />
                  <SpecRow label="Tyre (Back)" value={safe(plan, "mechanicalBike.assembly.tyreAtBack")} />
                  <SpecRow label="Seat Height" value={safe(plan, "mechanicalBike.assembly.seatHeight")} />
                </SpecCard>
              )}

              {/* fallback: other */}
              {detected.selectedCategoryKey === "other" && (
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
          <div className="mt-3 sm:mt-4 lg:mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Facts</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <Fact label="Monthly Payment" value={`PKR ${Number(plan.installment || 0).toLocaleString()}`} />
              <Fact label="Tenure Period" value={plan.tenure || plan.customTenure || "—"} />
              <Fact label="Location" value={plan.city || "—"} />
              <Fact label="Category" value={plan.category || plan.customCategory || "—"} />
            </div>
          </div>

          {/* seller & actions */}
          <div className="mt-2 border-t pt-3 sm:pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm sm:text-base text-gray-700">
                {plan.user?.fullName?.charAt(0)?.toUpperCase() || (typeof plan.user === "object" && plan.user?.businessName?.charAt(0)?.toUpperCase()) || "S"}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium">{(plan.user && plan.user.fullName) || plan.user?.businessName || "Seller"}</div>
                <div className="text-[10px] sm:text-xs text-gray-500">{(plan.user && plan.user.city) || plan.user?.address || ""}</div>
              </div>
            </div>

          </div>

        </div>
      </div>
      </div>
    </div>
  );
}

/* ---------- small UI components ---------- */
function SpecCard({ title, children }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 hover:border-[rgb(183,36,42)] hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h4 className="text-sm sm:text-base font-bold text-gray-900">{title}</h4>
      </div>
      <div className="space-y-1 sm:space-y-2">{children}</div>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-1.5 sm:py-2 border-b border-gray-100 last:border-b-0">
      <div className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase">{label}</div>
      <div className="text-xs sm:text-sm font-medium text-gray-900 ml-2 sm:ml-3 text-right">{value ?? "-"}</div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-3 lg:p-4 border border-gray-200 hover:border-[rgb(183,36,42)] transition-all">
      <div className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1 sm:mb-2">{label}</div>
      <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 break-words">{value}</div>
    </div>
  );
}
