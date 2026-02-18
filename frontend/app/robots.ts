import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    // Ajuste a URL abaixo para o seu domínio real em produção
    const BASE_URL = 'https://cloudgraficarapida.com.br';

    return {
        rules: {
            userAgent: '*', // Regra para todos os robôs (Google, Bing, Yahoo)
            allow: '/',     // Permite ler o site todo
            disallow: [     // Bloqueia áreas administrativas/privadas
                '/painel/',
                '/admin/',
                '/api/',
                '/private/',
                '/checkout/', // Evita indexar o checkout para não gerar sessões fantasmas
            ],
        },
        sitemap: `${BASE_URL}/sitemap.xml`, // Aponta para o mapa
    };
}