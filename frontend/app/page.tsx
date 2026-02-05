"use client";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Banner from "@/components/layout/Banner";
import CategoryBar from "@/components/products/CategoryBar";
import ProductCard from "@/components/products/ProductCard";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/cart/FloatingCart";
import { getProducts, getBanners, getCategories } from "@/services/api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, b, c] = await Promise.all([
          getProducts(),
          getBanners(),
          getCategories()
        ]);
        setProducts(p);
        setBanners(b);
        setCategories(c);
      } catch (err) {
        console.error("Erro ao carregar:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Lógica do Filtro
  const filteredProducts = selectedCategory === "todos"
    ? products
    : products.filter((p: any) => p.category_slug === selectedCategory);

  // Lógica do Título Dinâmico
  const currentCategoryName = selectedCategory === "todos"
    ? "Mais Pedidos"
    : categories.find((c: any) => c.slug === selectedCategory)?.name || "Produtos";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b14] text-white font-black animate-pulse">
      CARREGANDO CLOUD DESIGN...
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col bg-[#05060a]">
      <Header onOpenCart={() => { }} />
      <Banner banners={banners} />

      <section className="max-w-7xl mx-auto px-4 py-10 flex-grow w-full">
        <div className="mb-10">
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em] mb-4 pl-2">
            Navegue por Categorias
          </p>
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Título Dinâmico */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-black text-white italic tracking-tighter">
            {selectedCategory === "todos" ? "MAIS" : "CATEGORIA"} <span className="text-brand-blue uppercase">{currentCategoryName}</span>
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-blue/50 to-transparent rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              <p>Nenhum produto encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer config={null} />
      <FloatingCart />
    </main>
  );
}