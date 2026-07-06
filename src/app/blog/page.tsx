import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import BlogsPage from "../../views/clients/blogs/Blogs";

export const metadata: Metadata = buildPageMetadata({
  title: "Madadgaar Blog",
  description:
    "News, tips, and insights about property, insurance, loans, and installment plans in Pakistan.",
  path: "/blog",
});

export default function Page() {
  return <BlogsPage />;
}
