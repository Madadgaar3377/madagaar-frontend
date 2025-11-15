// src/pages/PropertiesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl";

const PAGE_SIZE = 6;

export default function PropertiesPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [city, setCity] = useState("All");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    async function fetchProperties() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          city,
          location,
          propertyType,
          budgetMin,
          budgetMax,
        }).toString();

        const res = await fetch(`${apiUrl}/property/public?${params}`);
        const payload = await res.json().catch(() => null);

        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Failed to load (${res.status})`);
        } else {
          if (mounted) setProperties(payload?.data || []);
        }
      } catch (err) {
        console.error("Fetch properties error:", err);
        setError("Network error — could not fetch properties.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProperties();
    return () => (mounted = false);
  }, [apiUrl, city, location, propertyType, budgetMin, budgetMax]);

  const totalPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE));

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return properties.slice(start, start + PAGE_SIZE);
  }, [properties, page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-red-700 via-rose-500 to-orange-400 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">
            Available Properties
          </h1>
          <p className="text-white/90">
            Browse properties filtered by city, location, type, or budget
          </p>
        </div>
      </header>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <input
          type="text"
          placeholder="Search location"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-300 w-full lg:w-1/3"
        />
        <select
          value={city}
          onChange={(e) => { setCity(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-300 w-full lg:w-1/5"
        >
          <option>All</option>
          <option>Karachi</option>
          <option>Lahore</option>
          <option>Islamabad</option>
        </select>
        <select
          value={propertyType}
          onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-300 w-full lg:w-1/5"
        >
          <option>All</option>
          <option>Apartment</option>
          <option>House</option>
          <option>Plot</option>
        </select>
        <div className="flex gap-2 w-full lg:w-1/4">
          <input
            type="number"
            placeholder="Min Budget"
            value={budgetMin}
            onChange={(e) => { setBudgetMin(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-gray-300 w-1/2"
          />
          <input
            type="number"
            placeholder="Max Budget"
            value={budgetMax}
            onChange={(e) => { setBudgetMax(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-gray-300 w-1/2"
          />
        </div>
      </section>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-center text-gray-500 py-20">Loading properties…</p>
        ) : error ? (
          <p className="text-center text-red-600 py-20">{error}</p>
        ) : properties.length === 0 ? (
          <p className="text-center text-gray-500 py-20">
            No properties found.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageData.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition flex flex-col overflow-hidden"
                >
                  {p.projectImages?.[0] && (
                    <img
                      src={p.projectImages[0]}
                      alt={p.projectName}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold mb-1">{p.projectName}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {p.propertyCity}, {p.propertyLocation}
                    </p>
                    <p className="text-sm font-medium text-red-700 mb-2">
                      Price: {p.price} PKR
                    </p>
                    {p.areaSize && (
                      <p className="text-sm text-gray-500 mb-2">
                        Area: {p.areaSize} {p.areaUnit || "sq. ft"}
                      </p>
                    )}
                    {p.isInstallment && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full w-max">
                        Installment Available
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border rounded-full disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border rounded-full disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
