"use client";
import { useCart } from "@/context/CartContext";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

export default function WhatsAppFab() {
    const { cart } = useCart();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    if (cart.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-brand-blue text-white p-5 rounded-[2rem] shadow-2xl hover:scale-110 transition-all flex items-center gap-3 group border border-white/20 active:scale-95"
            >
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border-2 border-[#0a0b14]">
                    {cart.length}
                </div>
                <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
                <span className="font-black uppercase tracking-widest text-xs pr-2 hidden md:block">Finalizar Pedido</span>
            </button>

            <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
}