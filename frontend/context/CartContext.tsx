"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "react-hot-toast";

// Pega a URL do .env ou usa localhost como fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface CartContextType {
    cart: any[];
    addToCart: (product: any, variant: any) => void;
    removeFromCart: (index: number) => void;
    clearCart: () => void;
    coupon: any | null;
    applyCoupon: (code: string) => Promise<any>;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<any[]>([]);
    const [coupon, setCoupon] = useState<any | null>(null);

    // Carrega carrinho e cupom do localStorage ao iniciar
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("@CloudDesign:cart");
            if (savedCart) setCart(JSON.parse(savedCart));
            
            const savedCoupon = localStorage.getItem("@CloudDesign:coupon");
            if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
        }
    }, []);

    // Salva carrinho sempre que mudar
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("@CloudDesign:cart", JSON.stringify(cart));
        }
    }, [cart]);

    // Salva cupom sempre que mudar
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (coupon) localStorage.setItem("@CloudDesign:coupon", JSON.stringify(coupon));
            else localStorage.removeItem("@CloudDesign:coupon");
        }
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

    // --- FUNÇÃO CORRIGIDA ---
    const applyCoupon = async (code: string) => {
        try {
            // Remove espaços e deixa maiúsculo para evitar erros bobos
            const cleanCode = code.trim().toUpperCase(); 
            
            const res = await fetch(`${API_BASE_URL}/coupons/validate/?code=${cleanCode}`);
            
            // Se o backend retornar 404 ou 400, já sabemos que falhou
            if (!res.ok) {
                setCoupon(null);
                return { success: false };
            }

            const data = await res.json();
            console.log("Resposta do Cupom:", data); // Debug no console

            // Lógica mais flexível:
            // Aceita se tiver 'valid: true' OU se tiver 'discount_percentage' direto na resposta
            if (data.valid === true || (data.discount_percentage !== undefined && data.discount_percentage !== null)) {
                
                const finalDiscount = data.discount_percentage;
                
                setCoupon({ 
                    code: data.code || cleanCode, 
                    discount: finalDiscount 
                });
                
                return { success: true, discount: finalDiscount };
            } else {
                // Deu 200 OK mas não veio dados úteis
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
