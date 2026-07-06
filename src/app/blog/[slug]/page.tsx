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

export default function Page() {
  return <BlogDetail />;
}
