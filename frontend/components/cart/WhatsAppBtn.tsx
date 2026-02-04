"use client";
import { useCart } from "@/context/CartContext";
import { MessageCircle } from "lucide-react";
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
                className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl animate-bounce hover:scale-110 transition-transform flex items-center gap-2"
            >
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                </div>
                <MessageCircle size={28} />
                <span className="font-bold hidden md:block">Finalizar Pedido</span>
            </button>

            <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
}