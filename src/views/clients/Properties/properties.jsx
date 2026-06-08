// src/pages/PropertiesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";
import cities from "../../../constants/cities";
import SEO from "../../../components/SEO";
import OfferBanner from "../../../components/OfferBanner";
import ShareButtons from "../../../components/ShareButtons";
import AdSenseDisplayAuto from "../../../components/AdSenseDisplayAuto";

const PAGE_SIZE = 50;

function PropertiesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Real Estate Services",
    "name": "Madadgaar Property Solutions",
    "description": "Find, compare, and secure your perfect property—stress-free. Compare properties for sale, rent, and investment across Pakistan.",
    "url": "https://madadgaar.com.pk/properties",
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
      "description": "Free property comparison and listing services"
    }
  };
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [typeFilter, setTypeFilter] = useState("All"); // Individual/Project filter
  const [city, setCity] = useState("All");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  // Filter visibility for mobile
  const [showFilters, setShowFilters] = useState(false);

  // Helper function to extract property data based on type
  const extractPropertyData = (property) => {
    if (property.type === "Individual") {
      const individual = property.individualProperty || {};
      return {
        _id: property._id,
        type: "Individual",
        title: individual.title,
        description: individual.description,
        propertyType: individual.propertyType,
        propertyId: individual.propertyId,
        city: individual.city,
        location: individual.location,
        price: individual.transaction?.price || individual.transaction?.monthlyRent,
        transactionType: individual.transaction?.type,
        areaSize: individual.areaSize,
        areaUnit: individual.areaUnit,
        bedrooms: individual.bedrooms,
        bathrooms: individual.bathrooms,
        images: individual.images || [],
        amenities: individual.amenities,
        utilities: individual.utilities,
        contact: individual.contact,
        nearbyLandmarks: individual.nearbyLandmarks,
        furnishingStatus: individual.furnishingStatus,
        possessionStatus: individual.possessionStatus,
      };
    } else if (property.type === "Project") {
      const project = property.project || {};
      return {
        _id: property._id,
        type: "Project",
        title: project.projectName,
        description: project.description,
        propertyType: project.projectType,
        propertyId: project.propertyId,
        city: project.city,
        location: project.area || project.address,
        price: project.transaction?.priceRange || project.transaction?.price,
        transactionType: project.transaction?.type,
        areaSize: project.totalLandArea,
        areaUnit: project.landAreaUnit,
        totalUnits: project.totalUnits,
        images: project.images || [],
        amenities: project.amenities,
        utilities: project.utilities,
        contact: project.contact,
        nearbyLandmarks: project.nearbyLandmarks,
        projectStage: project.projectStage,
        developerBuilder: project.developerBuilder,
        highlights: project.highlights,
      };
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;
    async function fetchProperties() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/getAllProperties`);
        const payload = await res.json().catch(() => null);

        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Failed to load (${res.status})`);
        } else {
          if (mounted) {
            const rawProperties = payload?.properties || [];
            const extractedProperties = rawProperties
              .map(extractPropertyData)
              .filter(Boolean);
            setProperties(extractedProperties);
          }
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
  }, [apiUrl]);

  // Apply client-side filtering
  const filteredProperties = useMemo(() => {
    const filtered = properties.filter((p) => {
      // Type filter (Individual/Project)
      if (typeFilter !== "All" && p.type !== typeFilter) return false;
      
      // City filter
      if (city !== "All" && p.city !== city) return false;
      
      // Location filter
      if (location && !p.location?.toLowerCase().includes(location.toLowerCase())) return false;
      
      // Property type filter (Villa, Apartment, etc.)
      if (propertyType !== "All") {
        if (!p.propertyType?.toLowerCase().includes(propertyType.toLowerCase())) return false;
      }
      
      // Budget filter
      let propertyPrice = 0;
      if (typeof p.price === "string") {
        // Extract first number from string like "PKR 2.89 Crore to 2.91 Crore"
        const match = p.price.match(/[\d.]+/);
        if (match) {
          propertyPrice = parseFloat(match[0]);
          // If price contains "Crore", multiply by 10000000
          if (p.price.toLowerCase().includes("crore")) {
            propertyPrice *= 10000000;
          } else if (p.price.toLowerCase().includes("lakh") || p.price.toLowerCase().includes("lac")) {
            propertyPrice *= 100000;
          }
        }
      } else if (typeof p.price === "number") {
        propertyPrice = p.price;
      }
      
      if (budgetMin && propertyPrice > 0 && propertyPrice < parseFloat(budgetMin)) return false;
      if (budgetMax && propertyPrice > 0 && propertyPrice > parseFloat(budgetMax)) return false;
      
      return true;
    });
    
    return filtered;
  }, [properties, typeFilter, city, location, propertyType, budgetMin, budgetMax]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProperties.slice(start, start + PAGE_SIZE);
  }, [filteredProperties, page]);

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04, duration: 0.35 },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Madadgaar Properties | Buy, Rent & Invest Easily"
        description="Find, compare, and secure your perfect property—stress-free. Madadgaar helps you compare properties for sale, rent, and investment across Pakistan to find what truly fits your needs."
        keywords="property pakistan, real estate pakistan, buy property pakistan, sell property pakistan, rent property pakistan, property lahore, property karachi, property islamabad, residential property, commercial property, houses for sale, apartments for rent, property investment pakistan"
        canonicalUrl="https://madadgaar.com.pk/properties"
        structuredData={structuredData}
      />
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-primary-700 via-primary to-primary-600 text-white section-padding-sm"
      >
        <div className="container-content max-w-6xl">
          <h1 className="text-responsive-xl font-extrabold mb-1 sm:mb-2">
            Madadgaar Properties | Buy, Rent & Invest Easily
          </h1>
          <p className="text-responsive-sm text-white/90">
            Browse properties filtered by city, location, type, or budget. <a href="/faq#property" className="underline hover:text-white/80 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white">Learn more about property services</a> or <a href="/loans" className="underline hover:text-white/80 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white">explore financing options</a>.
          </p>
        </div>
      </motion.header>

      <OfferBanner />

      {/* Filters */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="container-content max-w-6xl py-4 sm:py-6"
      >
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft border border-gray-100 p-3 sm:p-4 lg:p-6">
          {/* Filter Header with Toggle Button */}
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
              <svg className="size-5 sm:w-6 sm:h-6 shrink-0 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Properties
            </h2>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-primary flex items-center gap-2 text-sm font-semibold shrink-0"
            >
              <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? "Hide" : "Filters"}
            </button>
          </div>

          {/* Filter Content */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-3 sm:space-y-4`}>
          
          {/* Search Location */}
          <div>
        <input
          type="text"
              placeholder="Search location (e.g., DHA, Gulberg)"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-sm rounded-lg sm:rounded-xl border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {/* Type Filter (Individual/Project) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Property Category</label>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="px-2 sm:px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow min-h-touch"
              >
                <option value="All">All</option>
                <option value="Individual">Individual</option>
                <option value="Project">Project</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City</label>
        <select
          value={city}
          onChange={(e) => { setCity(e.target.value); setPage(1); }}
                className="px-2 sm:px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow min-h-touch"
        >
                <option value="All">All Cities</option>
                {cities.map((cityItem) => (
                  <option key={cityItem.value} value={cityItem.value}>
                    {cityItem.title}
                  </option>
                ))}
        </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Property Type</label>
        <select
          value={propertyType}
          onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
                className="px-2 sm:px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow min-h-touch"
        >
                <option value="All">All Types</option>
                <option value="Apartment">Apartment / Flat</option>
                <option value="Villa">Villa / House</option>
                <option value="Plot">Plot / Land</option>
                <option value="Retail">Retail / Shop</option>
                <option value="Commercial">Commercial</option>
                <option value="Penthouse">Penthouse</option>
        </select>
            </div>

            {/* Min Budget */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Min Budget (PKR)</label>
          <input
            type="number"
                placeholder="e.g., 5000000"
            value={budgetMin}
            onChange={(e) => { setBudgetMin(e.target.value); setPage(1); }}
                className="px-2 sm:px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow min-h-touch"
          />
            </div>

            {/* Max Budget */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Budget (PKR)</label>
          <input
            type="number"
                placeholder="e.g., 50000000"
            value={budgetMax}
            onChange={(e) => { setBudgetMax(e.target.value); setPage(1); }}
                className="px-2 sm:px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow min-h-touch"
              />
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button type="button"
                onClick={() => {
                  setTypeFilter("All");
                  setCity("All");
                  setLocation("");
                  setPropertyType("All");
                  setBudgetMin("");
                  setBudgetMax("");
                  setPage(1);
                }}
                className="w-full min-h-touch px-3 py-2.5 text-xs sm:text-sm font-medium text-primary bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
          </div>

          {/* Results Count — 50 per page */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing <span className="font-semibold text-primary">{filteredProperties.length}</span> properties
              {filteredProperties.length !== properties.length && (
                <span> out of <span className="font-semibold">{properties.length}</span> total</span>
              )}
              <span className="text-gray-500"> • {PAGE_SIZE} per page</span>
            </p>
          </div>
        </div>
      </motion.section>

      <div className="container-content max-w-6xl">
        <AdSenseDisplayAuto className="my-4 sm:my-6 flex justify-center min-h-[90px]" />
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-6">
        {loading ? (
          <p className="text-center text-sm sm:text-base text-gray-500 py-12 sm:py-20">Loading properties…</p>
        ) : error ? (
          <p className="text-center text-sm sm:text-base text-red-600 py-12 sm:py-20">{error}</p>
        ) : filteredProperties.length === 0 ? (
          <p className="text-center text-sm sm:text-base text-gray-500 py-12 sm:py-20">
            No properties found matching your filters.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {pageData.map((p, index) => (
                <motion.div
                  key={p._id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-xl sm:rounded-2xl shadow-soft border border-gray-100 card-hover-lift flex flex-col overflow-hidden relative"
                >
                  {/* Property Type Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium ${
                      p.type === "Project" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {p.type}
                    </span>
                  </div>

                  {/* Image */}
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={`${p.title} - ${p.propertyType || "Property"} for ${p.transactionType || "sale"} in ${p.city || "Pakistan"}`}
                      className="h-32 sm:h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-32 sm:h-40 w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
                    </div>
                  )}

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="text-base sm:text-lg font-semibold mb-1 line-clamp-2">{p.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                      {p.city}{p.location ? `, ${p.location}` : ""}
                    </p>
                    
                    {/* Property Type */}
                    {p.propertyType && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        {p.propertyType}
                    </p>
                    )}

                    {/* Price */}
                    {p.price && (
                      <p className="text-xs sm:text-sm font-medium text-primary mb-2">
                        {p.transactionType === "Rent" ? "Rent: " : "Price: "}
                        {typeof p.price === "number" 
                          ? `PKR ${p.price.toLocaleString()}` 
                          : p.price}
                      </p>
                    )}

                    {/* Area */}
                    {p.areaSize && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">
                        Area: {p.areaSize} {p.areaUnit || "sq. ft"}
                      </p>
                    )}

                    {/* Bedrooms for Individual */}
                    {p.type === "Individual" && p.bedrooms && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">
                        🛏️ {p.bedrooms} Bed • 🚿 {p.bathrooms} Bath
                      </p>
                    )}

                    {/* Total Units for Project */}
                    {p.type === "Project" && p.totalUnits && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">
                        Total Units: {p.totalUnits}
                      </p>
                    )}

                    {/* Transaction Type Badge */}
                    {p.transactionType && (
                      <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full w-max mb-2 ${
                        p.transactionType === "Installment" 
                          ? "bg-green-100 text-green-800" 
                          : p.transactionType === "Rent"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {p.transactionType}
                      </span>
                    )}

                    <div className="mt-auto pt-2 sm:pt-3 flex items-center gap-2">
                      <Link
                        href={`/property/${p._id}`}
                        className="flex-1 min-w-0 text-xs sm:text-sm font-medium btn-primary px-3 py-2 rounded-lg text-center block"
                      >
                        View
                      </Link>
                      <ShareButtons
                        compact
                        url={p._id ? `https://madadgaar.com.pk/property/${p._id}` : ""}
                        title={p.title || "Property"}
                        details={[
                          [p.city, p.location].filter(Boolean).join(", "),
                          p.propertyType || null,
                          p.price ? `${p.transactionType === "Rent" ? "Rent" : "Price"}: ${typeof p.price === "number" ? `PKR ${p.price.toLocaleString()}` : p.price}` : null,
                          p.areaSize ? `Area: ${p.areaSize} ${p.areaUnit || "sq. ft"}` : null,
                          (p.bedrooms || p.bathrooms) ? `🛏️ ${p.bedrooms || "—"} Bed • 🚿 ${p.bathrooms || "—"} Bath` : null,
                        ].filter(Boolean).join("\n")}
                        label="Share this property"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination — 50 cards per page */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm text-gray-500 order-first sm:order-none w-full sm:w-auto text-center sm:text-left">
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredProperties.length)} of {filteredProperties.length} (50 per page)
              </p>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-full sm:w-auto min-h-touch px-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-full disabled:opacity-40 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-full sm:w-auto min-h-touch px-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-full disabled:opacity-40 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

export default PropertiesPage;
