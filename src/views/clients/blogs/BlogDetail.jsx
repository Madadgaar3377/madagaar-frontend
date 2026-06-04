import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { backendBaseUrl } from "../../../constants/apiUrl";
import LoadingPage from "../../../compontents/Loader";
import SEO from "../../../components/SEO";
import BlogAdSenseInArticle from "../../../components/BlogAdSenseInArticle";

const BRAND = "rgb(183,36,42)";
const BLOG_BASE_URL = "https://madadgaar.com.pk";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");

  const shareUrl = blog ? `${BLOG_BASE_URL}/blog/${blog.slug || slug}` : "";
  const shareTitle = blog ? blog.title : "";
  const shareText = blog ? (blog.excerpt || blog.title) : "";

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

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {});
  };

  const openShare = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

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
            href="/blog"
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
        description={blog.excerpt || blog.metaDescription || (blog.title + (blog.category ? ` · ${blog.category}` : "") + " · Madadgaar Blog")}
        keywords={blog.seoKeywords?.join(", ") || blog.category || "madadgaar blog"}
        canonicalUrl={`https://madadgaar.com.pk/blog/${blog.slug}`}
        ogImage={blog.featuredImage}
        structuredData={structuredData}
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[rgb(183,36,42)] via-rose-500 to-orange-400 text-white">
        <div className="container-content max-w-4xl py-8 lg:py-12 relative z-10">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-white/90 hover:text-white mb-6 transition"
          >
            <svg
              className="size-4 mr-2"
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
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{blog.authorName || "Madadgaar Expert Partner"}</span>
            </div>
            {blog.publishedAt && (
              <div className="flex items-center gap-2">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{blog.readingTime} min read</span>
              </div>
            )}
            {blog.viewCount !== undefined && (
              <div className="flex items-center gap-2">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{blog.viewCount} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Gradient decoration */}
        <div className="absolute -top-10 -right-10 size-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 size-72 bg-black/10 rounded-full blur-3xl" />
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

          <BlogAdSenseInArticle
            key={blog.slug || slug}
            className="my-8 flex justify-center not-prose"
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

          {/* Share this article */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Share this article
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openShare(shareLinks.facebook)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1877f2] text-white text-sm font-medium hover:bg-[#166fe5] transition"
                aria-label="Share on Facebook"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
              <button
                type="button"
                onClick={() => openShare(shareLinks.twitter)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1da1f2] text-white text-sm font-medium hover:bg-[#1a94da] transition"
                aria-label="Share on X (Twitter)"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </button>
              <button
                type="button"
                onClick={() => openShare(shareLinks.whatsapp)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25d366] text-white text-sm font-medium hover:bg-[#20bd5a] transition"
                aria-label="Share on WhatsApp"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => openShare(shareLinks.linkedin)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a66c2] text-white text-sm font-medium hover:bg-[#004182] transition"
                aria-label="Share on LinkedIn"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition ${copySuccess ? "border-green-500 text-green-700 bg-green-50" : ""}`}
                aria-label="Copy link"
              >
                {copySuccess ? (
                  <>
                    <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Link copied!
                  </>
                ) : (
                  <>
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </article>

        {/* Back to blogs button */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium text-white shadow-lg hover:shadow-xl transition"
            style={{ background: BRAND }}
          >
            <svg
              className="size-4 mr-2"
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
