import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";

const PLACEHOLDER = "/placeholder.png";
const BRAND = "rgb(183,36,42)";

const CATEGORIES = [
  { key: "mobile", label: "Mobile / Phone" },
  { key: "airConditioner", label: "Air Conditioner" },
  { key: "electricalBike", label: "Electrical Bike" },
  { key: "mechanicalBike", label: "Mechanical Bike" },
  { key: "other", label: "Other / Generic" },
];

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
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-8xl mx-auto max-h-7xl bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-6 flex flex-col gap-4">
          {/* carousel */}
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
                className={`p-0 rounded overflow-hidden border ${i === index ? "ring-2 ring-[rgb(183,36,42)]" : "opacity-80"}`}>
                <img src={src} alt={`thumb-${i}`} onError={(e) => (e.currentTarget.src = PLACEHOLDER)} className="h-16 w-24 object-cover" />
              </button>
            ))}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{plan.productName}</h1>
              <div className="text-sm text-gray-500 mt-1">{plan.companyName || plan.companyNameOther || plan.category}</div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">Price</div>
              <div className="text-xl font-bold" style={{ color: BRAND }}>PKR {Number(plan.price || 0).toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Down: PKR {Number(plan.downpayment || 0).toLocaleString()}</div>
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
              <NavLink className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white" to={`/installment/get-now/${encodeURIComponent(plan._id) || ""}`}>
                Get Now
              </NavLink>
              <NavLink className="px-4 py-2 rounded-md border" to={`${plan._id ? `/installment/product/CompareProduct/${encodeURIComponent(plan._id)}` : "#"}`}>
                Compare
              </NavLink>
              <NavLink className="px-4 py-2 rounded-md border" to={"/installments"}>
                Back
              </NavLink>
            </div>
          </div>

          {/* description */}
          <div className="prose max-w-none text-gray-700">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="whitespace-pre-line">{plan.description || plan.productName || "No description"}</p>
          </div>

          {/* payment plans */}
          {Array.isArray(plan.paymentPlans) && plan.paymentPlans.length > 0 && (
            <section className="mt-4">
              <h3 className="text-lg font-semibold">Available Payment Plans</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.paymentPlans.map((p, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">{p.planName || `Plan ${idx + 1}`}</div>
                        <div className="text-xl font-bold">PKR {Number(p.installmentPrice || plan.price || 0).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Tenure: {p.tenureMonths ? `${p.tenureMonths} months` : (p.customTenureLabel || plan.tenure || "—")}</div>
                        <div className="text-sm">Monthly: PKR {Number(p.monthlyInstallment || p.installmentPrice || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">Interest: {p.interestRatePercent ? `${p.interestRatePercent}%` : p.interestType || "—"} {p.markup ? `(markup: ${p.markup})` : ""}</div>
                    {Array.isArray(p.installmentSchedule) && p.installmentSchedule.length > 0 && (
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer">Show schedule</summary>
                        <div className="mt-2 text-xs max-h-40 overflow-auto">
                          {p.installmentSchedule.map((it, i) => (
                            <div key={i} className="flex justify-between py-1 border-b">
                              <div>#{i + 1}</div>
                              <div>{it.dueDate ? new Date(it.dueDate).toLocaleDateString() : "—"}</div>
                              <div>PKR {Number(it.amount || 0).toLocaleString()}</div>
                              <div>{it.paid ? "Paid" : "Unpaid"}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {p.otherChargesNote && <div className="mt-2 text-xs text-gray-500">Note: {p.otherChargesNote}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ---------- dynamic specifications ---------- */}
          <section className="mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Specifications</h3>
              <div className="text-sm text-gray-500">Auto-selected based on product data</div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
