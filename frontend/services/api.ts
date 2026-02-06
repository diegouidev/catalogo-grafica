const API_URL_ENV = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Remove o /api do final se existir, para termos apenas o host para as imagens
// Ex: http://localhost:8000/api -> http://localhost:8000
export const API_BASE_URL = API_URL_ENV.replace('/api', '');

// Mantém a URL completa para as chamadas de dados
const API_URL = API_URL_ENV;

// Busca a lista de banners ativos para o carrossel
export const getBanners = async () => {
    const res = await fetch(`${API_URL}/banners/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
};

// Busca as configurações da empresa
export const getCompanyConfig = async () => {
    const res = await fetch(`${API_URL}/company-config/`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data[0];
};

export const getProducts = async (params?: string) => {
    const query = params ? `?${params}` : '';
    const res = await fetch(`${API_URL}/products/${query}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    return res.json();
};

export const getCategories = async () => {
    const res = await fetch(`${API_URL}/categories/`);
    if (!res.ok) return [];
    return res.json();
};

export const formatWhatsAppLink = (message: string, phone: string = "5585998532868") => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
};