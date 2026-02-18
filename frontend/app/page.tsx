"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, getBanners, getCategories, getCompanyConfig, getImageUrl } from "@/services/api";
import Header from "@/components/layout/Header";
import Banner from "@/components/layout/Banner";
import CategoryBar from "@/components/products/CategoryBar";
import ProductCard from "@/components/products/ProductCard";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/cart/FloatingCart";
import SearchBar from "@/components/layout/SearchBar";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b14] text-white font-black animate-pulse">
      CARREGANDO CLOUD DESIGN...
    </div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategorySlug = searchParams.get('category__slug') || 'todos';
  const currentSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [companyConfig, setCompanyConfig] = useState(null);
  const [kits, setKits] = useState([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    async function loadStaticData() {
      try {
        const [b, c, config, k] = await Promise.all([
          getBanners(),
          getCategories(),
          getCompanyConfig(),
          import('@/services/api').then(m => m.getKits())
        ]);
        setBanners(b);

        // --- MUDANÇA: INJETAMOS A CATEGORIA "KITS" MANUALMENTE ---
        // Se houver kits cadastrados, adicionamos o botão "Kits & Combos" logo após o "Todos"
        // Criamos uma cópia para não mutar o array original
        const kitsCategory = k.length > 0 ? [{ id: 'kits-cat', name: '🔥 Kits & Combos', slug: 'kits' }] : [];
        setCategories([...kitsCategory, ...c]);
        // -----------------------------------------------------------

        setCompanyConfig(config);
        setKits(k);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadStaticData();
  }, []);

  useEffect(() => {
    async function loadDynamicProducts() {
      // Se a categoria selecionada for "kits", não buscamos produtos na API de produtos normais
      if (currentCategorySlug === 'kits') {
        setProducts([]);
        return;
      }

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
    if (slug === 'todos') params.delete('category__slug');
    else params.set('category__slug', slug);

    params.delete('search');
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const getDisplayTitle = () => {
    if (currentSearch) return `BUSCA: "${currentSearch.toUpperCase()}"`;
    if (currentCategorySlug === 'todos') return "MAIS PEDIDOS";
    if (currentCategorySlug === 'kits') return "COMBOS PROMOCIONAIS";

    const cat = categories.find((c: any) => c.slug === currentCategorySlug);
    // Remove emojis do nome da categoria se houver, só pra exibir limpo no título
    const cleanName = cat ? cat.name.replace(/🔥/g, '').trim() : "PRODUTOS";
    return cleanName.toUpperCase();
  };

  // Lógica de Exibição
  // Mostra kits se tiver kits E não for busca E (estiver em 'todos' OU 'kits')
  const showKits = kits.length > 0 && !currentSearch && (currentCategorySlug === 'todos' || currentCategorySlug === 'kits');

  // Mostra produtos normais se NÃO estiver na aba 'kits'
  const showProducts = currentCategorySlug !== 'kits';

  if (loadingInitial) return <LoadingScreen />;

  return (
    <main className="min-h-screen flex flex-col bg-[#05060a]">
      <Header />

      {/* Esconde Banner se estiver buscando algo */}
      {!currentSearch && <Banner banners={banners} />}

      <section className="max-w-7xl mx-auto px-4 py-6 flex-grow w-full">
        <div className="mb-8"><SearchBar /></div>

        <div className="mb-10">
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em] mb-4 pl-2">
            Navegue por Categorias
          </p>
          <CategoryBar
            categories={categories}
            selectedCategory={currentCategorySlug}
            onSelectCategory={handleCategoryChange}
          />

          {/* VITRINE DE KITS */}
          {showKits && (
            <div className="mb-12 animate-in fade-in zoom-in duration-500 mt-8">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                  {currentCategorySlug === 'kits' ? 'Todas as ' : '🔥 '}
                  <span className="text-brand-blue">Ofertas & Combos</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kits.map((kit: any) => (
                  <div key={kit.id} className="group flex flex-col relative bg-gradient-to-br from-[#0f111a] to-black border border-brand-blue/20 rounded-[2rem] p-5 hover:shadow-[0_0_30px_rgba(0,174,239,0.2)] transition-all">
                    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-10 animate-pulse">
                      Promoção
                    </div>

                    <div
                      className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-4 cursor-pointer"
                      onClick={() => router.push(`/kit/${kit.slug}`)}
                    >
                      <img src={getImageUrl(kit.image)} alt={kit.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.src = "/logo-oficial.png"; }} />
                    </div>

                    <h3
                      className="text-white font-black text-lg mb-1 cursor-pointer hover:text-brand-blue transition-colors"
                      onClick={() => router.push(`/kit/${kit.slug}`)}
                    >
                      {kit.name}
                    </h3>
                    <p className="text-gray-400 text-xs mb-4 line-clamp-2">{kit.description}</p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Leve o Kit por:</span>
                        <span className="text-2xl font-black text-brand-blue">R$ {Number(kit.price).toFixed(2)}</span>
                      </div>
                      <button onClick={() => router.push(`/kit/${kit.slug}`)} className="bg-brand-blue hover:bg-white hover:text-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-brand-blue/20">
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LISTA DE PRODUTOS NORMAIS (Só mostra se NÃO for categoria Kits) */}
        {showProducts && (
          <>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black text-white italic tracking-tighter">
                {currentSearch ? "RESULTADO DA " : (currentCategorySlug === 'todos' ? "OS " : "CATEGORIA ")}
                <span className="text-brand-blue uppercase">{getDisplayTitle()}</span>
              </h2>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-blue/50 to-transparent rounded-full"></div>
            </div>

            {loadingProducts ? (
              <div className="text-center py-20"><p className="text-brand-blue animate-pulse font-bold">Buscando produtos...</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product: any) => <ProductCard key={product.id} product={product} />)}

                {products.length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-lg font-bold">Nenhum produto encontrado nesta categoria. 😢</p>
                    <button onClick={() => router.push('/')} className="text-brand-blue text-sm font-bold uppercase tracking-widest mt-4 hover:underline">Limpar Filtros</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
      <Footer config={companyConfig} />
      <FloatingCart />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}