import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path if needed
import LoadingPage from "../../../compontents/Loader";
import OurPartners from "../OverPartener";
import SEO from "../../../components/SEO";

const API = (backendBaseUrl || "").replace(/\/$/, "") || "";

// Helper to extract plain text from HTML for preview
const extractPlainText = (html, maxLength = 150) => {
  if (!html) return "No description available";
  
  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Get text content
  let text = (div.textContent || div.innerText || "").trim();
  
  // Truncate to maxLength
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }
  
  return text || "No description available";
};

export default function LoansPage() {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Madadgaar Loan Services",
    "description": "Compare and find the best loan options in Pakistan. Personal loans, home loans, business loans, and more from trusted financial institutions.",
    "url": "https://madadgaar.com.pk/loans",
    "areaServed": "Pakistan"
  };

  const [loanPlans, setLoanPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFinancingType, setSelectedFinancingType] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // show 9 plans per page

  // debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/getAllLoans`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json().catch(() => null);
        
        if (!body || !body.success) {
          throw new Error(body?.message || 'Failed to fetch loans');
        }
        
        const items = body.data || [];
        if (!ignore) setLoanPlans(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('Loan fetch error:', err);
        if (!ignore) setError(err.message || "Failed to load loan plans.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // reset to first page when search changes
  useEffect(() => setCurrentPage(1), [debouncedQuery]);

  const filtered = useMemo(() => {
    const q = (debouncedQuery || "").toLowerCase();
    return loanPlans.filter((p) => {
      // Category filter
      if (selectedCategory && p.majorCategory !== selectedCategory) {
        return false;
      }

      // Financing type filter
      if (selectedFinancingType && p.financingType !== selectedFinancingType) {
        return false;
      }

      // Search filter
      if (q) {
        return (
          (p.productName || "").toLowerCase().includes(q) ||
          (p.bankName || "").toLowerCase().includes(q) ||
          (p.majorCategory || "").toLowerCase().includes(q) ||
          (p.subCategory || "").toLowerCase().includes(q) ||
          (p.financingType || "").toLowerCase().includes(q) ||
          (p.planId || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [debouncedQuery, loanPlans, selectedCategory, selectedFinancingType]);

  // Get unique categories and financing types
  const categories = useMemo(() => {
    const cats = new Set();
    loanPlans.forEach((p) => {
      if (p.majorCategory) cats.add(p.majorCategory);
    });
    return Array.from(cats).sort();
  }, [loanPlans]);

  const financingTypes = useMemo(() => {
    const types = new Set();
    loanPlans.forEach((p) => {
      if (p.financingType) types.add(p.financingType);
    });
    return Array.from(types).sort();
  }, [loanPlans]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // clamp currentPage
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const visible = filtered.slice(startIdx, startIdx + pageSize);

  // small helpers
  const imgFallback = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60";
  };

  if (loading) return <LoadingPage />;

  return (
    <>
      <SEO
        title="Loan Plans Pakistan - Personal, Home, Auto & Business Loans | Madadgaar"
        description="Compare and find the best loan options in Pakistan. Personal loans, home loans, business loans, and more from trusted banks and financial institutions. Islamic and conventional financing available."
        keywords="loan plans pakistan, personal loan, home loan, auto loan, business loan, islamic financing, car financing, house financing, sme loans pakistan"
        canonicalUrl="https://madadgaar.com.pk/loans"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-4 sm:py-6 lg:py-8 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-800">Loan Plans</h1>
            <p className="mt-1 sm:mt-2 text-gray-600 max-w-2xl text-xs sm:text-sm lg:text-base">
              Explore loan offerings — home, personal, auto and business plans. Click details for eligibility, rates & repayment
              options, or click Apply to start.
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full">
            <div className="relative flex-1">
              <label htmlFor="loan-search" className="sr-only">Search loan plans</label>
              <input
                id="loan-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, provider, amount..."
                className="w-full rounded-full border px-4 py-2 text-xs sm:text-sm outline-none shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-red-400"
                aria-label="Search loan plans"
                autoComplete="off"
              />
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm">⌕</span>
            </div>

            <button
              onClick={() => navigate("/loan/apply")}
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 bg-[rgb(183,36,42)] text-white font-semibold shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Apply for Loan
            </button>

            {/* mobile quick action */}
            <button
              onClick={() => navigate("/loan/apply")}
              className="sm:hidden inline-flex items-center justify-center rounded-full p-2 bg-[rgb(183,36,42)] text-white font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-300"
              aria-label="Apply for loan"
            >
              Apply
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1">
              <label htmlFor="category-filter" className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="financing-filter" className="block text-xs font-medium text-gray-700 mb-1">
                Financing Type
              </label>
              <select
                id="financing-filter"
                value={selectedFinancingType}
                onChange={(e) => {
                  setSelectedFinancingType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
              >
                <option value="">All Types</option>
                {financingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedFinancingType("");
                  setQuery("");
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-white border p-4 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {totalItems === 0 && (
            <div className="col-span-full rounded-lg bg-white border p-4 sm:p-6 text-center text-sm sm:text-base text-gray-600 shadow-sm">No loan plans found.</div>
          )}

          {visible.map((plan) => {
            const tenureDisplay = plan.minTenure && plan.maxTenure 
              ? `${plan.minTenure}-${plan.maxTenure} ${plan.tenureUnit || 'Months'}`
              : plan.minTenure
              ? `${plan.minTenure}+ ${plan.tenureUnit || 'Months'}`
              : plan.maxTenure
              ? `Up to ${plan.maxTenure} ${plan.tenureUnit || 'Months'}`
              : "—";

            const amountDisplay = plan.minFinancingAmount && plan.maxFinancingAmount
              ? `PKR ${(plan.minFinancingAmount / 1000).toFixed(0)}K - ${(plan.maxFinancingAmount / 1000000).toFixed(1)}M`
              : plan.minFinancingAmount
              ? `From PKR ${(plan.minFinancingAmount / 1000).toFixed(0)}K`
              : plan.maxFinancingAmount
              ? `Up to PKR ${(plan.maxFinancingAmount / 1000000).toFixed(1)}M`
              : "—";

            return (
              <article
                key={plan._id || plan.planId}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-150"
              >
                {/* image */}
                <div className="h-36 sm:h-44 bg-gray-100 overflow-hidden relative">
                  <img
                    src={plan.planImage || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=60"}
                    alt={plan.productName || "Loan plan image"}
                    className="w-full h-full object-cover"
                    onError={imgFallback}
                  />
                  {/* Financing Type Badge */}
                  {plan.financingType && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm ${
                      plan.financingType === 'Islamic' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      {plan.financingType}
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 line-clamp-2">
                        {plan.productName || "Loan Plan"}
                      </h3>
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">
                        {plan.bankName || plan.createrinformation?.name || "—"}
                      </div>
                      {plan.majorCategory && (
                        <div className="text-[10px] sm:text-xs text-blue-600 mt-1 font-medium truncate">
                          {plan.majorCategory}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] sm:text-xs text-gray-500">Tenure</div>
                      <div className="font-semibold text-gray-800 text-xs sm:text-sm">
                        {tenureDisplay}
                      </div>
                    </div>
                  </div>

                  {/* Financing Amount */}
                  <div className="mt-2 sm:mt-3 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <div className="text-[10px] sm:text-xs text-gray-500">Financing Amount</div>
                    <div className="font-bold text-red-600 text-xs sm:text-sm mt-1">
                      {amountDisplay}
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-700 flex-1">
                    <div className="leading-snug line-clamp-2">
                      {extractPlainText(plan.description, 120)}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      <div className="text-[10px] sm:text-xs text-gray-500">Rate</div>
                      <div className="font-semibold text-gray-800 text-xs sm:text-sm">
                        {plan.indicativeRate || "—"}
                      </div>
                      {plan.rateType && (
                        <div className="text-[10px] text-gray-500">({plan.rateType})</div>
                      )}
                    </div>

                    <NavLink
                      to={`/loans/${plan._id || plan.planId}`}
                      className="w-full block px-3 py-2 rounded-md bg-gradient-to-r from-[rgb(183,36,42)] to-red-600 text-white text-xs sm:text-sm font-semibold hover:shadow-lg transition text-center"
                      aria-label={`View details for ${plan.productName || 'loan plan'}`}
                    >
                      View Details
                    </NavLink>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Pagination controls */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left" aria-live="polite">
              Showing <span className="font-semibold">{totalItems === 0 ? 0 : startIdx + 1}</span> - <span className="font-semibold">{endIdx}</span> of <span className="font-semibold">{totalItems}</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200`}
                aria-label="First page"
              >
                First
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200`}
                aria-label="Previous page"
              >
                Prev
              </button>

              {/* page numbers (responsive) */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const half = Math.floor(Math.min(5, totalPages) / 2);
                  let start = Math.max(1, currentPage - half);
                  const maxStart = Math.max(1, totalPages - (Math.min(5, totalPages) - 1));
                  if (start > maxStart) start = maxStart;
                  const page = start + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={`px-3 py-1 rounded-md border ${page === currentPage ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200`}
                aria-label="Next page"
              >
                Next
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200`}
                aria-label="Last page"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* Footer small CTA */}
        <div className="rounded-2xl bg-white p-6 border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-800">Need advice? Talk with our loan consultants</h4>
            <p className="text-sm text-gray-600">We’ll match you with the right plan and help with documentation.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/contact")} className="px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200">Contact Us</button>
            <button onClick={() => navigate("/loan/apply")} className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white focus:outline-none focus:ring-2 focus:ring-red-300">Start Application</button>
          </div>
        </div>

        {/* Details Modal / Partners component */}
        <OurPartners />
      </div>
    </div>
    </>
  );
}
