import { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { isSeedBlogSlug } from "../lib/description";
import {
  fetchProperties,
  fetchLoans,
  fetchAllInstallments,
  fetchPublishedBlogs,
} from "../lib/api-server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, loans, installments, blogs] = await Promise.all([
    fetchProperties(),
    fetchLoans(),
    fetchAllInstallments(),
    fetchPublishedBlogs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/properties",
    "/loans",
    "/installments",
    "/insurance",
    "/offers",
    "/blog",
    "/contact",
    "/faq",
    "/download-app",
    "/submit-claim",
    "/terms-and-conditions",
    "/privacy-policy",
  ].map((route) => ({
    url: `${SITE_URL}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const propertyRoutes: MetadataRoute.Sitemap = (properties as { _id?: string; updatedAt?: string }[]).map(
    (prop) => ({
      url: `${SITE_URL}/property/${prop._id}`,
      lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const loanRoutes: MetadataRoute.Sitemap = (loans as { _id?: string; updatedAt?: string }[]).map(
    (loan) => ({
      url: `${SITE_URL}/loans/${loan._id}`,
      lastModified: loan.updatedAt ? new Date(loan.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const installmentRoutes: MetadataRoute.Sitemap = (
    installments as { _id?: string; installmentPlanId?: string; updatedAt?: string }[]
  ).map((inst) => ({
    url: `${SITE_URL}/installment/${inst._id || inst.installmentPlanId}`,
    lastModified: inst.updatedAt ? new Date(inst.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs
    .filter((b) => b.slug && !isSeedBlogSlug(b.slug))
    .map((blog) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(blog.slug!)}`,
      lastModified: blog.updatedAt
        ? new Date(blog.updatedAt)
        : blog.createdAt
          ? new Date(blog.createdAt)
          : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [
    ...staticRoutes,
    ...propertyRoutes,
    ...loanRoutes,
    ...installmentRoutes,
    ...blogRoutes,
  ];
}
