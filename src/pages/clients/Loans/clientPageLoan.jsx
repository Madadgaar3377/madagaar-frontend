// src/pages/LoansPage.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path if needed
import LoadingPage from "../../../compontents/Loader";

const API = (backendBaseUrl || "").replace(/\/$/, "") || "";

export default function LoansPage() {
  const navigate = useNavigate();

  const [loanPlans, setLoanPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/loanpost/get/public`);
        const body = await res.json().catch(() => null);
        const items = (body && body.data) || [];
        if (!cancelled) setLoanPlans(Array.isArray(items) ? items : []);
      } catch (err) {
        if (!cancelled) setError("Failed to load loan plans.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

 
  const handleApply = (plan) => {
    // Navigate to apply page and pass planId. The apply page should fetch plan or use planId to prefill.
    const planId = plan._id || plan.loanPlanId;
    navigate(`/loan/apply?planId=${encodeURIComponent(planId)}`);
  };

  const filtered = loanPlans.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (p.title || "").toLowerCase().includes(q) ||
      (p.planBy || "").toLowerCase().includes(q) ||
      (p.loanAmount || "").toLowerCase().includes(q) ||
      (p.loanPlanId || "").toLowerCase().includes(q)
    );
  });
  if (loading) {
    return (
      <LoadingPage />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Loan Plans</h1>
            <p className="mt-2 text-gray-600 max-w-xl">
              Explore loan offerings — home, personal, auto and business plans.
              Click details for eligibility, rates & repayment options, or click Apply to start.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, provider or id..."
                className="w-64 md:w-80 rounded-full border px-4 py-2 text-sm outline-none shadow-sm"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">⌕</span>
            </div>
            <button
              onClick={() => navigate("/loan/apply")}
              className="rounded-full px-4 py-2 bg-[rgb(183,36,42)] text-white font-semibold shadow"
            >
              Apply for Loan
            </button>
          </div>
        </header>

        {/* Loading / Error */}
        {loading && (
          <div className="rounded-lg bg-white border p-6 text-center text-gray-600 shadow-sm">
            Loading loan plans...
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-white border p-6 text-center text-red-500 shadow-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 && (
              <div className="col-span-full rounded-lg bg-white border p-6 text-center text-gray-600 shadow-sm">
                No loan plans found.
              </div>
            )}

            {filtered.map((plan) => (
              <article key={plan._id || plan.loanPlanId} className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
                {/* image */}
                <div className="h-44 bg-gray-100 overflow-hidden">
                  <img
                    src={(plan.loanImages && plan.loanImages[0]) || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60"}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
                      <div className="text-xs text-gray-500 mt-1">{plan.planBy || plan.user?.businessName || ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Tenure</div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {plan.tenure === "other" ? plan.tenureCustom || "Custom" : plan.tenure || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700 flex-1">
                    <div className="mb-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: plan.description ? plan.description.slice(0, 250) : "" }} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Interest</div>
                      <div className="font-semibold text-gray-800 text-sm">{plan.interestRate || plan.interestType || "—"}</div>
                    </div>

                    <div className="flex gap-2">
                      <NavLink
                        to={`/loans/${plan._id || plan.loanPlanId}`}
                        
                        className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                      >
                        Details
                      </NavLink>
                      <button
                        onClick={() => handleApply(plan)}
                        className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Footer small CTA */}
        <div className="rounded-2xl bg-white p-6 border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-800">Need advice? Talk with our loan consultants</h4>
            <p className="text-sm text-gray-600">We’ll match you with the right plan and help with documentation.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/contact")} className="px-4 py-2 rounded-md border">Contact Us</button>
            <button onClick={() => navigate("/loan/apply")} className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white">Start Application</button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
     
    </div>
  );
}
