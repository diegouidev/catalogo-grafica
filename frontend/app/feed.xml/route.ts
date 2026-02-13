import { NextResponse } from 'next/server';

// Força o Next.js a nunca fazer cache dessa página
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const API_URL = "http://backend:8000/api";

        // Faz a requisição direto no container do backend
        const res = await fetch(`${API_URL}/products/`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error(`Falha ao buscar produtos: ${res.status}`);
        }

        const data = await res.json();
        const products = data.results || data;

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
    <channel>
        <title>Cloud Design Gráfica</title>
        <link>https://cloudgraficarapida.com.br</link>
        <description>Catálogo Oficial de Produtos - Cloud Design Gráfica Rápida</description>
`;

        products.forEach((product: any) => {
            // CORREÇÃO: Removemos o is_active daqui, pois o backend já filtra!
            if (!product.slug) return;

            const price = product.variants && product.variants.length > 0
                ? Number(product.variants[0].price).toFixed(2)
                : "0.00";

            let imageUrl = product.image || "";
            if (!imageUrl.startsWith('http')) {
                const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
                imageUrl = `https://cloudgraficarapida.com.br/${cleanPath.startsWith('media/') ? cleanPath : 'media/' + cleanPath}`;
            }

            xml += `
        <item>
            <g:id>${product.id}</g:id>
            <g:title><![CDATA[${product.name}]]></g:title>
            <g:description><![CDATA[${product.description || product.name}]]></g:description>
            <g:link>https://cloudgraficarapida.com.br/produto/${product.slug}</g:link>
            <g:image_link>${imageUrl}</g:image_link>
            <g:availability>in_stock</g:availability>
            <g:price>${price} BRL</g:price>
            <g:condition>new</g:condition>
            <g:brand>Cloud Design</g:brand>
        </item>`;
        });

        xml += `
    </channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'no-store, max-age=0',
            },
        });

    } catch (error) {
        console.error("Erro ao gerar XML Feed:", error);
        return new NextResponse("Erro ao gerar feed", { status: 500 });
    }
}