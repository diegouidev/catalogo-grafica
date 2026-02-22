"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Clock, Eye, X, Layers } from "lucide-react";
import { toast } from "react-hot-toast";
import { getImageUrl, PIX_MULTIPLIER, registerView } from "@/services/api";
import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
    const { addToCart } = useCart();

    // Adicionada proteção: se o produto for por m², pode não ter variantes cadastradas
    const [selectedVariant, setSelectedVariant] = useState(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleImageClick = () => {
        setIsModalOpen(true);
        registerView(product.id);
    };

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault(); // Muito importante: evita que clicar no botão abra a página do produto se ele estiver dentro de um Link

        // Criamos um "clone" da variação, mas forçamos o preço com desconto
        const variantWithDiscount = {
            ...selectedVariant,
            price: finalPrice
        };

        addToCart(product, variantWithDiscount);

        toast.success("Adicionado ao carrinho!", {
            style: { background: '#00AEEF', color: '#fff', fontWeight: 'bold' },
            icon: '🛒'
        });
    };

    // --- LÓGICA DE PREÇO E PROMOÇÃO ---
    const originalPrice = Number(selectedVariant?.price || product?.price || 0);
    const isOnSale = product.is_on_sale;
    const discountPercent = product.discount_percent || 0;

    // Calcula o preço final (se tiver promoção, tira a %; se não, mantém o original)
    const finalPrice = isOnSale
        ? originalPrice * (1 - (discountPercent / 100))
        : originalPrice;

    return (
        <>
            <div className="group bg-[#0f111a] border border-white/5 rounded-[2rem] p-4 flex flex-col h-full hover:border-brand-blue/30 transition-all duration-300 relative overflow-hidden">

                {/* Imagem */}
                <div
                    className="aspect-square w-full rounded-[1.5rem] overflow-hidden bg-black/20 mb-4 relative cursor-pointer group-hover:opacity-90 transition-opacity"
                    onClick={handleImageClick}
                >
                    {isOnSale && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.6)] z-10 animate-pulse">
                            🔥 {discountPercent}% OFF
                        </div>
                    )}
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/logo-oficial.png";
                        }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={32} />
                    </div>
                </div>

                <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-2 py-1 rounded-lg">
                            {product.category_name}
                        </span>
                        {product.is_featured && (
                            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1">
                                ★ Destaque
                            </span>
                        )}
                    </div>

                    <h3 className="text-white font-black text-lg leading-tight mb-3">
                        <Link
                            href={`/produto/${product.slug}`}
                            className="hover:text-brand-blue transition-colors cursor-pointer"
                        >
                            {product.name}
                        </Link>
                    </h3>

                    {product.finishings && product.finishings.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {product.finishings.map((finish: any, index: number) => (
                                <span key={index} className="text-[10px] font-bold text-gray-300 bg-white/5 border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1.5">
                                    <Layers size={10} className="text-brand-blue" />
                                    {finish.name}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                        <Clock size={14} className="text-brand-blue" />
                        <span>Produção: {product.production_time}</span>
                    </div>

                    {/* LÓGICA CONDICIONAL: Produto Padrão vs Produto M2 */}
                    <div className="mt-auto space-y-4">
                        {product.is_meter_price ? (
                            /* --- LAYOUT PARA PRODUTO VENDIDO POR M2 --- */
                            <>
                                <div className="bg-brand-blue/10 p-3 rounded-xl border border-brand-blue/20 flex items-center justify-center h-[46px]">
                                    <span className="text-brand-blue font-bold text-xs uppercase tracking-widest">
                                        Vendido por M²
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Valor Base</span>
                                        <span className="text-2xl font-black text-white">
                                            R$ {Number(selectedVariant?.price || 0).toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-brand-blue font-bold pt-2 uppercase">por m²</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/produto/${product.slug}`}
                                    className="w-full flex justify-center bg-brand-blue hover:bg-brand-blue/80 text-white px-5 py-3 rounded-xl font-black text-sm items-center gap-2 shadow-lg shadow-brand-blue/20 transition-all active:scale-95"
                                >
                                    <Eye size={18} />
                                    Ver Detalhes
                                </Link>
                            </>
                        ) : (
                            /* --- LAYOUT ORIGINAL PARA PRODUTO PADRÃO --- */
                            <>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                    <select
                                        className="w-full bg-transparent text-white text-sm outline-none font-bold cursor-pointer"
                                        value={selectedVariant?.id || ''}
                                        onChange={(e) => {
                                            const variant = product.variants.find((v: any) => v.id === Number(e.target.value));
                                            setSelectedVariant(variant);
                                        }}
                                    >
                                        {product.variants?.map((v: any) => (
                                            <option key={v.id} value={v.id} className="dark:bg-brand-navy text-white">
                                                {v.name} Uni - R$ {Number(v.price).toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Valor</span>

                                        {/* Preço Antigo Riscado (Só aparece se tiver promoção) */}
                                        {isOnSale && (
                                            <span className="text-xs text-gray-500 line-through mb-[-4px] mt-1">
                                                De: R$ {originalPrice.toFixed(2)}
                                            </span>
                                        )}

                                        {/* Preço Novo (ou normal) */}
                                        <span className="text-2xl font-black text-white">
                                            R$ {finalPrice.toFixed(2)}
                                        </span>

                                        {/* Cálculo do PIX já usando o Preço Novo Final! */}
                                        <span className="block text-[11px] text-green-400 font-bold mt-0.5">
                                            ou R$ {(finalPrice * PIX_MULTIPLIER).toFixed(2)} no PIX
                                        </span>

                                        <span className="text-[10px] text-gray-500 font-bold pt-2">
                                            Quant. {selectedVariant?.name || '1'} Uni
                                        </span>
                                    </div>
                                </div>
                                <button onClick={handleAdd} disabled={!selectedVariant} className="w-full justify-center bg-brand-blue hover:bg-brand-blue/80 text-white px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ShoppingCart size={18} />
                                    Adicionar ao Carrinho
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Imagem (Mantido exatamente igual) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
                    <button className="absolute top-5 right-5 text-white bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors"><X size={24} /></button>
                    <img src={getImageUrl(product.image)} alt={product.name} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </>
    );
}