"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { registerView, getImageUrl } from "@/services/api";
import { ShoppingCart, Check, Clock, ShieldCheck, Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function ProductDetails({ product }: { product: any }) {
    const { addToCart } = useCart();
    
    // Seleciona a primeira variante por padrão
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    
    // Analytics: Conta a visualização assim que o componente monta
    useEffect(() => {
        if (product?.id) {
            registerView(product.id);
        }
    }, [product]);

    const handleAddToCart = () => {
        addToCart(product, selectedVariant);
        toast.success("Produto adicionado ao carrinho!", {
            style: { background: '#00AEEF', color: '#fff', fontWeight: 'bold' },
            icon: '🛒'
        });
    };

    if (!product) return <div>Produto não carregado</div>;

    const currentPrice = Number(selectedVariant?.price || 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* COLUNA 1: IMAGEM GIGANTE */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 aspect-square lg:aspect-auto lg:h-[600px] group">
                <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority // Carrega rápido para SEO
                />
            </div>

            {/* COLUNA 2: DETALHES E COMPRA */}
            <div className="flex flex-col justify-center space-y-8">
                
                {/* Cabeçalho */}
                <div>
                    <span className="text-brand-blue font-bold text-xs uppercase tracking-[0.2em] mb-2 block">
                        {product.category_name}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                        {product.name}
                    </h1>
                    {/* Badges de Acabamento */}
                    <div className="flex flex-wrap gap-2">
                        {product.finishings?.map((f:any) => (
                            <span key={f.id} className="text-[10px] font-bold text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                                {f.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Descrição */}
                <div className="prose prose-invert text-gray-400 text-sm leading-relaxed border-l-2 border-brand-blue/30 pl-4">
                    <p>{product.description || "Sem descrição detalhada."}</p>
                </div>

                {/* Seletor de Variação (Interativo) */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Escolha a quantidade / Tamanho:</label>
                    <div className="grid grid-cols-2 gap-3">
                        {product.variants.map((variant: any) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={`p-4 rounded-xl text-left transition-all border ${
                                    selectedVariant.id === variant.id 
                                    ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20" 
                                    : "bg-black/20 text-gray-400 border-white/5 hover:border-white/20"
                                }`}
                            >
                                <span className="block font-bold text-sm">{variant.name}</span>
                                <span className={`text-xs ${selectedVariant.id === variant.id ? "text-white/90" : "text-gray-500"}`}>
                                    R$ {Number(variant.price).toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preço e Botão */}
                <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-end gap-2">
                        <span className="text-gray-400 text-sm mb-1">Total:</span>
                        <span className="text-4xl font-black text-white tracking-tighter">
                            R$ {currentPrice.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/40"
                    >
                        <ShoppingCart size={24} /> Adicionar ao Pedido
                    </button>
                    
                    {/* Garantias */}
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wide pt-2">
                        <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500"/> Compra Segura</span>
                        <span className="flex items-center gap-1"><Clock size={14} className="text-brand-blue"/> Produção: {product.production_time}</span>
                        <span className="flex items-center gap-1"><Truck size={14} className="text-yellow-500"/> Entrega em todo CE</span>
                    </div>
                </div>

            </div>
        </div>
    );
}