import type { Metadata } from "next";
import { buildPageMetadata } from "../../../lib/metadata";
import {
  fetchBlogBySlug,
  fetchPublishedBlogs,
} from "../../../lib/api-server";
import {
  isSeedBlogContent,
  isSeedBlogSlug,
  stripHtml,
} from "../../../lib/description";
import BlogDetail from "../../../views/clients/blogs/BlogDetail";
import { notFound } from "next/navigation";
import { SITE_URL } from "../../../lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const blogs = await fetchPublishedBlogs();
  return blogs
    .filter((b) => b.slug && !isSeedBlogSlug(b.slug))
    .map((b) => ({ slug: b.slug! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  if (isSeedBlogSlug(decodedSlug)) {
    return buildPageMetadata({
      title: "Blog Not Found",
      description: "This blog post is not available.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const blog = await fetchBlogBySlug(decodedSlug);
  if (!blog || isSeedBlogContent(blog)) {
    return buildPageMetadata({
      title: "Blog Not Found",
      description: "This blog post could not be found on Madadgaar.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const title = String(blog.title || "Blog Post");
  const description = stripHtml(
    String(blog.excerpt || blog.metaDescription || title),
    155
  );
  const blogSlug = String(blog.slug || decodedSlug);

  return buildPageMetadata({
    title: `${title} | Madadgaar Blog`,
    description,
    path: `/blog/${encodeURIComponent(blogSlug)}`,
    ogImage: blog.featuredImage as string | undefined,
    ogType: "article",
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  if (isSeedBlogSlug(decodedSlug)) {
    notFound();
  }

  const blog = await fetchBlogBySlug(decodedSlug);
  if (!blog || isSeedBlogContent(blog)) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.excerpt || blog.metaDescription,
        "image": blog.featuredImage || `${SITE_URL}/Media/Group%2033.png`,
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
            "url": `${SITE_URL}/Media/Group%2033.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${SITE_URL}/blog/${encodeURIComponent(String(blog.slug || decodedSlug))}`
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
          { "@type": "ListItem", "position": 3, "name": blog.title }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <BlogDetail initialBlog={blog} />
    </>
  );
}
