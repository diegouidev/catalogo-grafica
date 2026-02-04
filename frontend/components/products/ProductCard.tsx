"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Clock, Plus, X, Eye } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductCard({ product }: { product: any }) {
    const { addToCart } = useCart();
    // Estado para a variante selecionada (começa com a primeira)
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    // Estado para o modal de imagem
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_BASE = "http://127.0.0.1:8000";

    // Função para avisar o backend que o produto foi visto
    const trackView = async () => {
        try {
            await fetch(`${API_BASE}/api/products/${product.id}/increment_view/`, {
                method: 'POST'
            });
        } catch (e) {
            console.error("Erro ao computar view");
        }
    };

    const handleAdd = () => {
        addToCart(product, selectedVariant);
        toast.success(`${product.name} adicionado!`, {
            style: {
                borderRadius: '15px',
                background: '#001529',
                color: '#fff',
            },
            icon: '🎨'
        });
    };

    const handleImageClick = () => {
        trackView(); // Contabiliza no backend
        setIsModalOpen(true); // Abre o popup
    };

    // Ajusta a URL da imagem para o ambiente local
    const imageUrl = product.image.startsWith('http')
        ? product.image
        : `${API_BASE}${product.image}`;

    return (
        <>
            <div className="group bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div
                    className="relative h-56 overflow-hidden cursor-pointer"
                    onClick={handleImageClick}
                >
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay de indicação de clique */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={32} />
                    </div>

                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-bold shadow-lg">
                        <Clock size={14} className="text-brand-blue" />
                        <span className="dark:text-white">{product.production_time}</span>
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="font-bold text-xl dark:text-white line-clamp-1">{product.name}</h3>

                    {/* Seletor de Variantes (Select Customizado) */}
                    <div className="mt-4">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Opções disponíveis:</label>
                        <select
                            value={selectedVariant?.id}
                            onChange={(e) => {
                                const variant = product.variants.find((v: any) => v.id === parseInt(e.target.value));
                                setSelectedVariant(variant);
                            }}
                            className="w-full mt-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue dark:text-white"
                        >
                            {product.variants.map((v: any) => (
                                <option key={v.id} value={v.id} className="dark:bg-brand-navy">
                                    {v.name} - R$ {Number(v.price).toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-black text-brand-blue">
                                R$ {Number(selectedVariant?.price).toFixed(2).replace('.', ',')}
                            </p>
                        </div>

                        <button
                            onClick={handleAdd}
                            className="bg-brand-blue hover:bg-brand-blue/80 text-white p-4 rounded-2xl shadow-lg shadow-brand-blue/20 transition-all active:scale-90 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            <ShoppingCart size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Imagem Ampliada */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setIsModalOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <X size={32} />
                    </button>
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full h-full"
                        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar na imagem
                    >
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain rounded-2xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                            <h2 className="text-white text-2xl font-black">{product.name}</h2>
                            <p className="text-gray-300">{product.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}