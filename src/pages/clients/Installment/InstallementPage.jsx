import React, { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl";
import { Link } from "react-router-dom";
import LoadingPage from "../../../compontents/Loader";
import VideoPage from "../youtube/YoutubeVide";
import OurPartners from "../OverPartener";

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

const PAGE_SIZE = 8;

export default function InstallmentPlans() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
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
  const categories = useMemo(() => {
    const setCat = new Set();
    plans.forEach((p) => {
      if (p.category) setCat.add(p.category);
      if (p.customCategory) setCat.add(p.customCategory);
    });
    return Array.from(setCat).filter(Boolean);
  }, [plans]);

  const cities = useMemo(() => {
    const setCity = new Set();
    plans.forEach((p) => {
      if (p.city) setCity.add(p.city);
    });
    return Array.from(setCity).filter(Boolean);
  }, [plans]);

  // filtered data
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return plans.filter((p) => {
      if (selectedCategory) {
        const cat = (p.category || p.customCategory || "").toLowerCase();
        if (cat !== selectedCategory.toLowerCase()) return false;
      }
      if (selectedCity) {
        if ((p.city || "").toLowerCase() !== selectedCity.toLowerCase()) return false;
      }
      if (!q) return true;
      return (
        (p.productName || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.city || "").toLowerCase().includes(q) ||
        (p.companyName || "").toLowerCase().includes(q)
      );
    });
  }, [plans, search, selectedCategory, selectedCity]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 bg-clip-text text-transparent">
                Installment Plans
              </h1>
              <p className="text-sm text-gray-600 mt-2">Find the perfect payment plan for your dream product</p>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative flex-1 min-w-[240px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-transparent transition"
                />
              </div>

              <select 
                value={selectedCategory} 
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} 
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-transparent transition"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select 
                value={selectedCity} 
                onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }} 
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[rgb(183,36,42)] focus:border-transparent transition"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button 
                onClick={() => { setSearch(""); setSelectedCity(""); setSelectedCategory(""); setPage(1); }} 
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Reset
              </button>
            </div>
          </div>
        </header>

        {/* content */}
        {loading ? (
          <LoadingPage />
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-gray-500">No plans found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageData.map((plan) => (
                <article key={plan._id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100">
                  <div className="relative overflow-hidden">
                    <img
                      src={plan.productImages && plan.productImages.length ? plan.productImages[0] : "/placeholder.png"}
                      alt={plan.productName}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                      {plan.tenure || plan.customTenure || "—"}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${plan.status === "approved" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-3">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 min-h-[3rem]">{plan.productName}</h3>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgb(183,36,42)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="font-medium">{plan.city || "N/A"}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-600 font-medium">Monthly Payment</div>
                        <div className="text-xs text-gray-500">Down: {currency(plan.downpayment ?? plan.price * 0.2)}</div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[rgb(183,36,42)]">{currency(plan.installment)}</span>
                        <span className="text-sm text-gray-500">/month</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Total: {currency(plan.price)}</div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Link
                        to={`/installment/${plan._id}`}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white text-sm font-medium hover:shadow-lg transition text-center"
                      >
                        View Details
                      </Link>
                      <a href={`tel:${plan.user?.number || ""}`} className="px-4 py-2.5 rounded-lg border-2 border-[rgb(183,36,42)] text-[rgb(183,36,42)] text-sm font-medium hover:bg-[rgb(183,36,42)] hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* pagination */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing <span className="text-[rgb(183,36,42)] font-bold">{(page - 1) * PAGE_SIZE + 1}</span> to <span className="text-[rgb(183,36,42)] font-bold">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="text-[rgb(183,36,42)] font-bold">{filtered.length}</span> plans
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-[rgb(183,36,42)] hover:text-[rgb(183,36,42)] transition font-medium"
                >
                  Previous
                </button>
                <div className="px-4 py-2 bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white rounded-lg font-bold">
                  {page} / {totalPages}
                </div>
                <button 
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages} 
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-[rgb(183,36,42)] hover:text-[rgb(183,36,42)] transition font-medium"
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
