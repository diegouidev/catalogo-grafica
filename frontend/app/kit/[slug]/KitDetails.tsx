"use client";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/services/api";
import { ShoppingCart, Gift, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function KitDetails({ kit }: { kit: any }) {
    const { addToCart } = useCart();

    const handleAddKit = () => {
        // TRUQUE: Transformamos o Kit num "Produto" pro Cart entender
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

                {/* O QUE VEM NO KIT */}
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

                <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-end gap-2">
                        <span className="text-gray-400 text-sm mb-1">Preço do Combo:</span>
                        <span className="text-4xl font-black text-brand-blue tracking-tighter">
                            R$ {Number(kit.price).toFixed(2)}
                        </span>
                    </div>

                    <button onClick={handleAddKit} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-blue/20">
                        <ShoppingCart size={24} /> EU QUERO ESTE COMBO
                    </button>
                </div>
            </div>
        </div>
    );
}