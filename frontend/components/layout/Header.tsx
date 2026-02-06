"use client";

import { useTheme } from "next-themes";
import { ShoppingCart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart } = useCart();

    const [whatsapp, setWhatsapp] = useState<string | null>(null);

    useEffect(() => {
        async function loadCompanyConfig() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/company-config/`
                );
                const data = await res.json();

                if (data.length > 0) {
                    setWhatsapp(data[0].whatsapp);
                }
            } catch (error) {
                console.error("Erro ao carregar WhatsApp", error);
            }
        }

        loadCompanyConfig();
    }, []);

    const message = encodeURIComponent(
        "Olá! Gostaria de falar com a Cloud Design 😊"
    );

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-brand-navy/50 bg-white/80 dark:bg-brand-navy/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo-oficial.png"
                            alt="Cloud Design"
                            width={180}
                            height={60}
                            className="dark:hidden"
                        />
                        <Image
                            src="/logo-cloud-branca.png"
                            alt="Cloud Design"
                            width={180}
                            height={60}
                            className="hidden dark:block"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Botão WhatsApp */}
                        <a
                            href={
                                whatsapp
                                    ? `https://wa.me/${whatsapp}?text=${message}`
                                    : "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2"
                            aria-label="Falar no WhatsApp"
                        >
                            <MessageCircle
                                size={24}
                                className="text-green-500"
                            />
                        </a>

                        {/* Carrinho */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2"
                        >
                            <ShoppingCart
                                size={24}
                                className="text-brand-blue"
                            />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </>
    );
}
