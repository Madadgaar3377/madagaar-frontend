import React, { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl";
import { Link } from "react-router-dom";
import VideoPage from "../youtube/YoutubeVide";
import OurPartners from "../OverPartener";
import SEO from "../../../components/SEO";
import citiesList from "../../../constants/cities";

// Category options - comprehensive list
const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "Laptops", label: "Laptops" },
  { value: "Desktop Computers", label: "Desktop Computers" },
  { value: "phones", label: "Phones / Mobile" }, // Legacy support
  { value: "Tablets", label: "Tablets" },
  { value: "Projectors", label: "Projectors" },
  { value: "Printers", label: "Printers" },
  { value: "Scanners", label: "Scanners" },
  { value: "CCTV Camera Systems", label: "CCTV Camera Systems" },
  { value: "Biometric Attendance Machines", label: "Biometric Attendance Machines" },
  { value: "Access Control Systems", label: "Access Control Systems" },
  { value: "Gaming Consoles", label: "Gaming Consoles" },
  { value: "LED / Smart TVs", label: "LED / Smart TVs" },
  { value: "Home Theatre Systems", label: "Home Theatre Systems" },
  { value: "Sound Systems / Speakers", label: "Sound Systems / Speakers" },
  { value: "Smart Watches", label: "Smart Watches" },
  { value: "Air Conditioners", label: "Air Conditioners" },
  { value: "air_conditioner", label: "Air Conditioner" }, // Legacy support
  { value: "Refrigerators", label: "Refrigerators" },
  { value: "Deep Freezers", label: "Deep Freezers" },
  { value: "Washing Machines", label: "Washing Machines" },
  { value: "Dryers", label: "Dryers" },
  { value: "Microwave/Electric Ovens", label: "Microwave/Electric Ovens" },
  { value: "Water Dispensers", label: "Water Dispensers" },
  { value: "Vacuum Cleaners", label: "Vacuum Cleaners" },
  { value: "Fans", label: "Fans" },
  { value: "Heaters", label: "Heaters" },
  { value: "Air Coolers", label: "Air Coolers" },
  { value: "Solar Panels / Solar Systems", label: "Solar Panels / Solar Systems" },
  { value: "Inverters", label: "Inverters" },
  { value: "Batteries", label: "Batteries" },
  { value: "UPS (Uninterruptible Power Supply)", label: "UPS (Uninterruptible Power Supply)" },
  { value: "Cars", label: "Cars" },
  { value: "Motorcycles (Bikes / Scooters) - Mechanical", label: "Motorcycles (Bikes / Scooters) - Mechanical" },
  { value: "bikes_mechanical", label: "Bikes — Mechanical" }, // Legacy support
  { value: "Motorcycles (Bikes / Scooters) - Electrical", label: "Motorcycles (Bikes / Scooters) - Electrical" },
  { value: "bikes_electric", label: "Bikes — Electric" }, // Legacy support
  { value: "Tyres", label: "Tyres" },
  { value: "Office Furniture", label: "Office Furniture" },
  { value: "Home Furniture", label: "Home Furniture" },
  { value: "Mattresses", label: "Mattresses" },
  { value: "appliances", label: "Home Appliances / Other" }, // Legacy support
  { value: "other", label: "Other (Custom)" },
];

