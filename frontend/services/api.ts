const API_URL_ENV = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

// ... (Mantenha as funções getBanners, getProducts, etc como estavam)
export const getBanners = async () => {
    const res = await fetch(`${API_URL_ENV}/banners/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
};

export const getProducts = async (categorySlug?: string, searchTerm?: string) => {
    // Monta a Query String dinamicamente
    const params = new URLSearchParams();
    
    if (categorySlug && categorySlug !== 'todos') {
        params.append('category__slug', categorySlug);
    }
    
    if (searchTerm) {
        params.append('search', searchTerm);
    }

    const queryString = params.toString();
    const url = `${API_URL}/products/?${queryString}`;

    const res = await fetch(url, { next: { revalidate: 0 } }); // 0 para busca em tempo real
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    return res.json();
};

export const getCategories = async () => {
    const res = await fetch(`${API_URL_ENV}/categories/`);
    if (!res.ok) return [];
    return res.json();
};

export const getCompanyConfig = async () => {
    try {
        const res = await fetch(`${API_URL_ENV}/company-config/`, { next: { revalidate: 600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data[0];
    } catch { return null; }
};