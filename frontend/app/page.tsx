"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, getBanners, getCategories, getCompanyConfig } from "@/services/api";
import Header from "@/components/layout/Header";
import Banner from "@/components/layout/Banner";
import CategoryBar from "@/components/products/CategoryBar";
import ProductCard from "@/components/products/ProductCard";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/cart/FloatingCart";
import SearchBar from "@/components/layout/SearchBar";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Lê os filtros diretamente da URL
  const currentCategorySlug = searchParams.get('category__slug') || 'todos';
  const currentSearch = searchParams.get('search') || '';

  // Estados de Dados
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [companyConfig, setCompanyConfig] = useState(null);
  
  // Estados de Loading
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // 2. Carga Inicial (Banners, Categorias, Config) - Roda apenas uma vez
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

  // 3. Carga Dinâmica de Produtos - Roda sempre que a URL (Categoria ou Busca) mudar
  useEffect(() => {
    async function loadDynamicProducts() {
      setLoadingProducts(true);
      try {
        // Passa os parâmetros para a API filtrar no Backend
        const data = await getProducts(currentCategorySlug, currentSearch);
        setProducts(data);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadDynamicProducts();
  }, [currentCategorySlug, currentSearch]); // <--- Dependências vitais

  // 4. Manipulador de Click na Categoria (Atualiza a URL)
  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug === 'todos') {
      params.delete('category__slug');
    } else {
      params.set('category__slug', slug);
    }

    // Opcional: Limpar a busca ao trocar de categoria para não confundir o usuário
    params.delete('search');

    // Navega para a nova URL (o useEffect acima vai detectar e recarregar os produtos)
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // Lógica do Título Dinâmico para exibição
  const getDisplayTitle = () => {
    if (currentSearch) return `BUSCA: "${currentSearch.toUpperCase()}"`;
    if (currentCategorySlug === 'todos') return "MAIS PEDIDOS";
    const cat = categories.find((c: any) => c.slug === currentCategorySlug);
    return cat ? cat.name.toUpperCase() : "PRODUTOS";
  };

  if (loadingInitial) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b14] text-white font-black animate-pulse">
      CARREGANDO CLOUD DESIGN...
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col bg-[#05060a]">
      <Header />
      
      {/* Só mostra o Banner se não estiver fazendo uma busca (opcional, deixa a UI mais limpa) */}
      {!currentSearch && <Banner banners={banners} />}

      <section className="max-w-7xl mx-auto px-4 py-6 flex-grow w-full">
        
        {/* BARRA DE BUSCA */}
        <div className="mb-8">
           <SearchBar />
        </div>

        {/* NAVEGAÇÃO DE CATEGORIAS */}
        <div className="mb-10">
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em] mb-4 pl-2">
            Navegue por Categorias
          </p>
          {/* Ajustado para usar a função que muda a URL */}
          <CategoryBar
            categories={categories}
            selectedCategory={currentCategorySlug}
            onSelectCategory={handleCategoryChange} 
          />
        </div>

        {/* TÍTULO DA SEÇÃO */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-black text-white italic tracking-tighter">
             {currentSearch ? "RESULTADO DA " : (currentCategorySlug === 'todos' ? "OS " : "CATEGORIA ")}
             <span className="text-brand-blue uppercase">{getDisplayTitle()}</span>
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-blue/50 to-transparent rounded-full"></div>
        </div>

        {/* GRID DE PRODUTOS */}
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