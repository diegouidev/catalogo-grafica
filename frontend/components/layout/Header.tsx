"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer"; //

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart } = useCart(); // Puxa a lista do contexto

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-brand-navy/50 bg-white/80 dark:bg-brand-navy/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Use a logo branca no dark mode e a oficial no light se tiver */}
                        <Image src="/logo-oficial.png" alt="Cloud Design" width={180} height={60} className="dark:hidden" />
                        <Image src="/logo-cloud-branca.png" alt="Cloud Design" width={180} height={60} className="hidden dark:block" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
                        </button>

                        <button onClick={() => setIsCartOpen(true)} className="relative p-2">
                            <ShoppingCart size={24} className="text-brand-blue" />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}