// Sort options
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "monthly_low", label: "Monthly Payment: Low to High" },
  { value: "monthly_high", label: "Monthly Payment: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

/**
 * InstallmentPlans.jsx
 *
 * Fetches: GET `${backendBaseUrl}/installmentplan/get/public`
 * - Displays plans in a responsive grid
 * - Search, filter (category, city), pagination
 * - Card detail modal with image carousel and video playback
 *
 * No external libraries required.
 */

const PAGE_SIZE = 36; // Show 36 items per page (6x6 grid on large screens)

export default function InstallmentPlans() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Installment Plans & EMI Services",
    "name": "Madadgaar Installment Plans",
    "description": "Big dreams? Pay small, with flexible plans that fit your budget. Compare EMI plans, interest rates, and tenure options for electronics, home appliances, furniture, machinery, and consumer goods.",
    "url": "https://madadgaar.com.pk/installments",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Madadgaar Expert Partner",
      "url": "https://madadgaar.com.pk"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Pakistan"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PKR",
      "description": "Free installment plan comparison and application services"
    }
  };

  // UI state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [monthlyMin, setMonthlyMin] = useState("");
  const [monthlyMax, setMonthlyMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);


  useEffect(() => {
    let mounted = true;
    async function fetchPlans() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/getAllInstallments`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Failed to load (${res.status})`);
        } else {
          const data = payload?.data ?? payload ?? [];
          if (mounted) setPlans(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Network error — could not fetch installment plans.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPlans();
    return () => (mounted = false);
  }, [apiUrl]);

  // derived lists for filters
  const availableCategories = useMemo(() => {
    const setCat = new Set();
    plans.forEach((p) => {
      if (p.category) setCat.add(p.category);
      if (p.customCategory) setCat.add(p.customCategory);
    });
    return Array.from(setCat).filter(Boolean);
  }, [plans]);


  // Cities: Use predefined list, but also include any custom cities from plans
  const cities = useMemo(() => {
    const predefinedCities = Array.isArray(citiesList) 
      ? citiesList.map(c => typeof c === 'string' ? c : (c.value || c.title || c))
      : [];
    const setCity = new Set(predefinedCities);
    plans.forEach((p) => {
      if (p.city) setCity.add(p.city);
    });
    return Array.from(setCity).filter(Boolean).sort();
  }, [plans]);

  // Helper to get the best (lowest monthly installment) plan
  const getBestPlan = (plan) => {
    if (!plan.paymentPlans || !Array.isArray(plan.paymentPlans) || plan.paymentPlans.length === 0) {
      // Fallback to legacy fields
      return {
        monthlyInstallment: plan.installment || 0,
        downPayment: plan.downpayment || 0,
        tenureMonths: plan.tenure || plan.customTenure || "—",
        planName: "Standard Plan"
      };
    }
    
    // Find plan with lowest monthly installment
    const bestPlan = plan.paymentPlans.reduce((best, current) => {
      const currentMonthly = Number(current.monthlyInstallment || 0);
      const bestMonthly = Number(best.monthlyInstallment || 0);
      return currentMonthly > 0 && (bestMonthly === 0 || currentMonthly < bestMonthly) ? current : best;
    }, plan.paymentPlans[0]);
    
    return {
      monthlyInstallment: bestPlan.monthlyInstallment || 0,
      downPayment: bestPlan.downPayment || 0,
      tenureMonths: bestPlan.tenureMonths || bestPlan.customTenureLabel || plan.tenure || plan.customTenure || "—",
      planName: bestPlan.planName || "Best Plan",
      interestRatePercent: bestPlan.interestRatePercent || 0,
      interestType: bestPlan.interestType || ""
    };
  };

  // Get price range from plans for filter limits
  const priceRange = useMemo(() => {
    if (plans.length === 0) return { min: 0, max: 0 };
    const prices = plans.map(p => Number(p.price || 0)).filter(p => p > 0);
    if (prices.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [plans]);

  // Get monthly payment range
  const monthlyRange = useMemo(() => {
    if (plans.length === 0) return { min: 0, max: 0 };
    const monthlyPayments = plans.map(p => {
      const bestPlan = getBestPlan(p);
      return Number(bestPlan.monthlyInstallment || 0);
    }).filter(m => m > 0);
    if (monthlyPayments.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...monthlyPayments),
      max: Math.max(...monthlyPayments)
    };
  }, [plans]);

  // filtered and sorted data
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filteredPlans = plans.filter((p) => {
      // Category filter
      if (selectedCategory) {
        const cat = (p.category || p.customCategory || "").toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();
        // Support legacy category values
        const categoryMap = {
          "phones": ["phones", "smartphones / mobile", "smartphones", "mobile"],
          "bikes_mechanical": ["bikes_mechanical", "motorcycles (bikes / scooters) - mechanical", "bikes — mechanical"],
          "bikes_electric": ["bikes_electric", "motorcycles (bikes / scooters) - electrical", "bikes — electric"],
          "air_conditioner": ["air_conditioner", "air conditioners", "air conditioner"],
          "appliances": ["appliances", "home appliances / other"]
        };
        const matches = categoryMap[selectedCat]?.some(m => cat.includes(m)) || cat === selectedCat;
        if (!matches) return false;
      }
      // City filter
      if (selectedCity) {
        if ((p.city || "").toLowerCase() !== selectedCity.toLowerCase()) return false;
      }
      // Price range filter
      const price = Number(p.price || 0);
      if (priceMin && price < Number(priceMin)) return false;
      if (priceMax && price > Number(priceMax)) return false;
      // Monthly payment filter
      const bestPlan = getBestPlan(p);
      const monthly = Number(bestPlan.monthlyInstallment || 0);
      if (monthlyMin && monthly < Number(monthlyMin)) return false;
      if (monthlyMax && monthly > Number(monthlyMax)) return false;
      // Search filter
      if (!q) return true;
      return (
        (p.productName || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q) ||
        (p.companyName || p.companyNameOther || "").toLowerCase().includes(q) ||
        (p.category || p.customCategory || "").toLowerCase().includes(q)
      );
    });

    // Sort filtered plans
    filteredPlans = [...filteredPlans].sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return (Number(a.price || 0)) - (Number(b.price || 0));
        case "price_high":
          return (Number(b.price || 0)) - (Number(a.price || 0));
        case "monthly_low": {
          const aMonthly = Number(getBestPlan(a).monthlyInstallment || 0);
          const bMonthly = Number(getBestPlan(b).monthlyInstallment || 0);
          return aMonthly - bMonthly;
        }
        case "monthly_high": {
          const aMonthly = Number(getBestPlan(a).monthlyInstallment || 0);
          const bMonthly = Number(getBestPlan(b).monthlyInstallment || 0);
          return bMonthly - aMonthly;
        }
        case "name_asc":
          return (a.productName || "").localeCompare(b.productName || "");
        case "name_desc":
          return (b.productName || "").localeCompare(a.productName || "");
        case "newest":
        default:
          return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
      }
    });

    return filteredPlans;
  }, [plans, search, selectedCategory, selectedCity, sortBy, priceMin, priceMax, monthlyMin, monthlyMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]); // reset if filters change

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // helpers
  const currency = (v) =>
    typeof v === "number" ? v.toLocaleString("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }) : v;

  return (
    <>
    <SEO
      title="Madadgaar Installment Plans | Big dreams? Pay small, with flexible plans that fit your budget"
      description="Explore Installment Products – Compare, Select & Apply. Madadgaar helps you compare EMI plans, interest rates, and tenure options for electronics, home appliances, furniture, machinery, and consumer goods — all on one easy-to-use platform."
      keywords="installment plans pakistan, buy on installments, monthly payments pakistan, installment shopping, zero markup, low interest installments, electronics on installment, furniture installment, appliances installment pakistan, EMI plans pakistan, buy now pay later pakistan"
      canonicalUrl="https://madadgaar.com.pk/installments"
      structuredData={structuredData}
    />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 section-padding-sm">
      <div className="container-content">
        <header className="mb-4 sm:mb-6 lg:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 bg-clip-text text-transparent leading-tight">
                Madadgaar Installment Plans
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 leading-relaxed">
                Big dreams? Pay small, with flexible plans that fit your budget.{" "}
                <a href="/faq#installment" className="text-[rgb(183,36,42)] hover:text-red-700 font-semibold underline decoration-2 underline-offset-2 transition">Learn about installment plans</a>{" "}
                or{" "}
                <a href="/loans" className="text-[rgb(183,36,42)] hover:text-red-700 font-semibold underline decoration-2 underline-offset-2 transition">compare financing options</a>.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Main Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search products..."
                  className="block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition-all shadow-sm hover:border-gray-300"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setPage(1); }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filters Row - All Visible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                {/* Category Dropdown */}
                <select 
                  value={selectedCategory} 
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl bg-white text-xs sm:text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition-all shadow-sm hover:border-gray-300 cursor-pointer min-h-[44px]"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                  {/* Show custom categories that aren't in the predefined list */}
                  {availableCategories
                    .filter(cat => !CATEGORY_OPTIONS.some(opt => opt.value.toLowerCase() === cat.toLowerCase()))
                    .map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {/* City Dropdown */}
                <select 
                  value={selectedCity} 
                  onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl bg-white text-xs sm:text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition-all shadow-sm hover:border-gray-300 cursor-pointer min-h-[44px]"
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select 
                  value={sortBy} 
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl bg-white text-xs sm:text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition-all shadow-sm hover:border-gray-300 cursor-pointer min-h-[44px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* Filter Button */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px] ${
                    showFilters 
                      ? "bg-[rgb(183,36,42)] text-white hover:bg-red-700" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200"
                  }`}
                  aria-label={showFilters ? "Hide filters" : "Show more filters"}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>{showFilters ? "Hide" : "More"} Filters</span>
                </button>

                {/* Reset Button */}
                <button 
                  onClick={() => { 
                    setSearch(""); 
                    setSelectedCity(""); 
                    setSelectedCategory(""); 
                    setSortBy("newest");
                    setPriceMin("");
                    setPriceMax("");
                    setMonthlyMin("");
                    setMonthlyMax("");
                    setPage(1); 
                  }} 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-[rgb(183,36,42)] hover:bg-red-700 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
                  aria-label="Reset all filters"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset All</span>
                </button>
              </div>

              {/* Advanced Filters - Collapsible */}
              {showFilters && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-gray-200 shadow-sm space-y-4 sm:space-y-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                    {/* Price Range Slider */}
                    <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200">
                      <label className="block text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">
                        <span className="block mb-1 sm:mb-2">Cash Price Range (PKR)</span>
                        {priceMin || priceMax ? (
                          <span className="block text-[rgb(183,36,42)] font-bold text-base sm:text-lg mt-2">
                            {priceMin ? `PKR ${Number(priceMin).toLocaleString()}` : `PKR ${priceRange.min.toLocaleString()}`} - {priceMax ? `PKR ${Number(priceMax).toLocaleString()}` : `PKR ${priceRange.max.toLocaleString()}`}
                          </span>
                        ) : null}
                      </label>
                      {priceRange.max > 0 && (
                        <>
                          <div className="relative py-2">
                            <input
                              type="range"
                              min={priceRange.min}
                              max={priceRange.max}
                              step={Math.max(1000, Math.floor(priceRange.max / 100))}
                              value={priceMin || priceRange.min}
                              onChange={(e) => { 
                                const val = Number(e.target.value);
                                setPriceMin(val.toString());
                                if (priceMax && val > Number(priceMax)) setPriceMax(val.toString());
                                setPage(1); 
                              }}
                              className="w-full h-2.5 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[rgb(183,36,42)]"
                              style={{
                                background: `linear-gradient(to right, rgb(183,36,42) 0%, rgb(183,36,42) ${((Number(priceMin || priceRange.min) - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, #e5e7eb ${((Number(priceMin || priceRange.min) - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, #e5e7eb 100%)`
                              }}
                            />
                            <input
                              type="range"
                              min={priceRange.min}
                              max={priceRange.max}
                              step={Math.max(1000, Math.floor(priceRange.max / 100))}
                              value={priceMax || priceRange.max}
                              onChange={(e) => { 
                                const val = Number(e.target.value);
                                setPriceMax(val.toString());
                                if (priceMin && val < Number(priceMin)) setPriceMin(val.toString());
                                setPage(1); 
                              }}
                              className="absolute top-2 left-0 w-full h-2.5 sm:h-3 bg-transparent rounded-lg appearance-none cursor-pointer accent-[rgb(183,36,42)] pointer-events-none"
                              style={{
                                background: `linear-gradient(to right, transparent 0%, transparent ${((Number(priceMax || priceRange.max) - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, rgb(183,36,42) ${((Number(priceMax || priceRange.max) - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%, rgb(183,36,42) 100%)`
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-2 font-medium">
                            <span className="truncate">PKR {priceRange.min.toLocaleString()}</span>
                            <span className="truncate ml-2">PKR {priceRange.max.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <input
                              type="number"
                              value={priceMin}
                              onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                              placeholder="Min"
                              min={priceRange.min}
                              max={priceRange.max}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition min-h-[44px]"
                            />
                            <input
                              type="number"
                              value={priceMax}
                              onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                              placeholder="Max"
                              min={priceRange.min}
                              max={priceRange.max}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition min-h-[44px]"
                            />
                            {(priceMin || priceMax) && (
                              <button
                                onClick={() => { setPriceMin(""); setPriceMax(""); setPage(1); }}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition min-h-[44px]"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Monthly Payment Range Slider */}
                    <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 shadow-sm">
                      <label className="block text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">
                        <span className="block mb-1 sm:mb-2">Monthly Payment Range (PKR)</span>
                        {monthlyMin || monthlyMax ? (
                          <span className="block text-[rgb(183,36,42)] font-bold text-base sm:text-lg mt-2">
                            {monthlyMin ? `PKR ${Number(monthlyMin).toLocaleString()}` : `PKR ${monthlyRange.min.toLocaleString()}`} - {monthlyMax ? `PKR ${Number(monthlyMax).toLocaleString()}` : `PKR ${monthlyRange.max.toLocaleString()}`}
                          </span>
                        ) : null}
                      </label>
                      {monthlyRange.max > 0 && (
                        <>
                          <div className="relative py-2">
                            <input
                              type="range"
                              min={monthlyRange.min}
                              max={monthlyRange.max}
                              step={Math.max(100, Math.floor(monthlyRange.max / 100))}
                              value={monthlyMin || monthlyRange.min}
                              onChange={(e) => { 
                                const val = Number(e.target.value);
                                setMonthlyMin(val.toString());
                                if (monthlyMax && val > Number(monthlyMax)) setMonthlyMax(val.toString());
                                setPage(1); 
                              }}
                              className="w-full h-2.5 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[rgb(183,36,42)]"
                              style={{
                                background: `linear-gradient(to right, rgb(183,36,42) 0%, rgb(183,36,42) ${((Number(monthlyMin || monthlyRange.min) - monthlyRange.min) / (monthlyRange.max - monthlyRange.min)) * 100}%, #e5e7eb ${((Number(monthlyMin || monthlyRange.min) - monthlyRange.min) / (monthlyRange.max - monthlyRange.min)) * 100}%, #e5e7eb 100%)`
                              }}
                            />
                            <input
                              type="range"
                              min={monthlyRange.min}
                              max={monthlyRange.max}
                              step={Math.max(100, Math.floor(monthlyRange.max / 100))}
                              value={monthlyMax || monthlyRange.max}
                              onChange={(e) => { 
                                const val = Number(e.target.value);
                                setMonthlyMax(val.toString());
                                if (monthlyMin && val < Number(monthlyMin)) setMonthlyMin(val.toString());
                                setPage(1); 
                              }}
                              className="absolute top-2 left-0 w-full h-2.5 sm:h-3 bg-transparent rounded-lg appearance-none cursor-pointer accent-[rgb(183,36,42)] pointer-events-none"
                              style={{
                                background: `linear-gradient(to right, transparent 0%, transparent ${((Number(monthlyMax || monthlyRange.max) - monthlyRange.min) / (monthlyRange.max - monthlyRange.min)) * 100}%, rgb(183,36,42) ${((Number(monthlyMax || monthlyRange.max) - monthlyRange.min) / (monthlyRange.max - monthlyRange.min)) * 100}%, rgb(183,36,42) 100%)`
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] sm:text-xs lg:text-sm text-gray-500 mt-2 font-medium">
                            <span className="truncate">PKR {monthlyRange.min.toLocaleString()}</span>
                            <span className="truncate ml-2">PKR {monthlyRange.max.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <input
                              type="number"
                              value={monthlyMin}
                              onChange={(e) => { setMonthlyMin(e.target.value); setPage(1); }}
                              placeholder="Min"
                              min={monthlyRange.min}
                              max={monthlyRange.max}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition min-h-[44px]"
                            />
                            <input
                              type="number"
                              value={monthlyMax}
                              onChange={(e) => { setMonthlyMax(e.target.value); setPage(1); }}
                              placeholder="Max"
                              min={monthlyRange.min}
                              max={monthlyRange.max}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-[rgb(183,36,42)] transition min-h-[44px]"
                            />
                            {(monthlyMin || monthlyMax) && (
                              <button
                                onClick={() => { setMonthlyMin(""); setMonthlyMax(""); setPage(1); }}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition min-h-[44px]"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {[...Array(12)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-40 sm:h-48 bg-gray-200"></div>
                <div className="p-3 sm:p-4 lg:p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 sm:py-12 text-center text-red-600 text-sm sm:text-base px-4">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 sm:py-24 text-center text-gray-500 text-sm sm:text-base">No plans found.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {pageData.map((plan) => {
                const bestPlan = getBestPlan(plan);
                const hasMultiplePlans = plan.paymentPlans && Array.isArray(plan.paymentPlans) && plan.paymentPlans.length > 1;
                
                return (
                <article key={plan._id} className="group bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100">
                  <div className="relative overflow-hidden">
                    <img
                      src={plan.productImages && plan.productImages.length ? plan.productImages[0] : "/placeholder.png"}
                      alt={`${plan.productName} - Installment Plan in ${plan.city || "Pakistan"}`}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {hasMultiplePlans && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-[rgb(183,36,42)]/95 backdrop-blur-sm text-white text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-bold shadow-sm">
                        ⭐ Best Plan
                      </div>
                    )}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm ${plan.status === "approved" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 lg:p-5 flex flex-col gap-2 sm:gap-3">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{plan.productName}</h3>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-[rgb(183,36,42)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="font-medium truncate">{plan.city || "N/A"}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-2 sm:p-3 border border-red-100">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <div className="text-[10px] sm:text-xs text-gray-600 font-medium">
                          {hasMultiplePlans ? `Best: ${bestPlan.planName}` : "Monthly Payment"}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500">
                          Down: {currency(bestPlan.downPayment || plan.downpayment || plan.price * 0.2)}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(183,36,42)]">
                          {currency(bestPlan.monthlyInstallment || plan.installment || 0)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">/month</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-[15px] sm:text-x text-gray-600">
                          <span className="font-extrabold text-black">Cash Price:</span> {currency(plan.price)}
                        </div>
                        {typeof bestPlan.tenureMonths === 'number' && (
                          <div className="text-[15px] sm:text-xs text-black font-medium">
                            {bestPlan.tenureMonths} Months
                          </div>
                        )}
                      </div>
                      {hasMultiplePlans && (
                        <div className="text-[9px] sm:text-[10px] text-gray-500 mt-1 pt-1 border-t border-red-200">
                          {plan.paymentPlans.length} plan{plan.paymentPlans.length > 1 ? 's' : ''} available
                        </div>
                      )}
                    </div>

                    <div className="mt-1 sm:mt-2">
                      <Link
                        to={`/installment/${plan._id}`}
                        className="block w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white text-xs sm:text-sm font-medium hover:shadow-lg transition text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>

            {/* pagination */}
            <div className="mt-4 sm:mt-6 lg:mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium text-center sm:text-left">
                Showing <span className="text-[rgb(183,36,42)] font-bold">{(page - 1) * PAGE_SIZE + 1}</span> to <span className="text-[rgb(183,36,42)] font-bold">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="text-[rgb(183,36,42)] font-bold">{filtered.length}</span> {filtered.length === 1 ? 'plan' : 'plans'}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                <button 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-[rgb(183,36,42)] hover:text-[rgb(183,36,42)] hover:bg-red-50 transition-all font-semibold active:scale-95"
                >
                  Previous
                </button>
                <div className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white rounded-xl font-bold shadow-sm">
                  {page} / {totalPages}
                </div>
                <button 
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages} 
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-[rgb(183,36,42)] hover:text-[rgb(183,36,42)] hover:bg-red-50 transition-all font-semibold active:scale-95"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
          <OurPartners />
    <VideoPage />
    </>
  );
}
