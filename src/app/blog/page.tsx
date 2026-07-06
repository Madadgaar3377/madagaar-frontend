import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import { fetchPublishedBlogs } from "../../lib/api-server";
import BlogsPage from "../../views/clients/blogs/Blogs";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Madadgaar Blog",
  description:
    "News, tips, and insights about property, insurance, loans, and installment plans in Pakistan.",
  path: "/blog",
});

export default async function Page() {
  const initialBlogs = await fetchPublishedBlogs();
  return <BlogsPage initialBlogs={initialBlogs} />;
}
