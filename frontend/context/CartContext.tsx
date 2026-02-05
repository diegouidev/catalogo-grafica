"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<any[]>([]);
    const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);

    // Carrega o carrinho do localStorage ao iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Erro ao carregar carrinho", e);
            }
        }
    }, []);

    // Salva o carrinho sempre que mudar
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: any, variant: any) => {
        setCart(prev => [...prev, { ...product, selectedVariant: variant, quantity: 1 }]);
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCart([]);
        setCoupon(null);
    };

    const applyCoupon = async (code: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/coupons/validate/?code=${code}`);
            if (res.ok) {
                const data = await res.json();
                setCoupon({ code: data.code, discount: data.discount_percentage });
                return { success: true, discount: data.discount_percentage };
            }
            return { success: false };
        } catch (error) {
            return { success: false };
        }
    };

    const removeCoupon = () => setCoupon(null);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, clearCart,
            coupon, applyCoupon, removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);