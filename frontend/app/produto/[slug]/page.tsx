import { Metadata } from 'next';
import { getProductBySlug, getImageUrl } from "@/services/api";
import ProductDetails from "@/components/products/ProductDetails";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/cart/FloatingCart";
import { getCompanyConfig } from "@/services/api";

// 1. GERAÇÃO DE METADADOS (SEO) - O Google lê isso antes de carregar a página
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Produto não encontrado | Cloud Design',
      description: 'Confira nossos produtos de gráfica rápida.'
    };
  }

  const imageUrl = getImageUrl(product.image);

  return {
    title: `${product.name} | Cloud Gráfica Rápida`,
    description: product.description ? product.description.substring(0, 160) : `Compre ${product.name} com a melhor qualidade e prazo.`,
    openGraph: {
      title: product.name,
      description: product.description || `Oferta especial: ${product.name}`,
      images: [imageUrl],
      url: `https://cloudgraficarapida.com.br/produto/${product.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Oferta especial: ${product.name}`,
      images: [imageUrl],
    }
  };
}

// 2. PÁGINA PRINCIPAL
export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Busca os dados em paralelo para ser rápido
  const [product, companyConfig] = await Promise.all([
    getProductBySlug(params.slug),
    getCompanyConfig()
  ]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#05060a] flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-black mb-4">Produto não encontrado 😕</h1>
        <a href="/" className="bg-brand-blue px-6 py-3 rounded-full font-bold">Voltar ao Catálogo</a>
      </div>
    );
  }

  // Schema.org para o Google mostrar preço no resultado da busca (Rich Snippets)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: getImageUrl(product.image),
    description: product.description,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.variants[0]?.price,
      availability: 'https://schema.org/InStock',
      url: `https://cloudgraficarapida.com.br/produto/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Cloud Design Gráfica'
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#05060a]">
        {/* Injeta dados estruturados */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Header />
        
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16 flex-grow w-full">
            {/* Breadcrumb simples */}
            <nav className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">
                <a href="/" className="hover:text-brand-blue transition-colors">Início</a>
                <span className="mx-2">/</span>
                <span className="text-white">{product.name}</span>
            </nav>

            {/* Componente Client com a interatividade */}
            <ProductDetails product={product} />
        </section>

        <Footer config={companyConfig} />
        <FloatingCart />
    </main>
  );
}