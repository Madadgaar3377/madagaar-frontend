import { MetadataRoute } from 'next';
import { backendBaseUrl } from '../constants/apiUrl';

// Helper function to fetch dynamic data (e.g., properties, installments)
async function fetchDynamicRoutes() {
  try {
    const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");

    // Fetch all active properties
    const propertiesRes = await fetch(`${apiUrl}/getAllProperties`);
    const propertiesData = await propertiesRes.json();
    const properties = (propertiesData.success && propertiesData.properties) ? propertiesData.properties : (propertiesData.data || []);
    
    // Fetch active installments
    const installmentsRes = await fetch(`${apiUrl}/getAllInstallments?page=1&limit=500`);
    const installmentsData = await installmentsRes.json();
    const installments = (installmentsData.success && installmentsData.data) ? installmentsData.data : (Array.isArray(installmentsData) ? installmentsData : []);

    return { properties, installments };
  } catch (error) {
    console.error("Error fetching dynamic routes for sitemap", error);
    return { properties: [], installments: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://madadgaar.com.pk';
  const { properties, installments } = await fetchDynamicRoutes();

  // Core static routes
  const staticRoutes = [
    '',
    '/about',
    '/properties',
    '/loans',
    '/installments',
    '/insurance',
    '/offers',
    '/blog',
    '/contact',
    '/faq',
    '/download-app',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Map dynamic property routes
  const propertyRoutes = (properties || []).map((prop: any) => ({
    url: `${baseUrl}/property/${prop.slug || prop._id}`,
    lastModified: new Date(prop.updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Map dynamic installment routes
  const installmentRoutes = (installments || []).map((inst: any) => ({
    url: `${baseUrl}/installment/${inst.slug || inst._id}`,
    lastModified: new Date(inst.updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...propertyRoutes, ...installmentRoutes];
}
