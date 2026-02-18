import { MetadataRoute } from 'next';

// URLs de configuração
const BASE_URL = 'https://cloudgraficarapida.com.br';
// Usamos o nome do container 'backend' pois essa requisição acontece server-side dentro do Docker
const API_URL = "http://backend:8000/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        // 1. Buscamos dados do Backend em paralelo (Rápido)
        // O 'revalidate' garante que o sitemap se atualize a cada hora
        const [productsRes, kitsRes, categoriesRes] = await Promise.all([
            fetch(`${API_URL}/products/`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/kits/`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/categories/`, { next: { revalidate: 3600 } }),
        ]);

        // 2. Tratamento de erro caso a API falhe
        const products = productsRes.ok ? ((await productsRes.json()).results || []) : [];
        const kits = kitsRes.ok ? ((await kitsRes.json()).results || []) : [];
        const categories = categoriesRes.ok ? ((await categoriesRes.json()).results || []) : [];

        // 3. Rotas Estáticas (Páginas fixas do site)
        const routes = [
            '',           // Home
            '/carrinho',  // Carrinho
        ].map((route) => ({
            url: `${BASE_URL}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        }));

        // 4. Rotas Dinâmicas de Produtos
        const productRoutes = products.map((product: any) => ({
            url: `${BASE_URL}/produto/${product.slug}`,
            lastModified: new Date(product.updated_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        // 5. Rotas Dinâmicas de Kits
        const kitRoutes = kits.map((kit: any) => ({
            url: `${BASE_URL}/kit/${kit.slug}`,
            lastModified: new Date(kit.created_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));

        // 6. Rotas de Categorias (Links da Home)
        const categoryRoutes = categories.map((cat: any) => ({
            url: `${BASE_URL}/?category__slug=${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // Retorna tudo junto
        return [...routes, ...categoryRoutes, ...kitRoutes, ...productRoutes];

    } catch (error) {
        console.error("Erro ao gerar Sitemap:", error);
        // Retorna apenas a home se der erro na API para não quebrar o site
        return [
            {
                url: BASE_URL,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
        ];
    }
}