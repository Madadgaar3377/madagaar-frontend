// src/pages/BlogsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { backendBaseUrl } from "../../../constants/apiUrl";

const PAGE_SIZE = 6;
const BRAND = "rgb(183,36,42)";

function stripHtml(html = "") {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } catch {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  }
}

export default function BlogsPage() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  const [blogs, setBlogs] = useState([]);
  const [totalBlog, setTotalBlog] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);

  const [openBlog, setOpenBlog] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchBlogs() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/blog/public`, {
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
                payload?.totalBlog ??
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
      const txt = stripHtml(b.descripition || "").toLowerCase();
      return title.includes(q) || txt.includes(q);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      {/* Hero / heading section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[rgb(183,36,42)] via-rose-500 to-orange-400 text-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 lg:py-14 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="inline-flex items-center text-xs uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full mb-3 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-lime-300 mr-2" />
                Madadgaar Insights
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                Insights, Guides & Updates
              </h1>
              <p className="mt-3 max-w-2xl text-sm lg:text-base text-white/90">
                Learn about property, insurance, loans and installment plans —
                curated by Madadgaar Expert Partner to help you make smarter
                financial decisions.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur border border-white/20 w-full lg:w-80">
              <p className="text-xs uppercase tracking-wide text-white/70 mb-2">
                Blog overview
              </p>
              <p className="text-3xl font-bold">
                {totalBlog || blogs.length}
                <span className="text-sm font-medium ml-1">articles</span>
              </p>
              <p className="mt-1 text-xs text-white/80">
                Use filters below to quickly find relevant content.
              </p>
            </div>
          </div>

          {/* search + filters */}
          <div className="mt-8 bg-white/10 rounded-2xl p-3 lg:p-4 backdrop-blur border border-white/20">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-start lg:items-center justify-between">
              <div className="w-full lg:w-1/2 flex items-center gap-2 bg-white/90 rounded-xl px-3 py-2 shadow-sm">
                <svg
                  className="w-4 h-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="7" strokeWidth="2" />
                  <line
                    x1="16"
                    y1="16"
                    x2="21"
                    y2="21"
                    strokeWidth="2"
                  />
                </svg>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search articles by title or content…"
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>

              <div className="w-full lg:w-1/2 flex flex-wrap gap-2 justify-start lg:justify-end">
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${
                    !selectedCategory
                      ? "bg-white text-[rgb(183,36,42)] border-white shadow-sm"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCategory(c);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs border capitalize transition ${
                      selectedCategory === c
                        ? "bg-white text-[rgb(183,36,42)] border-white shadow-sm"
                        : "bg-white/10 text-white border-white/30 hover:bg-white/20"
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
                    className="px-3 py-1.5 rounded-full text-xs bg-transparent text-white/80 border border-white/30 hover:bg-white/10"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* gradient decoration */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full blur-3xl" />
      </section>

      {/* content area */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 rounded-full border-2 border-gray-300 border-t-[rgb(183,36,42)] animate-spin mb-3" />
            <p className="text-sm">Loading articles…</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >
              Reload
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            No blog posts match your filters.
          </div>
        ) : (
          <>
            {/* cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageData.map((b) => {
                const excerpt = stripHtml(b.descripition || "").slice(
                  0,
                  200
                );
                return (
                  <article
                    key={b._id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden"
                  >
                    {/* top accent bar */}
                    <div
                      className="h-1 w-full"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(183,36,42,0.95), rgba(244,114,182,0.85))",
                      }}
                    />

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="inline-flex items-center text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-50 text-[rgb(183,36,42)] border border-rose-100">
                          {b.category || "General"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {b.blogId || "Blog"}
                        </span>
                      </div>

                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[rgb(183,36,42)]">
                        {b.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-4">
                        {excerpt}
                        {excerpt.length >= 200 ? "…" : ""}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        <button
                          onClick={() => setOpenBlog(b)}
                          className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-800 border border-gray-200 group-hover:bg-[rgb(183,36,42)] group-hover:text-white group-hover:border-[rgb(183,36,42)] transition"
                        >
                          Read more
                          <svg
                            className="w-3 h-3 ml-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M9 5l7 7-7 7"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <span className="text-[11px] text-gray-400 text-right">
                          {/* placeholder for createdAt or author if you expose it later */}
                          Madadgaar
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* pagination */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold">
                  {(page - 1) * PAGE_SIZE + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold">
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{filtered.length}</span>{" "}
                articles
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-full text-xs border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="px-4 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                  Page {page} / {totalPages}
                </div>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-full text-xs border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Blog Modal */}
      {openBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpenBlog(null)}
          />

          <div className="relative z-10 max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* header gradient bar */}
            <div
              className="h-1 w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(183,36,42,0.96), rgba(248,113,113,0.9))",
              }}
            />

            <div className="p-6 md:p-7 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mb-1">
                    Madadgaar Blog
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {openBlog.title}
                  </h2>
                  {openBlog.category && (
                    <span className="inline-flex mt-2 text-[11px] px-2 py-1 rounded-full bg-rose-50 text-[rgb(183,36,42)] border border-rose-100">
                      {openBlog.category}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setOpenBlog(null)}
                  className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="prose prose-sm max-w-none text-gray-800">
                {/* Make sure backend sanitizes this HTML */}
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      openBlog.descripition || "<p>No content</p>",
                  }}
                />
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-400">
                  Powered by Madadgaar Expert Partner
                </p>
                <button
                  onClick={() => setOpenBlog(null)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-white shadow-sm"
                  style={{ background: BRAND }}
                >
                  Close article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
