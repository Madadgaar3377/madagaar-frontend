import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";
import InstallmentReviews from "../../../components/InstallmentReviews";
import ShareButtons from "../../../components/ShareButtons";
import SEO from "../../../components/SEO";

// Helper to find best plan index
const findBestPlanIndex = (paymentPlans) => {
  if (!paymentPlans || paymentPlans.length === 0) return 0;
  return paymentPlans.reduce((bestIdx, current, currentIdx) => {
    const currentMonthly = Number(current.monthlyInstallment || 0);
    const bestMonthly = Number(paymentPlans[bestIdx].monthlyInstallment || 0);
    return currentMonthly > 0 && (bestMonthly === 0 || currentMonthly < bestMonthly) ? currentIdx : bestIdx;
  }, 0);
};

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

/* ---------- component ---------- */
export default function InstallmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [sellerExpanded, setSellerExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [expandedPlanIndex, setExpandedPlanIndex] = useState(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [pricingView, setPricingView] = useState("installments"); // "cash" | "installments"

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

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [id]);

  // fetch related products
  useEffect(() => {
    let mounted = true;
    async function fetchRelatedProducts() {
      if (!plan) return;
      try {
        const res = await fetch(`${apiUrl}/getAllInstallments`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const payload = await res.json().catch(() => null);
        if (res.ok && payload) {
          let allPlans = payload?.data ?? payload;
          if (Array.isArray(allPlans)) {
            // Filter related products: same category or company, exclude current
            const related = allPlans
              .filter(p => p._id !== plan._id)
              .filter(p => 
                (p.category && plan.category && p.category.toLowerCase() === plan.category.toLowerCase()) ||
                (p.companyName && plan.companyName && p.companyName.toLowerCase() === plan.companyName.toLowerCase()) ||
                (p.customCategory && plan.customCategory && p.customCategory.toLowerCase() === plan.customCategory.toLowerCase())
              )
              .slice(0, 6);
            
            if (mounted) setRelatedProducts(related);
          }
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    }
    fetchRelatedProducts();
    return () => (mounted = false);
  }, [apiUrl, plan]);

  // images + embed
  const images = useMemo(() => {
    if (!plan) return [PLACEHOLDER];
    return Array.isArray(plan.productImages) && plan.productImages.length ? plan.productImages : [PLACEHOLDER];
  }, [plan]);

  const embed = useMemo(() => {
    if (!plan || !plan.videoUrl) return null;
    return isYouTubeUrl(plan.videoUrl) ? getYouTubeEmbed(plan.videoUrl) : plan.videoUrl;
  }, [plan]);

  const descriptionSource = plan?.description != null ? String(plan.description) : "";
  const descriptionPlain = useMemo(
    () => descriptionSource.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    [descriptionSource]
  );
  const descriptionFallback = plan?.productName || "No description available";
  const descriptionDisplayPlain = descriptionPlain || descriptionFallback;
  const descriptionHasHtml = /<[a-z][\s\S]*>/i.test(descriptionSource);
  const needsDescriptionToggle = descriptionDisplayPlain.length > 130;

  const bestPlanIndex = useMemo(() => {
    return findBestPlanIndex(plan?.paymentPlans || []);
  }, [plan]);

  // Current displayed data based on variant selection
  const currentPrice = useMemo(() => {
    if (selectedVariantIndex !== null && plan?.variants?.[selectedVariantIndex]) {
      return plan.variants[selectedVariantIndex].price;
    }
    return plan?.price || 0;
  }, [plan, selectedVariantIndex]);

  const currentPlans = useMemo(() => {
    if (selectedVariantIndex !== null && plan?.variants?.[selectedVariantIndex]?.paymentPlans?.length > 0) {
      return plan.variants[selectedVariantIndex].paymentPlans;
    }
    return plan?.paymentPlans || [];
  }, [plan, selectedVariantIndex]);

  const cashOffers = useMemo(() => {
    if (!plan) return [];

    const safeStr = (v) => (v == null ? "" : String(v));
    const byKey = new Map();

    const upsert = ({ partnerId, companyName, companyLogo, price, source }) => {
      const pid = safeStr(partnerId);
      const key = pid || `__global__:${safeStr(companyName)}`;
      const next = {
        partnerId: pid,
        companyName: companyName || "Partner",
        companyLogo: companyLogo || "",
        price: Number(price) || 0,
        source,
      };
      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, next);
        return;
      }
      // Prefer non-zero price
      if ((Number(prev.price) || 0) === 0 && next.price > 0) byKey.set(key, next);
      // Prefer richer metadata
      if (!prev.companyName && next.companyName) prev.companyName = next.companyName;
      if (!prev.companyLogo && next.companyLogo) prev.companyLogo = next.companyLogo;
      byKey.set(key, prev);
    };

    // Partner-specific base price override entries (new backend feature)
    if (Array.isArray(plan.partnerPricing)) {
      for (const pp of plan.partnerPricing) {
        upsert({
          partnerId: pp?.partnerId,
          companyName: null,
          companyLogo: null,
          price: pp?.basePrice,
          source: "partnerBasePrice",
        });
      }
    }

    // Pull any explicit cashPrice overrides from plans
    const plansToScan = Array.isArray(currentPlans) ? currentPlans : [];
    for (const p of plansToScan) {
      const cash = Number(p?.cashPrice) || 0;
      if (cash > 0) {
        upsert({
          partnerId: p?.partnerId,
          companyName: p?.companyName,
          companyLogo: p?.companyLogo,
          price: cash,
          source: "planCashPrice",
        });
      }
    }

    // Always include the global/base price
    upsert({
      partnerId: "",
      companyName: plan.companyName || plan.companyNameOther || plan.category || "Standard",
      companyLogo: "",
      price: Number(currentPrice) || 0,
      source: "global",
    });

    // Backfill names/logos using plans (when only partnerPricing exists)
    for (const p of plansToScan) {
      const pid = safeStr(p?.partnerId);
      if (!pid) continue;
      for (const [key, v] of byKey.entries()) {
        if (v.partnerId === pid) {
          if (!v.companyName && p?.companyName) v.companyName = p.companyName;
          if (!v.companyLogo && p?.companyLogo) v.companyLogo = p.companyLogo;
          byKey.set(key, v);
        }
      }
    }

    return Array.from(byKey.values())
      .filter((x) => Number(x.price) > 0)
      .sort((a, b) => Number(a.price) - Number(b.price));
  }, [plan, currentPlans, currentPrice]);



  // Mobile: open BEST plan by default
  useEffect(() => {
    if (Array.isArray(plan?.paymentPlans) && plan.paymentPlans.length > 0) {
      setExpandedPlanIndex(bestPlanIndex);
    } else {
      setExpandedPlanIndex(null);
    }
  }, [bestPlanIndex, plan]);

  // Auto-rotate images
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [autoPlay, images.length]);

  const togglePlan = (idx) => {
    setExpandedPlanIndex((prev) => (prev === idx ? null : idx));
  };


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


  const firstImage = Array.isArray(plan.productImages) && plan.productImages.length ? plan.productImages[0] : null;
  const plainDesc = plan.description && typeof plan.description === "string" ? plan.description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 160) : "";
  const detailDesc = [plan.productName, plan.category, plan.city, plan.companyName || plan.companyNameOther].filter(Boolean).join(" · ");
  const priceInfo = plan.price ? `From PKR ${Number(plan.price).toLocaleString()}` : (plan.paymentPlans?.[0]?.monthlyInstallment ? `From PKR ${Number(plan.paymentPlans[0].monthlyInstallment).toLocaleString()}/mo` : "");
  const seoDescription = plainDesc || [detailDesc, priceInfo, "Compare & apply on Madadgaar."].filter(Boolean).join(" ");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 section-padding-sm">
      <SEO
        title={`${plan.productName || "Installment Plan"} | Madadgaar`}
        description={seoDescription}
        canonicalUrl={`https://madadgaar.com.pk/installment/${encodeURIComponent(id)}`}
        ogImage={firstImage}
      />
      <div className="container-content">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Main Content: Left (Images) + Right (Details) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Left Column: Image Gallery */}
            <div className="space-y-3 sm:space-y-4">
              {/* Main Selected Image */}
              <div 
                className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg sm:rounded-xl overflow-hidden aspect-square lg:sticky lg:top-4"
                onMouseEnter={() => setAutoPlay(false)}
                onMouseLeave={() => setAutoPlay(true)}
              >
                <div className="relative w-full h-full">
                  {images.map((imgSrc, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={imgSrc}
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                      alt={`${plan.productName || "Product"} - Installment Plan in ${plan.city || "Pakistan"}`}
                      className={`absolute inset-0 w-full h-full object-contain p-2 sm:p-4 transition-opacity duration-700 ${
                        imgIdx === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    />
                  ))}
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setAutoPlay(false);
                        setIndex((i) => (i - 1 + images.length) % images.length);
                        setTimeout(() => setAutoPlay(true), 5000);
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition text-xl sm:text-2xl font-bold text-gray-700 hover:text-[rgb(183,36,42)] z-10"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => {
                        setAutoPlay(false);
                        setIndex((i) => (i + 1) % images.length);
                        setTimeout(() => setAutoPlay(true), 5000);
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition text-xl sm:text-2xl font-bold text-gray-700 hover:text-[rgb(183,36,42)] z-10"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      {index + 1} / {images.length}
                    </div>
                    {/* Auto-play indicator */}
                    {autoPlay && (
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Auto</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 sm:gap-3">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`relative aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                        i === index 
                          ? "ring-2 ring-[rgb(183,36,42)] border-[rgb(183,36,42)] scale-105 shadow-md" 
                          : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300"
                      }`}
                    >
                      <img 
                        src={src} 
                        alt={`${plan.productName || "Product"} thumbnail ${i + 1}`}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)} 
                        className="w-full h-full object-cover" 
                      />
                      {i === index && (
                        <div className="absolute inset-0 bg-[rgb(183,36,42)]/10" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Video Section */}
              {embed && (
                <div className="rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 bg-black">
                  {isYouTubeUrl(plan.videoUrl) ? (
                    <iframe
                      title="product-video"
                      src={embed}
                      className="w-full aspect-video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video controls src={plan.videoUrl} className="w-full aspect-video object-contain" />
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Product Details */}
            <div className="space-y-4 sm:space-y-5">
              {/* Product Title & Price */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{plan.productName}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-gray-600">
                  <span>{plan.companyName || plan.companyNameOther || plan.category}</span>
                  <span className="text-gray-400">•</span>
                  <span>{plan.city || "Pakistan"}</span>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-medium">Cash Price</div>
                    <div className="text-2xl sm:text-3xl font-bold text-[rgb(183,36,42)]">
                      PKR {Number(currentPrice).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Down Payment:</div>
                    <div className="text-base font-semibold text-gray-900">
                      PKR {Number(plan.downpayment || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Variant Selection */}
              {Array.isArray(plan.variants) && plan.variants.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Select Specification</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedVariantIndex(null)}
                      className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                        selectedVariantIndex === null
                          ? "bg-[rgb(183,36,42)] border-[rgb(183,36,42)] text-white shadow-lg shadow-red-100"
                          : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-white"
                      }`}
                    >
                      Standard
                    </button>
                    {plan.variants.map((variant, vIdx) => (
                      <button
                        key={vIdx}
                        onClick={() => setSelectedVariantIndex(vIdx)}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                          selectedVariantIndex === vIdx
                            ? "bg-[rgb(183,36,42)] border-[rgb(183,36,42)] text-white shadow-lg shadow-red-100"
                            : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        {variant.variantName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <NavLink 
                  className="block w-full px-4 py-3 text-sm sm:text-base rounded-lg bg-[rgb(183,36,42)] text-white font-semibold hover:bg-red-700 transition-colors text-center" 
                  to={`/installment/${encodeURIComponent(id)}/apply${selectedVariantIndex !== null ? `?variantIndex=${selectedVariantIndex}` : ""}`}
                >
                  Apply Now
                </NavLink>
                <div className="grid grid-cols-2 gap-3">
                  <NavLink 
                    className="px-4 py-3 text-sm sm:text-base rounded-lg border border-[rgb(183,36,42)] text-[rgb(183,36,42)] font-semibold hover:bg-[rgb(183,36,42)] hover:text-white transition-colors text-center" 
                    to={id ? `/installment/product/CompareProduct/${encodeURIComponent(id)}` : "#"}
                  >
                    Compare
                  </NavLink>
                  <NavLink 
                    className="px-4 py-3 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-center" 
                    to={"/installments"}
                  >
                    Back to List
                  </NavLink>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPricingView("cash")}
                    className={`px-4 py-3 text-sm sm:text-base rounded-lg border font-semibold transition-colors text-center ${
                      pricingView === "cash"
                        ? "bg-gray-900 border-gray-900 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingView("installments")}
                    className={`px-4 py-3 text-sm sm:text-base rounded-lg border font-semibold transition-colors text-center ${
                      pricingView === "installments"
                        ? "bg-[rgb(183,36,42)] border-[rgb(183,36,42)] text-white hover:bg-red-700"
                        : "border-[rgb(183,36,42)] text-[rgb(183,36,42)] hover:bg-[rgb(183,36,42)] hover:text-white"
                    }`}
                  >
                    Installments
                  </button>
                </div>
                <ShareButtons
                  url={id ? `https://madadgaar.com.pk/installment/${encodeURIComponent(id)}` : ""}
                  title={plan.productName || "Installment plan"}
                  details={(() => {
                    const plans = plan.paymentPlans || [];
                    const best = plans.length ? plans[findBestPlanIndex(plans)] : {};
                    const down = Number(best.downPayment ?? plan.downpayment ?? 0);
                    const monthly = Number(best.monthlyInstallment ?? plan.installment ?? 0);
                    const cash = Number(plan.price ?? 0);
                    const tenure = best.tenureMonths ?? best.tenure ?? "";
                    return [
                      plan.city || "Pakistan",
                      "Monthly Payment",
                      `Down: Rs ${down.toLocaleString()}`,
                      `Rs ${monthly.toLocaleString()}/month`,
                      `Cash Price: Rs ${cash.toLocaleString()}`,
                      tenure ? `${tenure} Months` : null,
                    ].filter(Boolean).join("\n");
                  })()}
                  label="Share this plan"
                />
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📋</span>
                  Product Description
                </h3>
                {descriptionExpanded ? (
                  descriptionHasHtml ? (
                    <div
                      className="text-sm text-gray-700 leading-relaxed [&_a]:text-[rgb(183,36,42)] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 space-y-2"
                      dangerouslySetInnerHTML={{ __html: descriptionSource || descriptionFallback }}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{descriptionDisplayPlain}</p>
                  )
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line line-clamp-3">
                    {descriptionDisplayPlain}
                  </p>
                )}
                {needsDescriptionToggle && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded((v) => !v)}
                    className="mt-3 text-sm font-semibold text-[rgb(183,36,42)] hover:text-red-700 underline decoration-2 underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(183,36,42)] focus-visible:ring-offset-2 rounded"
                  >
                    {descriptionExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Width Sections Below */}
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 pb-3 sm:pb-4 md:pb-6 lg:pb-8 space-y-4 sm:space-y-6">

            {pricingView === "cash" && (
              <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">💰</span>
                  Cash Prices by Partner ({cashOffers.length})
                </h3>

                {cashOffers.length === 0 ? (
                  <div className="text-sm text-gray-600">No partner cash prices available yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cashOffers.map((offer, idx) => (
                      <div
                        key={`${offer.partnerId || "global"}-${idx}`}
                        className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {offer.companyLogo ? (
                            <img src={offer.companyLogo} alt={offer.companyName} className="h-5 object-contain" />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                              {offer.companyName}
                            </span>
                          )}
                          {offer.source === "partnerBasePrice" && (
                            <span className="ml-auto text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">BASE</span>
                          )}
                          {offer.source === "planCashPrice" && (
                            <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">CASH</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Cash Price</div>
                        <div className="text-xl font-black text-gray-900">PKR {Number(offer.price || 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* payment plans */}
            {pricingView === "installments" && Array.isArray(currentPlans) && currentPlans.length > 0 ? (
              <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 lg:mb-6 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">💳</span>
                  Available Payment Plans ({currentPlans.length})
                </h3>

                {/* Mobile/Tablet: Dropdown (Best plan opened by default) */}
                <div className="lg:hidden space-y-3 mb-4">
                  {currentPlans.map((p, idx) => {
                    const vendorName = p.companyName || plan.companyName || plan.companyNameOther || "Standard";
                    const cashPrice = Number(currentPrice);
                    const downPayment = Number(p.downPayment || 0);
                    const financedAmount = Math.max(0, cashPrice - downPayment);
                    const totalPayable = Number(p.installmentPrice || p.monthlyInstallment * (p.tenureMonths || 1) || 0);
                    const totalMarkup = Number(p.markup || 0);
                    const totalCost = cashPrice + totalMarkup;
                    const isBestPlan = idx === bestPlanIndex;
                    const isOpen = expandedPlanIndex === idx;
                    const panelId = `plan-panel-${idx}`;

                    return (
                      <div
                        key={idx}
                        className={`border-2 rounded-xl overflow-hidden bg-white transition ${
                          isBestPlan ? "border-[rgb(183,36,42)] shadow-md" : "border-gray-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => togglePlan(idx)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className="w-full p-4 flex items-start justify-between gap-3 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {p.companyLogo ? (
                                <img src={p.companyLogo} alt={vendorName} className="h-4 object-contain" />
                              ) : (
                                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{vendorName}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-gray-900 truncate">
                                {p.planName || `Plan ${idx + 1}`}
                              </div>
                              {isBestPlan && (
                                <span className="px-2 py-0.5 bg-[rgb(183,36,42)] text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                                  ⭐ BEST
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="text-lg font-black text-[rgb(183,36,42)]">
                                PKR {Number(p.monthlyInstallment || 0).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">/month</span>
                              <span className="ml-auto text-xs font-semibold text-gray-700 whitespace-nowrap">
                                {p.tenureMonths ? `${p.tenureMonths} Months` : (p.customTenureLabel || "—")}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                              <span className="font-bold">Cash Price:</span> PKR {cashPrice.toLocaleString()}
                            </div>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-1 transition-transform ${
                              isOpen ? "rotate-180" : "rotate-0"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <div
                          id={panelId}
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? "max-h-[1600px] opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="px-4 pb-4 pt-0 space-y-3">
                            <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                              <div>
                                <div className="text-[11px] text-gray-500 font-semibold">Down Payment</div>
                                <div className="text-sm font-bold text-gray-900">PKR {downPayment.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-[11px] text-gray-500 font-semibold">Financed Amount</div>
                                <div className="text-sm font-bold text-gray-900">PKR {financedAmount.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-[11px] text-gray-500 font-semibold">Interest Rate</div>
                                <div className="text-sm font-bold text-gray-900">
                                  {p.interestRatePercent ? `${p.interestRatePercent}%` : "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] text-gray-500 font-semibold">Interest Type</div>
                                <div className="text-sm font-bold text-gray-900 truncate">{p.interestType || "—"}</div>
                              </div>
                              <div>
                                <div className="text-[11px] text-gray-500 font-semibold">Total Payable</div>
                                <div className="text-sm font-bold text-gray-900">PKR {totalPayable.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-[11px] text-gray-500 font-semibold">Total Markup</div>
                                <div className="text-sm font-bold text-gray-900">PKR {totalMarkup.toLocaleString()}</div>
                              </div>
                              <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
                                <div className="text-sm font-extrabold text-gray-900">Total Cost</div>
                                <div className="text-base font-black text-[rgb(183,36,42)]">PKR {totalCost.toLocaleString()}</div>
                              </div>
                            </div>

                            {Array.isArray(p.installmentSchedule) && p.installmentSchedule.length > 0 && (
                              <details className="text-xs">
                                <summary className="cursor-pointer font-semibold text-gray-800 hover:text-[rgb(183,36,42)] transition py-1.5">
                                  📅 Payment Schedule
                                </summary>
                                <div className="mt-2 max-h-40 overflow-auto bg-gray-50 rounded-lg p-2 border border-gray-200">
                                  {p.installmentSchedule.map((it, i) => (
                                    <div
                                      key={i}
                                      className="grid grid-cols-2 gap-2 py-2 border-b border-gray-200 last:border-0 text-[11px]"
                                    >
                                      <span className="font-semibold">#{i + 1}</span>
                                      <span className="text-right">{it.dueDate ? new Date(it.dueDate).toLocaleDateString() : "—"}</span>
                                      <span className="font-bold">PKR {Number(it.amount || 0).toLocaleString()}</span>
                                      <span
                                        className={`px-2 py-0.5 rounded text-center ${
                                          it.paid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                        }`}
                                      >
                                        {it.paid ? "✓ Paid" : "Pending"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}

                            {/* Finance Information for this plan */}
                            {p.finance && (p.finance.bankName || p.finance.financeInfo) && (
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3 space-y-2">
                                {p.finance.bankName && (
                                  <div>
                                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Bank Name</div>
                                    <div className="text-sm font-bold text-blue-700">{p.finance.bankName}</div>
                                  </div>
                                )}
                                {p.finance.financeInfo && (
                                  <div>
                                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Finance Details</div>
                                    <div 
                                      className="text-xs text-gray-700 leading-relaxed"
                                      dangerouslySetInnerHTML={{ __html: p.finance.financeInfo }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {p.otherChargesNote && (
                              <div className="text-xs text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <span className="font-semibold">Note:</span> {p.otherChargesNote}
                              </div>
                            )}

                            <NavLink
                              to={`/installment/${encodeURIComponent(id)}/apply?planIndex=${idx}${selectedVariantIndex !== null ? `&variantIndex=${selectedVariantIndex}` : ""}`}
                              className="block w-full text-center px-4 py-3 bg-[rgb(183,36,42)] text-white text-sm font-bold rounded-xl hover:bg-red-700 transition active:scale-95"
                            >
                              Apply for This Plan
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: Table view */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-gray-200">
                    <thead>
                      <tr className="bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white">
                        <th className="px-4 py-3 text-center text-sm font-bold">Plan By</th>
                        <th className="px-4 py-3 text-left text-sm font-bold">Plan</th>
                        <th className="px-4 py-3 text-center text-sm font-bold">Monthly Payment</th>
                        <th className="px-4 py-3 text-center text-sm font-bold">Tenure</th>
                        <th className="px-4 py-3 text-center text-sm font-bold">Down Payment</th>
                        <th className="px-4 py-3 text-center text-sm font-bold">Interest Rate</th>
                        <th className="px-4 py-3 text-center text-sm font-bold">Total Payable</th>
                        <th className="px-4 py-3 text-center text-sm font-bold">Total Cost</th>
                        <th className="px-4 py-3 text-center text-sm font-bold">Finance Info</th>
                        <th className="px-4 py-3 text-center text-sm font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPlans.map((p, idx) => {
                        const cashPrice = Number(currentPrice);
                        const downPayment = Number(p.downPayment || 0);
                        const financedAmount = Math.max(0, cashPrice - downPayment);
                        const totalPayable = Number(p.installmentPrice || p.monthlyInstallment * (p.tenureMonths || 1) || 0);
                        const totalMarkup = Number(p.markup || 0);
                        const totalCost = cashPrice + totalMarkup;
                        const isBestPlan = idx === bestPlanIndex;
                        const hasFinance = p.finance && (p.finance.bankName || p.finance.financeInfo);
                        const vendorName = p.companyName || plan.companyName || plan.companyNameOther || "Standard";

                        return (
                          <tr
                            key={idx}
                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                              isBestPlan ? "bg-red-50 border-l-4 border-l-[rgb(183,36,42)]" : ""
                            }`}
                          >
                            <td className="px-4 py-3 text-center">
                               <div className="flex flex-col items-center justify-center">
                                  {p.companyLogo ? (
                                     <img src={p.companyLogo} alt={vendorName} className="w-16 h-8 object-contain" />
                                  ) : (
                                     <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">{vendorName}</span>
                                  )}
                               </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{p.planName || `Plan ${idx + 1}`}</span>
                                {isBestPlan && (
                                  <span className="px-2 py-0.5 bg-[rgb(183,36,42)] text-white text-[10px] font-bold rounded-full">
                                    ⭐ BEST
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="font-black text-[rgb(183,36,42)] text-lg">
                                PKR {Number(p.monthlyInstallment || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">/month</div>
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                              {p.tenureMonths ? `${p.tenureMonths} Months` : (p.customTenureLabel || "—")}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                              PKR {downPayment.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              <div className="font-semibold text-gray-900">
                                {p.interestRatePercent ? `${p.interestRatePercent}%` : "—"}
                              </div>
                              {p.interestType && (
                                <div className="text-xs text-gray-500">{p.interestType}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">
                              PKR {totalPayable.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="font-black text-[rgb(183,36,42)]">
                                PKR {totalCost.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {hasFinance ? (
                                <div className="flex flex-col gap-1">
                                  {p.finance.bankName && (
                                    <div className="text-xs font-semibold text-blue-700">{p.finance.bankName}</div>
                                  )}
                                  {p.finance.financeInfo && (
                                    <div className="text-xs text-gray-600 line-clamp-2">
                                      {p.finance.financeInfo.replace(/<[^>]*>/g, '').substring(0, 50)}
                                      {p.finance.financeInfo.replace(/<[^>]*>/g, '').length > 50 ? '...' : ''}
                                    </div>
                                  )}
                                  <button
                                    onClick={() => {
                                      const modal = document.getElementById(`finance-modal-${idx}`);
                                      if (modal) modal.classList.remove('hidden');
                                    }}
                                    className="text-xs text-blue-600 hover:underline mt-1"
                                  >
                                    View Details
                                  </button>
                                  {/* Finance Details Modal */}
                                  <div id={`finance-modal-${idx}`} className="hidden fixed inset-0 z-50 overflow-y-auto">
                                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
                                      document.getElementById(`finance-modal-${idx}`).classList.add('hidden');
                                    }}></div>
                                    <div className="flex items-center justify-center min-h-screen p-4">
                                      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                                        <button
                                          onClick={() => {
                                            document.getElementById(`finance-modal-${idx}`).classList.add('hidden');
                                          }}
                                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                        >
                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                        <h3 className="font-bold text-lg mb-4">Finance Information - {p.planName || `Plan ${idx + 1}`}</h3>
                                        {p.finance.bankName && (
                                          <div className="mb-4">
                                            <div className="text-sm font-semibold text-gray-500 mb-1">Bank Name</div>
                                            <div className="text-lg font-bold text-blue-700">{p.finance.bankName}</div>
                                          </div>
                                        )}
                                        {p.finance.financeInfo && (
                                          <div>
                                            <div className="text-sm font-semibold text-gray-500 mb-2">Finance Details</div>
                                            <div 
                                              className="text-sm text-gray-700 leading-relaxed"
                                              dangerouslySetInnerHTML={{ __html: p.finance.financeInfo }}
                                            />
                                          </div>
                                        )}
                                        <div className="mt-6 flex justify-end">
                                          <button
                                            onClick={() => {
                                              document.getElementById(`finance-modal-${idx}`).classList.add('hidden');
                                            }}
                                            className="px-4 py-2 bg-[rgb(183,36,42)] text-white rounded-lg hover:bg-red-700 transition"
                                          >
                                            Close
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <NavLink
                                to={`/installment/${encodeURIComponent(id)}/apply?planIndex=${idx}${selectedVariantIndex !== null ? `&variantIndex=${selectedVariantIndex}` : ""}`}
                                className="inline-block px-4 py-2 bg-[rgb(183,36,42)] text-white text-sm font-bold rounded-lg hover:bg-red-700 transition"
                              >
                                Apply
                              </NavLink>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : pricingView === "installments" ? (
              /* Fallback for legacy plans without paymentPlans array */
              <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">💳</span>
                  Payment Plan
                </h3>
                <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1"><span className="font-bold">Cash Price</span></div>
                    <div className="text-xl sm:text-2xl font-bold text-[rgb(183,36,42)]">PKR {Number(plan.price || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Down Payment</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">PKR {Number(plan.downpayment || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Monthly Installment</div>
                    <div className="text-xl sm:text-2xl font-bold text-[rgb(183,36,42)]">PKR {Number(plan.installment || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Tenure</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{plan.tenure || plan.customTenure || "—"}</div>
                  </div>
                </div>
                </div>
              </section>
            ) : null}

            {/* Finance Information - Only show main plan finance if NO individual plans have finance */}
            {(() => {
              // Check if any payment plan has finance info
              const hasPlanFinance = Array.isArray(plan?.paymentPlans) && plan.paymentPlans.some(
                p => p.finance && (p.finance.bankName || p.finance.financeInfo)
              );
              
              // Only show main plan finance if no individual plans have finance
              const shouldShowMainFinance = plan?.finance && (plan.finance.bankName || plan.finance.financeInfo) && !hasPlanFinance;
              
              return shouldShowMainFinance ? (
                <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-blue-200">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 lg:mb-6 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🏦</span>
                    <span>Bank Finance Information</span>
                  </h3>
                  
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-blue-200 shadow-sm">
                    {plan.finance.bankName && (
                      <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Bank Name</span>
                        </div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">
                          {plan.finance.bankName}
                        </div>
                      </div>
                    )}
                    
                    {plan.finance.financeInfo && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Finance Details</span>
                        </div>
                        <div 
                          className="finance-html-content text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-5 border border-gray-200"
                          dangerouslySetInnerHTML={{ __html: plan.finance.financeInfo }}
                        />
                      </div>
                    )}
                    
                    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-200">
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="leading-relaxed">
                          <span className="font-semibold">Note:</span> This is bank finance information. Please contact the bank directly for application procedures, eligibility criteria, and terms & conditions.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null;
            })()}

            {/* Product Specifications */}
            {plan.productSpecifications && plan.productSpecifications.specifications && Array.isArray(plan.productSpecifications.specifications) && plan.productSpecifications.specifications.length > 0 && (
              <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
                <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-2 sm:gap-3 mb-2">
                  <span className="text-2xl sm:text-3xl">📋</span>
                  <span className="font-black">Product Specifications</span>
                  {plan.productSpecifications.category && (
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(183,36,42)] ml-2 sm:ml-3">
                      ({plan.productSpecifications.category})
                    </span>
                  )}
                </h3>
                {plan.productSpecifications.subCategory && (
                  <p className="text-sm sm:text-base text-gray-600 ml-8 sm:ml-11">
                    {plan.productSpecifications.subCategory}
                  </p>
                )}
              </div>
              
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                      {plan.productSpecifications.specifications.map((spec, idx) => (
                        <div 
                          key={idx} 
                          className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-[rgb(183,36,42)] hover:shadow-md transition-all group"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                              {spec.label || spec.field || "—"}
                            </div>
                            <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 group-hover:text-[rgb(183,36,42)] transition-colors">
                              {spec.value ?? "—"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Seller Information - Accordion */}
            {(plan.createdBy && Array.isArray(plan.createdBy) && plan.createdBy.length > 0) || plan.user || plan.postedBy ? (
              <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
              {(() => {
                const seller = plan.createdBy && Array.isArray(plan.createdBy) && plan.createdBy.length > 0 
                  ? plan.createdBy[0] 
                  : null;
                const sellerName = seller?.name || (plan.user && plan.user.fullName) || plan.user?.businessName || plan.postedBy || "Seller";
                const sellerImage = seller?.profileImage || null;
                const sellerInitial = sellerName?.charAt(0)?.toUpperCase() || "S";
                const sellerUserType = seller?.userType || plan.user?.userType || plan.user?.UserType || null;
                
                return (
                  <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 overflow-hidden">
                    {/* Accordion Header - Always Visible */}
                    <button
                      onClick={() => setSellerExpanded(!sellerExpanded)}
                      className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:bg-gray-50 transition-colors"
                      aria-expanded={sellerExpanded}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {sellerImage ? (
                            <img 
                              src={sellerImage} 
                              alt={sellerName} 
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[rgb(183,36,42)] to-red-600 flex items-center justify-center font-bold text-white text-lg sm:text-xl ${sellerImage ? 'hidden' : ''}`}>
                            {sellerInitial}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                              {sellerName}
                            </h3>
                            {sellerUserType && (
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${
                                sellerUserType.toLowerCase() === 'partner' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : sellerUserType.toLowerCase() === 'admin'
                                  ? 'bg-blue-100 text-blue-700'
                                  : sellerUserType.toLowerCase() === 'agent'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {sellerUserType}
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            Click to view contact information
                          </div>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300 text-gray-500 ${
                          sellerExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Accordion Content - Expandable */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        sellerExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-200 pt-4 sm:pt-6">
                        {seller ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {seller.email && (
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mb-1">Email</div>
                                  <a href={`mailto:${seller.email}`} className="text-sm sm:text-base text-[rgb(183,36,42)] hover:underline break-all">
                                    {seller.email}
                                  </a>
                                </div>
                              )}
                              {(seller.phone || seller.phoneNumber) && (
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mb-1">Phone</div>
                                  <a href={`tel:${seller.phone || seller.phoneNumber}`} className="text-sm sm:text-base text-[rgb(183,36,42)] hover:underline">
                                    {seller.phone || seller.phoneNumber}
                                  </a>
                                </div>
                              )}
                              {seller.whatsappNumber && (
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mb-1">WhatsApp</div>
                                  <a href={`https://wa.me/${seller.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-green-600 hover:underline">
                                    {seller.whatsappNumber}
                                  </a>
                                </div>
                              )}
                              {(seller.address || seller.city) && (
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mb-1">Location</div>
                                  <div className="text-sm sm:text-base text-gray-900">
                                    {seller.address && seller.city ? `${seller.address}, ${seller.city}` : (seller.address || seller.city)}
                                  </div>
                                </div>
                              )}
                              {seller.userId && (
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mb-1">User ID</div>
                                  <div className="text-sm sm:text-base text-gray-900 font-mono">{seller.userId}</div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                              {(seller.phone || seller.phoneNumber) && (
                                <a 
                                  href={`tel:${seller.phone || seller.phoneNumber}`}
                                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-[rgb(183,36,42)] text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm sm:text-base"
                                >
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  Call Seller
                                </a>
                              )}
                              {seller.whatsappNumber && (
                                <a 
                                  href={`https://wa.me/${seller.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm sm:text-base"
                                >
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.893c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                  </svg>
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {plan.user?.city && (
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mb-1">Location</div>
                                  <div className="text-sm sm:text-base text-gray-900">📍 {plan.user.city}</div>
                                </div>
                              )}
                              {plan.user?.address && (
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mb-1">Address</div>
                                  <div className="text-sm sm:text-base text-gray-900">🏠 {plan.user.address}</div>
                                </div>
                              )}
                              {plan.user?.number && (
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase mb-1">Phone</div>
                                  <a href={`tel:${plan.user.number}`} className="text-sm sm:text-base text-[rgb(183,36,42)] hover:underline">
                                    📞 {plan.user.number}
                                  </a>
                                </div>
                              )}
                            </div>
                            {plan.user?.number && (
                              <div className="pt-2 border-t border-gray-100">
                                <a 
                                  href={`tel:${plan.user.number}`}
                                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-[rgb(183,36,42)] text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm sm:text-base"
                                >
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  Call Seller
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
              </section>
            ) : null}

            {/* Reviews — layout owned by InstallmentReviews (single visual stack) */}
            <section className="mt-2">
              {plan ? (
                <InstallmentReviews 
                  installmentPlanId={plan?.installmentPlanId ?? id} 
                  planId={plan?._id} 
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading product information...</p>
                </div>
              )}
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 border border-gray-200">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="text-2xl">🔗</span>
              Related Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedProducts.map((product) => (
                <NavLink
                  key={product._id}
                  to={`/installment/${encodeURIComponent(product.installmentPlanId || product._id)}`}
                  className="group bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[rgb(183,36,42)] hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                    <img
                      src={product.productImages?.[0] || PLACEHOLDER}
                      alt={`${product.productName || "Product"} - Installment Plan Comparison`}
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.category && (
                      <div className="absolute top-2 right-2 bg-[rgb(183,36,42)] text-white px-2 py-1 rounded-full text-xs font-bold">
                        {product.category}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-[rgb(183,36,42)] transition-colors">
                      {product.productName}
                    </h4>
                    
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                      {product.companyName && (
                        <>
                          <span className="font-medium">{product.companyName}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {product.city}
                      </span>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500"><span className="font-bold">Cash Price</span></div>
                          <div className="text-lg sm:text-xl font-bold text-[rgb(183,36,42)]">
                            PKR {Number(product.price || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Down Payment</div>
                          <div className="text-sm font-semibold text-gray-900">
                            PKR {Number(product.downpayment || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white text-sm font-bold rounded-lg group-hover:shadow-lg transition-all">
                      View Details →
                    </button>
                  </div>
                </NavLink>
              ))}
            </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

