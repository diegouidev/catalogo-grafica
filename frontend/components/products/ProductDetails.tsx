"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { registerView, getImageUrl, getCompanyConfig } from "@/services/api";
import { ShoppingCart, ShieldCheck, Clock, Truck, MessageCircle, TrendingDown, PackagePlus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductDetails({ product }: { product: any }) {
    const { addToCart } = useCart();

    // --- ESTADOS ---
    const defaultVariant = product.variants && product.variants.length > 0
        ? product.variants[0]
        : { id: 0, name: "Padrão", price: 0 };

    const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState("");

    const mainButtonRef = useRef<HTMLDivElement>(null);

    // --- EFEITOS ---
    useEffect(() => {
        if (product?.id) registerView(product.id);

        getCompanyConfig().then(response => {
            const data = response.results || response;
            const configItem = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;

            if (configItem && configItem.whatsapp) {
                setWhatsappNumber(configItem.whatsapp.replace(/\D/g, ""));
            }
        }).catch(err => console.error("Erro ao buscar config:", err));
    }, [product]);

    useEffect(() => {
        const handleScroll = () => {
            if (mainButtonRef.current) {
                const buttonPosition = mainButtonRef.current.getBoundingClientRect().bottom;
                setShowStickyBar(buttonPosition < 0);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- LÓGICA ATACADISTA ---
    const getQuantity = (name: string) => {
        const match = name.match(/(\d+)/);
        return match ? parseInt(match[0]) : 1;
    };

    const getUnitPrice = (price: number, name: string) => {
        const qtd = getQuantity(name);
        return qtd > 0 ? price / qtd : price;
    };

    const bestValueVariantId = product.variants?.reduce((prev: any, current: any) => {
        const prevPrice = getUnitPrice(Number(prev.price), prev.name);
        const currPrice = getUnitPrice(Number(current.price), current.name);
        return currPrice < prevPrice ? current : prev;
    }, product.variants?.[0])?.id;

    // --- AÇÕES ---
    const handleAddToCart = () => {
        addToCart(product, selectedVariant);
        toast.success("Produto adicionado ao carrinho!", {
            style: { background: '#00AEEF', color: '#fff', fontWeight: 'bold' },
            icon: '🛒'
        });
    };

    const handleWhatsAppQuestion = () => {
        if (!whatsappNumber) return toast.error("WhatsApp indisponível no momento.");
        const message = `Olá! Estou vendo o produto *${product.name}* no site e fiquei com uma dúvida...`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!product) return <div className="text-white text-center p-10">Carregando detalhes...</div>;
    const currentPrice = Number(selectedVariant?.price || 0);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

                {/* COLUNA 1: IMAGEM */}
                <div className="relative rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 aspect-square lg:aspect-auto lg:h-[600px] group">
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/logo-oficial.png";
                        }}
                    />
                </div>

                {/* COLUNA 2: DETALHES E COMPRA */}
                <div className="flex flex-col justify-center space-y-8">

                    <div>
                        <span className="text-brand-blue font-bold text-xs uppercase tracking-[0.2em] mb-2 block">
                            {product.category_name}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                            {product.name}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            {product.finishings?.map((f: any) => (
                                <span key={f.id} className="text-[10px] font-bold text-gray-300 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                                    {f.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="prose prose-invert text-gray-400 text-sm leading-relaxed border-l-2 border-brand-blue/30 pl-4">
                        <p>{product.description || "Descrição em breve."}</p>
                    </div>

                    {/* TABELA PROGRESSIVA */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <TrendingDown size={14} className="text-brand-blue" /> Selecione a Quantidade (Quanto mais, mais barato):
                        </label>
                        <div className="flex flex-col gap-2">
                            {product.variants?.map((variant: any) => {
                                const unitPrice = getUnitPrice(Number(variant.price), variant.name);
                                const isBestValue = variant.id === bestValueVariantId;
                                const isSelected = selectedVariant.id === variant.id;

                                return (
                                    <button
                                        key={variant.id}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`relative flex items-center justify-between p-4 rounded-xl text-left transition-all border-2 ${isSelected
                                            ? "bg-brand-blue/10 border-brand-blue shadow-[0_0_20px_rgba(0,174,239,0.15)]"
                                            : "bg-black/20 border-white/5 hover:border-white/20"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-brand-blue" : "border-gray-600"}`}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-blue" />}
                                            </div>
                                            <div>
                                                <span className={`block font-bold text-sm ${isSelected ? "text-white" : "text-gray-400"}`}>
                                                    {variant.name}
                                                </span>
                                                {isBestValue && (
                                                    <span className="text-[9px] font-black uppercase text-black bg-green-400 px-2 py-0.5 rounded-full absolute -top-2 left-4 shadow-lg animate-pulse">
                                                        Melhor Custo-Benefício
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`block font-black text-sm ${isSelected ? "text-brand-blue" : "text-white"}`}>
                                                R$ {Number(variant.price).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">
                                                R$ {unitPrice.toFixed(2)} / un
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Botão de Compra Principal */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-white/10" ref={mainButtonRef}>
                        <div className="flex items-end gap-2">
                            <span className="text-gray-400 text-sm mb-1">Total:</span>
                            <span className="text-4xl font-black text-white tracking-tighter">
                                R$ {currentPrice.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-blue/20"
                        >
                            <ShoppingCart size={24} /> ADICIONAR AO PEDIDO
                        </button>

                        <button onClick={handleWhatsAppQuestion} className="w-full bg-white/5 hover:bg-white/10 text-green-400 border border-green-500/30 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                            <MessageCircle size={16} /> Ficou com dúvida? Fale com um especialista
                        </button>

                        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wide pt-2 px-1">
                            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500" /> Compra Segura</span>
                            <span className="flex items-center gap-1"><Clock size={14} className="text-brand-blue" /> {product.production_time || "Consulte prazo"}</span>
                            <span className="flex items-center gap-1"><Truck size={14} className="text-yellow-500" /> Entrega CE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* INÍCIO DO COMPRE JUNTO (UPSELL) */}
            {product.upsell_products && product.upsell_products.length > 0 && (
                <div className="col-span-full mt-12 pt-10 border-t border-white/10 animate-in fade-in slide-in-from-bottom-8">
                    <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                        <PackagePlus className="text-brand-blue" size={28} /> Aproveite e leve também
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {product.upsell_products.map((upsell: any) => (
                            <Link
                                key={upsell.id}
                                href={`/produto/${upsell.slug}`}
                                className="flex items-center gap-4 bg-[#0f111a] p-4 rounded-3xl border border-white/5 hover:border-brand-blue/30 transition-all group shadow-lg"
                            >
                                <img
                                    src={getImageUrl(upsell.image)}
                                    alt={upsell.name}
                                    className="w-20 h-20 rounded-2xl object-cover group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/logo-oficial.png";
                                    }}
                                />
                                <div>
                                    <h4 className="text-white font-bold group-hover:text-brand-blue transition-colors leading-tight mb-1">{upsell.name}</h4>
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                                        a partir de <span className="text-brand-blue">R$ {Number(upsell.starting_price).toFixed(2)}</span>
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            {/* FIM DO COMPRE JUNTO */}

            {/* BARRA FIXA MOBILE */}
            <div className={`fixed bottom-0 left-0 w-full bg-[#0a0b14]/90 backdrop-blur-lg border-t border-brand-blue/30 p-4 z-50 flex items-center justify-between lg:hidden transition-transform duration-500 ${showStickyBar ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total do Pedido</span>
                    <span className="text-xl font-black text-white">R$ {currentPrice.toFixed(2)}</span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="bg-brand-blue text-white px-6 py-3 rounded-xl font-black text-sm uppercase flex items-center gap-2 shadow-lg shadow-brand-blue/20 active:scale-95"
                >
                    <ShoppingCart size={18} /> Adicionar
                </button>
            </div>
        </>
    );
}