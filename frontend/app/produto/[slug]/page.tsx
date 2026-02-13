import { Metadata } from 'next';
import { getProductBySlug, getImageUrl, getCompanyConfig } from "@/services/api";
import ProductDetails from "@/components/products/ProductDetails";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/cart/FloatingCart";

// Definição do Tipo para Next.js 15+ (Params é uma Promise agora)
type Props = {
  params: Promise<{ slug: string }>;
};

// 1. GERA O SEO (Título e Descrição)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // AWAIT OBRIGATÓRIO AQUI:
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  
  if (!product) {
    return { title: 'Produto não encontrado | Cloud Design' };
  }

  return {
    title: `${product.name} | Cloud Gráfica Rápida`,
    description: product.description?.substring(0, 160),
    openGraph: {
      images: [getImageUrl(product.image)],
    },
  };
}


export default async function ProductPage({ params }: Props) {

  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Busca dados em paralelo
  const [product, companyConfig] = await Promise.all([
    getProductBySlug(slug),
    getCompanyConfig()
  ]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#05060a] flex flex-col items-center justify-center text-white p-4 text-center">
        <h1 className="text-3xl font-black mb-4">Produto não encontrado 😕</h1>
        <p className="text-gray-400 mb-6">O slug buscado foi: {slug}</p>
        <a href="/" className="bg-brand-blue px-6 py-3 rounded-full font-bold hover:bg-white hover:text-brand-blue transition-colors">
            Voltar ao Catálogo
        </a>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#05060a]">
        <Header />
        
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-16 flex-grow w-full">
            <nav className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">
                <a href="/" className="hover:text-brand-blue transition-colors">Início</a> 
                <span className="mx-2">/</span> 
                <span className="text-white">{product.name}</span>
            </nav>

            <ProductDetails product={product} />
        </section>

        <Footer config={companyConfig} />
        <FloatingCart />
    </main>
  );
}