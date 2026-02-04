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
  const [categories, setCategories] = useState([]);
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

  // Lógica de Filtro Airtight
  const filteredProducts = selectedCategory === "todos"
    ? products
    : products.filter((p: any) => p.category_slug === selectedCategory);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-brand-navy dark:text-white">
      Carregando Cloud Design...
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-[#0a0b14]">
      <Header />
      <Banner banners={banners} />

      <section className="container mx-auto px-4 py-10 flex-grow">
        <div className="mb-10">
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em] mb-4">Departamentos</p>
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <h2 className="text-3xl font-black mb-8 dark:text-white">Mais Pedidos</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <Footer />
      <FloatingCart />
    </main>
  );
}