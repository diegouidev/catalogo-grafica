import { MetadataRoute } from 'next';

const BASE_URL = 'https://cloudgraficarapida.com.br';

// Mudamos para a URL PÚBLICA (que com certeza funciona, independente se tá rodando no host ou no docker)
const API_URL = "http://backend:8000/api"; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rotas estáticas que sempre devem existir
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/carrinho`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    }
  ];

  try {
    // Busca dados da API pública
    const [productsRes, kitsRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/products/`, { next: { revalidate: 3600 } }).catch(() => null),
      fetch(`${API_URL}/kits/`, { next: { revalidate: 3600 } }).catch(() => null),
      fetch(`${API_URL}/categories/`, { next: { revalidate: 3600 } }).catch(() => null),
    ]);

    const products = productsRes?.ok ? ((await productsRes.json()).results || []) : [];
    const kits = kitsRes?.ok ? ((await kitsRes.json()).results || []) : [];
    const categories = categoriesRes?.ok ? ((await categoriesRes.json()).results || []) : [];

    const productRoutes = products.map((product: any) => ({
      url: `${BASE_URL}/produto/${product.slug}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const kitRoutes = kits.map((kit: any) => ({
      url: `${BASE_URL}/kit/${kit.slug}`,
      lastModified: new Date(kit.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    const categoryRoutes = categories.map((cat: any) => ({
      url: `${BASE_URL}/?category__slug=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...kitRoutes, ...productRoutes];

  } catch (error) {
    console.error("Sitemap: Fallback para rotas estáticas devido a erro:", error);
    // Se tudo der errado, envia pelo menos as páginas estáticas para o Google ficar feliz
    return staticRoutes; 
  }
}
