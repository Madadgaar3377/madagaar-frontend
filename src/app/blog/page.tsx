import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import BlogsPage from "../../views/clients/blogs/Blogs";
import { backendBaseUrl } from "../../constants/apiUrl";
import { SITE_URL } from "../../lib/site";
import { isSeedBlogSlug, isSeedBlogContent } from "../../lib/description";

export const metadata: Metadata = buildPageMetadata({
  title: "Madadgaar Blog & Insights",
  description:
    "Stay updated with the latest news, tips, and insights about property, insurance, loans, and installment plans in Pakistan.",
  path: "/blog",
});

export default async function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Madadgaar Blog",
    "description": "Stay updated with the latest news, tips, and insights about property, insurance, loans, and installment plans in Pakistan",
    "url": `${SITE_URL}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "Madadgaar Expert Partner",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/Media/Group 33.png`
      }
    }
  };
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "") || "";
  let blogs = [];
  let totalBlog = 0;
  let fetchError = false;

  try {
    const res = await fetch(`${apiUrl}/getPublishedBlogs?limit=100&page=1`, { next: { revalidate: 300 } });
    const payload = await res.json();
    if (res.ok && payload?.success !== false) {
      const data = payload?.data || [];
      const rawBlogs = Array.isArray(data) ? data : [];
      
      // Filter out seed/placeholder blogs to prevent 404s
      blogs = rawBlogs.filter(b => b.slug && !isSeedBlogSlug(b.slug) && !isSeedBlogContent(b));
      totalBlog = payload?.pagination?.total 
        ? (Number(payload.pagination.total) - (rawBlogs.length - blogs.length)) 
        : blogs.length;
    } else {
      fetchError = true;
    }
  } catch (err) {
    console.error("Fetch blogs error (server):", err);
    fetchError = true;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <BlogsPage initialBlogs={blogs} initialTotalBlog={totalBlog} fetchError={fetchError} />
    </>
  );
}