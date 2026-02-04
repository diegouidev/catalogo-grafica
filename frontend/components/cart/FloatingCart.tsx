"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import CartDrawer from "./CartDrawer";

export default function FloatingCart() {
    const { cart } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    if (cart.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[90] bg-brand-blue text-white p-5 rounded-full shadow-2xl shadow-brand-blue/40 hover:scale-110 active:scale-90 transition-all animate-bounce"
            >
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-brand-navy">
                    {cart.length}
                </div>
                <ShoppingBag size={28} />
            </button>

            <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}