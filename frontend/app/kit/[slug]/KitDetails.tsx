"use client";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { getImageUrl, getCompanyConfig } from "@/services/api";
import { ShoppingCart, Gift, CheckCircle, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function KitDetails({ kit }: { kit: any }) {
    const { addToCart } = useCart();
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const mainButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getCompanyConfig().then(response => {
            // Lógica Blindada: Aceita tanto Array quanto Objeto Único
            const data = response.results || response;
            let configItem = null;

            if (Array.isArray(data)) {
                configItem = data.length > 0 ? data[0] : null;
            } else {
                configItem = data;
            }

            if (configItem && configItem.whatsapp) {
                setWhatsappNumber(configItem.whatsapp.replace(/\D/g, ""));
            }
        });

        const handleScroll = () => {
            if (mainButtonRef.current) {
                const buttonPosition = mainButtonRef.current.getBoundingClientRect().bottom;
                setShowStickyBar(buttonPosition < 0);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleAddKit = () => {
        const fakeProduct = {
            id: `kit-${kit.id}`,
            name: `📦 ${kit.name}`,
            image: kit.image,
            category_name: "Kit Promocional"
        };
        const fakeVariant = {
            id: kit.id,
            name: "Combo Completo",
            price: kit.price
        };

        addToCart(fakeProduct, fakeVariant);
        toast.success("Combo adicionado ao carrinho!", {
            style: { background: '#00AEEF', color: '#fff', fontWeight: 'bold' },
            icon: '🎉'
        });
    };

    const handleWhatsAppQuestion = () => {
        if (!whatsappNumber) return toast.error("WhatsApp indisponível.");
        const message = `Olá! Estou interessado no *${kit.name}* e tenho uma dúvida...`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-blue/10 to-black border border-brand-blue/20 aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center p-8">
                    <img
                        src={getImageUrl(kit.image)}
                        alt={kit.name}
                        className="w-full h-full object-cover rounded-3xl shadow-2xl"
                        onError={(e) => { e.currentTarget.src = "/logo-oficial.png"; }}
                    />
                </div>

                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <span className="text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full mb-4 inline-block">
                            Oferta Especial
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 flex items-center gap-3">
                            {kit.name}
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed">{kit.description}</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-4">
                            <Gift size={16} className="text-brand-blue" /> Este combo inclui:
                        </h3>
                        <ul className="space-y-3">
                            {kit.products_details?.map((prod: any) => (
                                <li key={prod.id} className="flex items-center gap-3 text-gray-300 text-sm font-medium">
                                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                                    {prod.name}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-white/10" ref={mainButtonRef}>
                        <div className="flex items-end gap-2">
                            <span className="text-gray-400 text-sm mb-1">Preço do Combo:</span>
                            <span className="text-4xl font-black text-brand-blue tracking-tighter">
                                R$ {Number(kit.price).toFixed(2)}
                            </span>
                        </div>

                        <button onClick={handleAddKit} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-blue/20">
                            <ShoppingCart size={24} /> EU QUERO ESTE COMBO
                        </button>

                        <button onClick={handleWhatsAppQuestion} className="w-full bg-white/5 hover:bg-white/10 text-green-400 border border-green-500/30 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                            <MessageCircle size={16} /> Dúvida sobre o Kit?
                        </button>
                    </div>
                </div>
            </div>

            <div className={`fixed bottom-0 left-0 w-full bg-[#0a0b14]/90 backdrop-blur-lg border-t border-brand-blue/30 p-4 z-50 flex items-center justify-between lg:hidden transition-transform duration-500 ${showStickyBar ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Preço Promocional</span>
                    <span className="text-xl font-black text-brand-blue">R$ {Number(kit.price).toFixed(2)}</span>
                </div>
                <button onClick={handleAddKit} className="bg-brand-blue text-white px-6 py-3 rounded-xl font-black text-sm uppercase flex items-center gap-2 shadow-lg shadow-brand-blue/20 active:scale-95">
                    <ShoppingCart size={18} /> Comprar
                </button>
            </div>
        </>
    );
}