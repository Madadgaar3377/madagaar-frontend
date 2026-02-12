import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";
import SEO from "../../../components/SEO";

const BRAND = "rgb(183,36,42)";

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");

  useEffect(() => {
    let mounted = true;

    async function fetchBlog() {
      setLoading(true);
      setError("");
      try {
        // Increment view count
        try {
          await fetch(`${apiUrl}/incrementBlogView/${slug}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.warn("Failed to increment view count:", err);
        }

        // Fetch blog details
        const res = await fetch(`${apiUrl}/getBlogBySlug/${slug}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const payload = await res.json().catch(() => null);

        if (!res.ok || (payload && payload.success === false)) {
          setError(payload?.message || `Blog not found (${res.status})`);
        } else {
          if (mounted) {
            setBlog(payload?.data || payload);
          }
        }
      } catch (err) {
        console.error("Fetch blog error:", err);
        setError("Network error — could not fetch blog.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) {
      fetchBlog();
    }

    return () => {
      mounted = false;
    };
  }, [slug, apiUrl]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The blog post you're looking for doesn't exist."}</p>
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium text-white shadow-lg hover:shadow-xl transition"
            style={{ background: BRAND }}
          >
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt || blog.metaDescription,
    "image": blog.featuredImage || "https://madadgaar.com.pk/Media/Group%2033.png",
    "datePublished": blog.publishedAt || blog.createdAt,
    "dateModified": blog.updatedAt,
    "author": {
      "@type": "Person",
      "name": blog.authorName || "Madadgaar Expert Partner"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Madadgaar Expert Partner",
      "logo": {
        "@type": "ImageObject",
        "url": "https://madadgaar.com.pk/Media/Group%2033.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://madadgaar.com.pk/blog/${blog.slug}`
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-100 min-h-screen">
      <SEO
        title={`${blog.title} | Madadgaar Blog`}
        description={blog.excerpt || blog.metaDescription || blog.title}
        keywords={blog.seoKeywords?.join(", ") || blog.category || "madadgaar blog"}
        canonicalUrl={`https://madadgaar.com.pk/blog/${blog.slug}`}
        structuredData={structuredData}
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[rgb(183,36,42)] via-rose-500 to-orange-400 text-white">
        <div className="container-content max-w-4xl py-8 lg:py-12 relative z-10">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm text-white/90 hover:text-white mb-6 transition"
          >
            <svg
              className="w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Blogs
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
              {blog.category || "General"}
            </span>
            {blog.isFeatured && (
              <span className="inline-flex items-center text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-yellow-400/20 backdrop-blur border border-yellow-300/30">
                ⭐ Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-base lg:text-lg text-white/90 max-w-3xl">
              {blog.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{blog.authorName || "Madadgaar Expert Partner"}</span>
            </div>
            {blog.publishedAt && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(blog.publishedAt).toLocaleDateString("en-US", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}</span>
              </div>
            )}
            {blog.readingTime && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{blog.readingTime} min read</span>
              </div>
            )}
            {blog.viewCount !== undefined && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{blog.viewCount} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Gradient decoration */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full blur-3xl" />
      </section>

      {/* Content */}
      <main className="container-content max-w-4xl py-10">
        {blog.featuredImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
            style={{
              lineHeight: "1.8",
              color: "#374151",
            }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-[rgb(183,36,42)] border border-rose-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Images */}
          {blog.images && blog.images.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {blog.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${blog.title} - Image ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-xl shadow-sm hover:shadow-md transition"
                  />
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Back to blogs button */}
        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium text-white shadow-lg hover:shadow-xl transition"
            style={{ background: BRAND }}
          >
            <svg
              className="w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to All Blogs
          </Link>
        </div>
      </main>
    </div>
  );
}
