"use client";
import { useState, useEffect } from "react";
import { X, Clock, Copy, CheckCircle } from "lucide-react";
import { getExitPopupConfig, getImageUrl } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";

export default function ExitIntentPopup() {
    const { cart } = useCart();
    const [isVisible, setIsVisible] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [hasTriggered, setHasTriggered] = useState(false);

    // O código vem do backend agora, ou usa um padrão se falhar
    const couponCode = config?.coupon_code || "OFFER";

    useEffect(() => {
        getExitPopupConfig().then(data => {
            const item = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;

            if (item && item.is_active) {
                setConfig(item);
                setTimeLeft(item.timer_minutes * 60);
            }
        });
    }, []);

    useEffect(() => {
        if (!isVisible || timeLeft <= 0) return;
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [isVisible, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const cartTotal = cart.reduce((acc, item) => {
        const price = item.selectedVariant?.price ? Number(item.selectedVariant.price) : 0;
        return acc + price;
    }, 0);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                triggerPopup();
            }
        };
        document.addEventListener("mouseleave", handleMouseLeave);
        return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }, [config, cartTotal, hasTriggered]);

    const triggerPopup = () => {
        if (!config || hasTriggered) return;

        const lastSeen = localStorage.getItem("@CloudDesign:popupSeenDate");
        const today = new Date().toISOString().split('T')[0];

        // 🚨 IMPORTANTE: Comente a linha abaixo para TESTAR SEMPRE
        // Para produção, descomente ela.
        if (lastSeen === today) return;

        const minVal = Number(config.minimum_cart_value);
        if (cartTotal < minVal) return;

        setIsVisible(true);
        setHasTriggered(true);

        // Salva que já viu hoje
        localStorage.setItem("@CloudDesign:popupSeenDate", today);
    };

    const handleAccept = () => {
        navigator.clipboard.writeText(couponCode);

        toast.success(`Cupom ${couponCode} copiado!`, {
            style: { background: '#22c55e', color: '#fff', fontWeight: 'bold' },
            icon: '🎟️',
            duration: 4000
        });

        setIsVisible(false);
    };

    // Função de Debug para limpar o teste (se precisar clicar no X)
    const handleClose = () => {
        setIsVisible(false);
        // Descomente abaixo se quiser que ao fechar no X ele permita ver de novo logo em seguida nos testes
        // localStorage.removeItem("@CloudDesign:popupSeenDate"); 
    };

    if (!isVisible || !config) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-[#0a0b14] border border-white/10 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors z-20"
                >
                    <X size={20} />
                </button>

                <div className="relative aspect-video w-full bg-gray-900">
                    <img
                        src={getImageUrl(config.image)}
                        alt="Oferta Especial"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/logo-oficial.png"; }}
                    />

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-black text-xl shadow-lg flex items-center gap-2 animate-pulse whitespace-nowrap">
                        <Clock size={20} />
                        <span>EXPIRA EM: {formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="p-6 text-center">
                    <h3 className="text-white font-bold text-lg mb-2">NÃO PERCA ESSA OPORTUNIDADE!</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Use o cupom <span className="text-brand-blue font-bold text-lg">{couponCode}</span> agora mesmo.
                    </p>

                    <button
                        onClick={handleAccept}
                        className="w-full bg-brand-blue hover:bg-white hover:text-brand-blue text-white font-black uppercase py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20"
                    >
                        <Copy size={20} /> COPIAR CUPOM E APROVEITAR
                    </button>
                </div>
            </div>
        </div>
    );
}