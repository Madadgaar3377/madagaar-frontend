import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path if needed
import LoadingPage from "../../../compontents/Loader";
import OurPartners from "../OverPartener";

const API = (backendBaseUrl || "").replace(/\/$/, "") || "";

export default function LoansPage() {
  const navigate = useNavigate();

  const [loanPlans, setLoanPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
        const res = await fetch(`${API}/loanpost/get/public`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json().catch(() => null);
        const items = (body && body.data) || [];
        if (!ignore) setLoanPlans(Array.isArray(items) ? items : []);
      } catch (err) {
        if (!ignore) setError("Failed to load loan plans.");
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

  const handleApply = (plan) => {
    const planId = plan._id || plan.loanPlanId;
    navigate(`/loan/apply/planId/${encodeURIComponent(planId)}`);
  };

  const filtered = useMemo(() => {
    const q = (debouncedQuery || "").toLowerCase();
    if (!q) return loanPlans;
    return loanPlans.filter((p) => {
      return (
        (p.title || "").toLowerCase().includes(q) ||
        (p._id || "").toLowerCase().includes(q) ||
        (p.planBy || "").toLowerCase().includes(q) ||
        String(p.loanAmount || "").toLowerCase().includes(q) ||
        (p.loanPlanId || "").toLowerCase().includes(q)
      );
    });
  }, [debouncedQuery, loanPlans]);

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

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-white border p-4 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {totalItems === 0 && (
            <div className="col-span-full rounded-lg bg-white border p-4 sm:p-6 text-center text-sm sm:text-base text-gray-600 shadow-sm">No loan plans found.</div>
          )}

          {visible.map((plan) => (
            <article
              key={plan._id || plan.loanPlanId}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-150"
            >
              {/* image */}
              <div className="h-36 sm:h-44 bg-gray-100 overflow-hidden">
                <img
                  src={(plan.loanImages && plan.loanImages[0]) || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60"}
                  alt={plan.title || "Loan plan image"}
                  className="w-full h-full object-cover"
                  onError={imgFallback}
                />
              </div>

              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 line-clamp-2">{plan.title || "Untitled Plan"}</h3>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{plan.planBy || plan.user?.businessName || "—"}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] sm:text-xs text-gray-500">Tenure</div>
                    <div className="font-semibold text-gray-800 text-xs sm:text-sm">{plan.tenure === "other" ? plan.tenureCustom || "Custom" : plan.tenure || "—"}</div>
                  </div>
                </div>

                <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-700 flex-1">
                  <div className="mb-2 leading-snug line-clamp-3" dangerouslySetInnerHTML={{ __html: plan.description ? (plan.description.slice(0, 300)) : "" }} />
                </div>

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <div className="text-[10px] sm:text-xs text-gray-500">Interest</div>
                    <div className="font-semibold text-gray-800 text-xs sm:text-sm">{plan.interestRate || plan.interestType || "—"}</div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <NavLink
                      to={`/loans/${plan._id || plan.loanPlanId}`}
                      className="flex-1 sm:flex-none px-3 py-2 rounded-md border text-xs sm:text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200 text-center"
                      aria-label={`View details for ${plan.title || 'loan plan'}`}
                    >
                      Details
                    </NavLink>
                    <button
                      onClick={() => handleApply(plan)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white text-xs sm:text-sm font-semibold hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-red-300 whitespace-nowrap"
                      aria-label={`Apply for ${plan.title || 'loan plan'}`}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
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
      </div>

      {/* Details Modal / Partners component */}
      <OurPartners />

         </div>
  );
}
