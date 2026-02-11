"use client";
import { useState, useEffect, Suspense } from "react"; // <--- 1. Import Suspense
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, getBanners, getCategories, getCompanyConfig } from "@/services/api";
import Header from "@/components/layout/Header";
import Banner from "@/components/layout/Banner";
import CategoryBar from "@/components/products/CategoryBar";
import ProductCard from "@/components/products/ProductCard";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/cart/FloatingCart";
import SearchBar from "@/components/layout/SearchBar";

// 2. Componente de Loading (Fallback)
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b14] text-white font-black animate-pulse">
      CARREGANDO CLOUD DESIGN...
    </div>
  );
}

// 3. Renomeamos a função principal antiga para "HomeContent"
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategorySlug = searchParams.get('category__slug') || 'todos';
  const currentSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [companyConfig, setCompanyConfig] = useState(null);
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    async function loadStaticData() {
      try {
        const [b, c, config] = await Promise.all([
          getBanners(),
          getCategories(),
          getCompanyConfig()
        ]);
        setBanners(b);
        setCategories(c);
        setCompanyConfig(config);
      } catch (err) {
        console.error("Erro ao carregar dados estáticos:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadStaticData();
  }, []);

  useEffect(() => {
    async function loadDynamicProducts() {
      setLoadingProducts(true);
      try {
        const data = await getProducts(currentCategorySlug, currentSearch);
        setProducts(data);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadDynamicProducts();
  }, [currentCategorySlug, currentSearch]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug === 'todos') {
      params.delete('category__slug');
    } else {
      params.set('category__slug', slug);
    }

    params.delete('search');
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const getDisplayTitle = () => {
    if (currentSearch) return `BUSCA: "${currentSearch.toUpperCase()}"`;
    if (currentCategorySlug === 'todos') return "MAIS PEDIDOS";
    const cat = categories.find((c: any) => c.slug === currentCategorySlug);
    return cat ? cat.name.toUpperCase() : "PRODUTOS";
  };

  if (loadingInitial) return <LoadingScreen />;

  return (
    <main className="min-h-screen flex flex-col bg-[#05060a]">
      <Header />
      
      {!currentSearch && <Banner banners={banners} />}

      <section className="max-w-7xl mx-auto px-4 py-6 flex-grow w-full">
        <div className="mb-8">
           <SearchBar />
        </div>

        <div className="mb-10">
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em] mb-4 pl-2">
            Navegue por Categorias
          </p>
          <CategoryBar
            categories={categories}
            selectedCategory={currentCategorySlug}
            onSelectCategory={handleCategoryChange} 
          />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-black text-white italic tracking-tighter">
             {currentSearch ? "RESULTADO DA " : (currentCategorySlug === 'todos' ? "OS " : "CATEGORIA ")}
             <span className="text-brand-blue uppercase">{getDisplayTitle()}</span>
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-blue/50 to-transparent rounded-full"></div>
        </div>

        {loadingProducts ? (
            <div className="text-center py-20">
                <p className="text-brand-blue animate-pulse font-bold">Buscando produtos...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
            ))}

            {products.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-lg font-bold">Nenhum produto encontrado. 😢</p>
                <button 
                    onClick={() => router.push('/')} 
                    className="text-brand-blue text-sm font-bold uppercase tracking-widest mt-4 hover:underline"
                >
                    Limpar Filtros
                </button>
                </div>
            )}
            </div>
        )}
      </section>

      <Footer config={companyConfig} />
      <FloatingCart />
    </main>
  );
}

// 4. Exportação FINAL corrigida
// Envolvemos a lógica no Suspense para o Next.js não reclamar no build
export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}