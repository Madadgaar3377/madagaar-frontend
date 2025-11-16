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

  // Modal state
  const [selectedProperty, setSelectedProperty] = useState(null);

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
                    <button
                      onClick={() => setSelectedProperty(p)}
                      className="mt-auto pt-3 text-sm font-medium text-white bg-red-700 hover:bg-red-800 px-3 py-2 rounded-lg transition"
                    >
                      View Details
                    </button>
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

      {/* Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-700 via-rose-500 to-orange-400 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedProperty.projectName}</h2>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-2xl font-bold hover:opacity-80"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Images */}
              {selectedProperty.projectImages && selectedProperty.projectImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedProperty.projectImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedProperty.projectName} ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">City</p>
                    <p className="text-base font-medium">{selectedProperty.propertyCity}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-base font-medium">{selectedProperty.propertyLocation}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Property Type</p>
                    <p className="text-base font-medium">{selectedProperty.propertyType || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-base font-medium text-red-700">{selectedProperty.price} PKR</p>
                  </div>
                </div>
              </div>

              {/* Area & Size */}
              {(selectedProperty.areaSize || selectedProperty.areaUnit) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Area</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-base">
                      {selectedProperty.areaSize} {selectedProperty.areaUnit || "sq. ft"}
                    </p>
                  </div>
                </div>
              )}

              {/* Features */}
              {(selectedProperty.bedrooms || selectedProperty.bathrooms || selectedProperty.kitchens) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedProperty.bedrooms && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="text-base font-medium">{selectedProperty.bedrooms}</p>
                      </div>
                    )}
                    {selectedProperty.bathrooms && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="text-base font-medium">{selectedProperty.bathrooms}</p>
                      </div>
                    )}
                    {selectedProperty.kitchens && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Kitchens</p>
                        <p className="text-base font-medium">{selectedProperty.kitchens}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedProperty.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProperty.description}</p>
                </div>
              )}

              {/* Installment Info */}
              {selectedProperty.isInstallment && (
                <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">✓ Installment Available</p>
                  {selectedProperty.installmentYears && (
                    <p className="text-sm text-green-700">Duration: {selectedProperty.installmentYears} years</p>
                  )}
                </div>
              )}

              {/* All Raw Data */}
              <div>
                <details className="cursor-pointer">
                  <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    View All Raw Data
                  </summary>
                  <pre className="mt-3 bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                    {JSON.stringify(selectedProperty, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium">
                  Contact Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
