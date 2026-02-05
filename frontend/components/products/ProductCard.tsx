"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Clock, CheckCircle2, Eye, X, Layers } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductCard({ product }: { product: any }) {
    const { addToCart } = useCart();
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAdd = () => {
        addToCart(product, selectedVariant);
        toast.success("Adicionado ao carrinho!", {
            style: {
                background: '#00AEEF',
                color: '#fff',
                fontWeight: 'bold'
            },
            icon: '🛒'
        });
    };

    return (
        <>
            <div className="group bg-[#0f111a] border border-white/5 rounded-[2rem] p-4 flex flex-col h-full hover:border-brand-blue/30 transition-all duration-300 relative overflow-hidden">

                {/* Imagem */}
                <div
                    className="aspect-square w-full rounded-[1.5rem] overflow-hidden bg-black/20 mb-4 relative cursor-pointer group-hover:opacity-90 transition-opacity"
                    onClick={() => setIsModalOpen(true)}
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={32} />
                    </div>
                </div>

                {/* Conteúdo */}
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
                        {product.name}
                    </h3>

                    {/* ACABAMENTOS (Novidade) */}
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

                    {/* Seletor de Variante e Preço */}
                    <div className="mt-auto space-y-4">
                        <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                            <select
                                className="w-full bg-transparent text-white text-sm outline-none font-bold cursor-pointer"
                                onChange={(e) => {
                                    const variant = product.variants.find((v: any) => v.id === Number(e.target.value));
                                    setSelectedVariant(variant);
                                }}
                            >
                                {product.variants.map((v: any) => (
                                    <option key={v.id} value={v.id} className="dark:bg-brand-navy">
                                        {v.name} Uni - R$ {Number(v.price).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Valor</span>
                                <span className="text-2xl font-black text-white">
                                    R$ {Number(selectedVariant?.price || 0).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold pt-2">Quant. {selectedVariant?.name} Uni</span>
                            </div>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="w-full justify-center bg-brand-blue hover:bg-brand-blue/80 text-white px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-brand-blue/20 transition-all active:scale-95"
                        >
                            <ShoppingCart size={18} />
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Zoom da Imagem */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
                    <button className="absolute top-5 right-5 text-white bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors">
                        <X size={24} />
                    </button>
                    <img src={product.image} alt={product.name} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </>
    );
}