"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "react-hot-toast";

// --- CORREÇÃO: Pega a URL do .env ou usa localhost ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface CartContextType {
    cart: any[];
    addToCart: (product: any, variant: any) => void;
    removeFromCart: (index: number) => void;
    clearCart: () => void;
    coupon: any | null;
    applyCoupon: (code: string) => Promise<any>; // Retorna promessa com resultado
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<any[]>([]);
    const [coupon, setCoupon] = useState<any | null>(null);

    // Carrega carrinho do localStorage ao iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem("@CloudDesign:cart");
        if (savedCart) setCart(JSON.parse(savedCart));
        
        const savedCoupon = localStorage.getItem("@CloudDesign:coupon");
        if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    }, []);

    // Salva carrinho sempre que mudar
    useEffect(() => {
        localStorage.setItem("@CloudDesign:cart", JSON.stringify(cart));
    }, [cart]);

    // Salva cupom sempre que mudar
    useEffect(() => {
        if (coupon) localStorage.setItem("@CloudDesign:coupon", JSON.stringify(coupon));
        else localStorage.removeItem("@CloudDesign:coupon");
    }, [coupon]);

    const addToCart = (product: any, variant: any) => {
        setCart((prev) => [...prev, { ...product, selectedVariant: variant }]);
    };

    const removeFromCart = (index: number) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCart([]);
        setCoupon(null);
    };

    // --- AQUI ESTAVA O PROBLEMA ---
    const applyCoupon = async (code: string) => {
        try {
            // Agora usa a variável dinâmica API_BASE_URL
            const res = await fetch(`${API_BASE_URL}/coupons/validate/?code=${code}`);
            const data = await res.json();

            if (res.ok && data.valid) {
                setCoupon({ code: data.code, discount: data.discount_percentage });
                return { success: true, discount: data.discount_percentage };
            } else {
                setCoupon(null);
                return { success: false };
            }
        } catch (error) {
            console.error("Erro ao validar cupom:", error);
            setCoupon(null);
            return { success: false };
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
        toast.success("Cupom removido.");
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, coupon, applyCoupon, removeCoupon }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart deve ser usado dentro de um CartProvider");
    return context;
};
