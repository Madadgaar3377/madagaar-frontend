import React, { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl";

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
const BRAND = "rgb(183,36,42)";

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

  // modal
  const [openPlan, setOpenPlan] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchPlans() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/installmentplan/get/public`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Failed to load (${res.status})`);
        } else {
          const data = payload?.data ?? [];
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
  }, [totalPages]); // reset if filters change

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // helpers
  const currency = (v) =>
    typeof v === "number" ? v.toLocaleString("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }) : v;

  const openDetails = (plan) => {
    setOpenPlan(plan);
    setCarouselIndex(0);
    document.body.style.overflow = "hidden";
  };
  const closeDetails = () => {
    setOpenPlan(null);
    document.body.style.overflow = "";
  };

  const prevImage = () => {
    if (!openPlan) return;
    setCarouselIndex((i) => (i - 1 + (openPlan.productImages?.length || 1)) % (openPlan.productImages?.length || 1));
  };
  const nextImage = () => {
    if (!openPlan) return;
    setCarouselIndex((i) => ((i + 1) % (openPlan.productImages?.length || 1)));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Installment Plans</h1>
            <p className="text-sm text-gray-500 mt-1">Explore available installment plans near you.</p>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, city, company..."
              className="px-3 py-2 border border-gray-200 rounded-md w-64 focus:ring-2"
              style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)" }}
            />

            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-md">
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-md">
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button onClick={() => { setSearch(""); setSelectedCity(""); setSelectedCategory(""); setPage(1); }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Reset</button>
          </div>
        </header>

        {/* content */}
        {loading ? (
          <div className="py-24 text-center text-gray-500">Loading installment plans...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-gray-500">No plans found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageData.map((plan) => (
                <article key={plan._id} className="bg-white rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-1 transition">
                  <div className="relative">
                    <img
                      src={plan.productImages && plan.productImages.length ? plan.productImages[0] : "/placeholder.png"}
                      alt={plan.productName}
                      className="w-full h-44 object-cover"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <div className="absolute top-3 left-3 bg-white/70 text-xs px-2 py-1 rounded-full font-medium">
                      {plan.tenure || plan.customTenure || "—"}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{plan.productName}</h3>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v4a1 1 0 001 1h16M3 7a2 2 0 012-2h14a2 2 0 012 2M7 11V7m10 4V7M8 21h8" /></svg>
                        <span>{plan.city || "N/A"}</span>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500">Down</div>
                        <div className="font-semibold">{currency(plan.downpayment ?? plan.price * 0.2)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Installment</div>
                        <div className="text-lg font-bold text-[rgb(183,36,42)]">{currency(plan.installment)}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="font-semibold">{currency(plan.price)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <button onClick={() => openDetails(plan)} className="flex-1 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-sm text-sm">Details</button>
                      <a href={`tel:${plan.user?.number || ""}`} className="px-3 py-2 rounded-md bg-[rgb(183,36,42)] text-white text-sm">Call</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* pagination */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Showing <strong>{(page - 1) * PAGE_SIZE + 1}</strong> — <strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                <div className="px-3 py-1 border rounded bg-white">Page {page} / {totalPages}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}

        {/* Details Modal */}
        {openPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={closeDetails} />

            <div className="relative z-10 max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 bg-gray-100 relative">
                  {/* Carousel */}
                  <div className="h-72 lg:h-full flex items-center justify-center bg-black/5">
                    {openPlan.productImages && openPlan.productImages.length ? (
                      <img
                        src={openPlan.productImages[carouselIndex]}
                        alt="plan"
                        className="w-full h-72 lg:h-full object-contain bg-white"
                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                      />
                    ) : (
                      <div className="text-gray-500">No image</div>
                    )}
                  </div>

                  {/* carousel controls */}
                  {openPlan.productImages && openPlan.productImages.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow">
                        ‹
                      </button>
                      <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow">
                        ›
                      </button>
                    </>
                  )}
                </div>

                <div className="lg:w-1/2 p-6 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{openPlan.productName}</h2>
                      <div className="text-sm text-gray-500 mt-1">{openPlan.companyName || openPlan.companyNameOther || ""} • {openPlan.category}</div>
                    </div>
                    <div>
                      <button onClick={closeDetails} className="text-gray-500 px-2 py-1 hover:text-gray-700">Close ✕</button>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-700 flex-1 overflow-auto">
                    <p className="whitespace-pre-line">{openPlan.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>
                        <div className="text-xs text-gray-500">Down Payment</div>
                        <div className="font-semibold">{currency(openPlan.downpayment ?? openPlan.price * 0.2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Monthly Installment</div>
                        <div className="font-semibold">{currency(openPlan.installment)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Tenure</div>
                        <div className="font-semibold">{openPlan.tenure || openPlan.customTenure || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="font-semibold">{openPlan.city}</div>
                      </div>
                    </div>

                    <div className="mt-4 border-t pt-3">
                      <h4 className="text-sm font-semibold mb-2">Seller</h4>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                          {openPlan.user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{openPlan.user?.fullName}</div>
                          <div className="text-xs text-gray-500">{openPlan.user?.city}</div>
                        </div>
                        <div className="ml-auto">
                          <a className="text-sm text-[rgb(183,36,42)] font-semibold" href={`tel:${openPlan.user?.number || ""}`}>Call Seller</a>
                        </div>
                      </div>
                    </div>

                    {openPlan.videoUrl && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Video</h4>
                        <video controls src={openPlan.videoUrl} className="w-full rounded-md" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <a href={`tel:${openPlan.user?.number || ""}`} className="flex-1 text-center px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white font-semibold">Call to Buy</a>
                    <a href={`/#/installment/${openPlan._id}`} className="flex-1 text-center px-4 py-2 rounded-md border border-gray-200">View listing</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
