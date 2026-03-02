// src/pages/BlogsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";
import SEO from "../../../components/SEO";
import AnimatedSection from "../../../components/AnimatedSection";

const PAGE_SIZE = 9;

function stripHtml(html = "") {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } catch {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  }
}

export default function BlogsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Madadgaar Blog",
    "description": "Stay updated with the latest news, tips, and insights about property, insurance, loans, and installment plans in Pakistan",
    "url": "https://madadgaar.com.pk/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Madadgaar Expert Partner",
      "logo": {
        "@type": "ImageObject",
        "url": "https://madadgaar.com.pk/Media/Group%2033.png"
      }
    }
  };
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [blogs, setBlogs] = useState([]);
  const [totalBlog, setTotalBlog] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function fetchBlogs() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/getPublishedBlogs?limit=100&page=1`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const payload = await res.json().catch(() => null);

        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Failed to load (${res.status})`);
        } else {
          const data = payload?.data ?? [];
          if (mounted) {
            setBlogs(Array.isArray(data) ? data : []);
            setTotalBlog(
              Number(
                payload?.pagination?.total ??
                  (Array.isArray(data) ? data.length : 0)
              )
            );
          }
        }
      } catch (err) {
        console.error("Fetch blogs error:", err);
        setError("Network error — could not fetch blogs.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchBlogs();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  const categories = useMemo(() => {
    const s = new Set();
    blogs.forEach((b) => {
      if (b.category) s.add(b.category);
    });
    return Array.from(s).filter(Boolean);
  }, [blogs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      if (
        selectedCategory &&
        (b.category || "").toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      const title = (b.title || "").toLowerCase();
      const content = stripHtml(b.content || b.description || b.descripition || "").toLowerCase();
      const excerpt = stripHtml(b.excerpt || "").toLowerCase();
      return title.includes(q) || content.includes(q) || excerpt.includes(q);
    });
  }, [blogs, search, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageData = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <SEO
        title="Blog - Property, Insurance & Loan Tips | Madadgaar Expert Partner"
        description="Stay updated with the latest news, expert tips, and insights about property solutions, insurance, loans, and installment plans in Pakistan. Read our comprehensive guides and industry updates."
        keywords="madadgaar blog, property tips pakistan, insurance guide, loan advice, real estate news pakistan, financial tips pakistan, installment guide"
        canonicalUrl="https://madadgaar.com.pk/blog"
        structuredData={structuredData}
      />

      {/* Modern Hero Section */}
      <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-500 to-orange-500 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative container-content max-w-7xl py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/30">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold tracking-wide text-white">Latest Insights</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight text-white">
              Discover Expert
              <span className="block text-yellow-200">
                Insights & Guides
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-white/95 mb-8 max-w-2xl mx-auto leading-relaxed">
              Stay ahead with the latest news, tips, and expert insights about property, insurance, loans, and installment plans in Pakistan.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black mb-1 text-white">{totalBlog || blogs.length}</div>
                <div className="text-sm text-white/90">Articles</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black mb-1 text-white">{categories.length}</div>
                <div className="text-sm text-white/90">Categories</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black mb-1 text-white">24/7</div>
                <div className="text-sm text-white/90">Updated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 sm:h-20">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </section>
      </AnimatedSection>

      {/* Modern Search & Filter Section */}
      <AnimatedSection animation="fadeInUp" delay={80} className="w-full">
      <section className="container-content max-w-7xl -mt-8 sm:-mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search articles, topics, or keywords..."
                  className="w-full pl-14 pr-4 py-4 text-base text-gray-900 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 mr-2">Filter by:</span>
            <button
              onClick={() => {
                setSelectedCategory("");
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                !selectedCategory
                  ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Articles
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSelectedCategory(c);
                  setPage(1);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 capitalize ${
                  selectedCategory === c
                    ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
            {(search || selectedCategory) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                  setPage(1);
                }}
                className="ml-auto px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
              >
                ✕ Clear All
              </button>
            )}
          </div>

          {/* Results Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Found <span className="font-bold text-gray-900">{filtered.length}</span> of <span className="font-bold text-gray-900">{totalBlog}</span> articles
            </div>
            {filtered.length > 0 && (
              <div className="text-sm text-gray-700">
                Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
              </div>
            )}
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* Modern Blog Grid */}
      <main className="container-content max-w-7xl py-8 sm:py-12">
        {error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold mb-3 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-3 rounded-xl font-semibold"
            >
              Reload Page
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setPage(1);
              }}
              className="btn-primary px-6 py-3 rounded-xl font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {pageData.map((b, index) => {
                const excerpt = stripHtml(b.excerpt || b.content || "").slice(0, 120);
                return (
                  <AnimatedSection key={b._id} animation="fadeInUp" delay={index * 80} className="w-full">
                  <article
                    className="group bg-white rounded-2xl shadow-soft border border-gray-100 card-hover-lift flex flex-col overflow-hidden"
                  >
                    {/* Image Container */}
                    <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                      {b.featuredImage ? (
                        <img
                          src={b.featuredImage}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                          <svg className="w-16 h-16 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Category Badge on Image */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-white text-red-600 text-xs font-bold rounded-full shadow-md">
                          {b.category || "General"}
                        </span>
                      </div>

                      {/* Reading Time Badge */}
                      {b.readingTime && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1.5 bg-black/60 text-white text-xs font-semibold rounded-full">
                            {b.readingTime} min
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {b.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
                        {excerpt}
                        {excerpt.length >= 120 ? "…" : ""}
                      </p>

                      {/* Footer with Read More */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <Link
                          to={`/blog/${b.slug || b._id}`}
                          className="inline-flex items-center gap-2 text-red-600 font-semibold text-sm hover:text-red-700"
                        >
                          <span>Read Article</span>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                  </AnimatedSection>
                );
              })}
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-bold text-gray-900">{(page - 1) * PAGE_SIZE + 1}</span> - <span className="font-bold text-gray-900">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-gray-900">{filtered.length}</span> articles
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 rounded-xl font-semibold border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    ← Previous
                  </button>
                  <div className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg">
                    {page} / {totalPages}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-5 py-2.5 rounded-xl font-semibold border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
