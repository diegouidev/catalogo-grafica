const API_URL_ENV = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const isServer = typeof window === 'undefined';
const API_URL = isServer
    ? "http://backend:8000/api"  // URL interna do Docker (super rápida e garantida)
    : process.env.NEXT_PUBLIC_API_URL;

// Remove o /api do final para pegar a raiz do site
// Ex: https://seu-site.com.br/api -> https://seu-site.com.br
export const API_BASE_URL = API_URL_ENV.replace('/api', '');



// --- NOVA FUNÇÃO ROBUSTA DE IMAGEM ---
export const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/logo-oficial.png"; // Fallback local seguro

    // Se já for uma URL completa (ex: bucket S3 ou link externo), retorna ela
    if (path.startsWith("http")) return path;

    // Remove barra inicial se tiver para evitar duplicidade //
    let cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // A CORREÇÃO DE OURO:
    // Se o caminho vindo do banco for "products/foto.jpg", adicionamos "media/"
    // O Nginx precisa desse prefixo para saber que é um arquivo de upload
    if (!cleanPath.startsWith('media/')) {
        cleanPath = `media/${cleanPath}`;
    }

    // Retorna: https://seu-site.com.br/media/products/foto.jpg
    return `${API_BASE_URL}/${cleanPath}`;
};

export const getBanners = async () => {
    const res = await fetch(`${API_URL_ENV}/banners/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    
    const data = await res.json();
    // Se vier paginado (com results), pega os results. Se não, pega o data normal.
    return data.results || data; 
};

export const getProducts = async (categorySlug?: string, searchTerm?: string, page: number = 1) => {
    const params = new URLSearchParams();

    if (categorySlug && categorySlug !== 'todos') {
        params.append('category__slug', categorySlug);
    }

    if (searchTerm) {
        params.append('search', searchTerm);
    }

    // 👇 O SEGREDO ESTÁ AQUI: Enviamos a página para o Django
    params.append('page', page.toString());

    const queryString = params.toString();
    const url = `${API_URL_ENV}/products/?${queryString}`;

    try {
        const res = await fetch(url, {
            next: { revalidate: 0 },
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) throw new Error('Falha ao carregar produtos');

        const data = await res.json();

        // 👇 MUDANÇA DE OURO 2: 
        // Retornamos o objeto COMPLETO (com o link de "next") e não apenas a array.
        // O page.tsx que criamos no passo anterior já sabe lidar com isso!
        return data; 

    } catch (error) {
        console.error("Erro no getProducts:", error);
        // Retorna um objeto seguro para não quebrar a tela de paginação
        return { results: [], next: null }; 
    }
};

export const getCategories = async () => {
    const res = await fetch(`${API_URL_ENV}/categories/`);
    if (!res.ok) return [];
    
    const data = await res.json();
    // Mesmo esquema de proteção
    return data.results || data;
};

export const getCompanyConfig = async () => {
    try {
        const res = await fetch(`${API_URL_ENV}/company-config/`, { next: { revalidate: 600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data[0];
    } catch { return null; }
};

export const getKits = async () => {
    try {
        const res = await fetch(`${API_URL_ENV}/kits/?is_active=true`, { next: { revalidate: 0 }, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || data;
    } catch { return []; }
};

export const getKitBySlug = async (slug: string) => {
    try {
        const res = await fetch(`${API_URL}/kits/?slug=${slug}`, { next: { revalidate: 0 }, cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.results && data.results.length > 0) return data.results[0];
        if (Array.isArray(data) && data.length > 0) return data[0];
        return null;
    } catch { return null; }
};

export const registerView = async (productId: number) => {
    try {
        await fetch(`${API_URL_ENV}/products/${productId}/increment_view/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            keepalive: true // Garante que o request termine mesmo se mudar de página
        });
    } catch (error) {
        console.error("Erro ao registrar view", error);
    }
};

export const getProductBySlug = async (slug: string) => {
    try {
        console.log(`[API] Buscando slug: ${slug} em ${API_URL}`); // Log para debug

        const res = await fetch(`${API_URL}/products/?slug=${slug}`, {
            next: { revalidate: 0 }, // Sem cache para testar agora
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[API] Erro HTTP: ${res.status}`);
            return null;
        }

        const data = await res.json();

        // Verifica o que chegou no terminal
        console.log(`[API] Resposta para ${slug}:`, JSON.stringify(data).substring(0, 100) + "...");

        // Lógica para pegar o primeiro item da lista
        if (data.results && data.results.length > 0) return data.results[0];
        if (Array.isArray(data) && data.length > 0) return data[0];

        return null;
    } catch (error) {
        console.error("[API] Erro de conexão:", error);
        return null;
    }
};

export const getExitPopupConfig = async () => {
    try {
        const res = await fetch(`${API_URL_ENV}/popup-config/`, { next: { revalidate: 0 }, cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        // A API pode retornar lista ou objeto, garantimos pegar o primeiro item
        if (Array.isArray(data) && data.length > 0) return data[0];
        if (Array.isArray(data) && data.length === 0) return null;
        return data; // Se for objeto direto
    } catch { return null; }
};