"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatWhatsAppLink } from "@/services/api";
import { X, MessageCircle, User, Phone, ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { cart, removeFromCart } = useCart();
    const [step, setStep] = useState<'cart' | 'identification'>('cart');

    // Estado do cliente - Tenta carregar do LocalStorage ao iniciar
    const [customerData, setCustomerData] = useState({ name: "", phone: "" });

    // Efeito para carregar dados salvos quando o drawer abrir
    useEffect(() => {
        if (isOpen) {
            const savedName = localStorage.getItem("@CloudDesign:customerName");
            const savedPhone = localStorage.getItem("@CloudDesign:customerPhone");
            if (savedName || savedPhone) {
                setCustomerData({
                    name: savedName || "",
                    phone: savedPhone || ""
                });
            }
        }
    }, [isOpen]);

    const total = cart.reduce((acc: number, item: any) => acc + Number(item.selectedVariant.price), 0);

    const handleNextStep = () => {
        if (cart.length === 0) return;
        setStep('identification');
    };

    const handleFinalCheckout = () => {
        if (!customerData.name || !customerData.phone) {
            toast.error("Preencha seu nome e contato para continuarmos.");
            return;
        }

        // Salva no LocalStorage para a próxima compra
        localStorage.setItem("@CloudDesign:customerName", customerData.name);
        localStorage.setItem("@CloudDesign:customerPhone", customerData.phone);

        const message = `*NOVO PEDIDO - CLOUD DESIGN* 🎨\n\n` +
            `*Cliente:* ${customerData.name}\n` +
            `*Contato:* ${customerData.phone}\n` +
            `--------------------------\n` +
            cart.map((item: any) => `- ${item.name}\n  Opção: ${item.selectedVariant.name}\n  Valor: R$ ${Number(item.selectedVariant.price).toFixed(2)}`).join('\n\n') +
            `\n\n--------------------------\n` +
            `*TOTAL: R$ ${total.toFixed(2)}*`;

        window.open(formatWhatsAppLink(message), '_blank');
        toast.success("Enviando para o WhatsApp...");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-[#0a0b14] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">

                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b dark:border-white/10">
                    <div>
                        <h2 className="text-2xl font-black dark:text-white">
                            {step === 'cart' ? 'Meu Pedido' : 'Quase lá...'}
                        </h2>
                        <p className="text-[10px] text-brand-blue uppercase font-black tracking-[0.2em]">Cloud Design Gráfica</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="flex-grow overflow-y-auto p-6">
                    {step === 'cart' ? (
                        /* LISTA DO CARRINHO */
                        cart.length > 0 ? (
                            <div className="space-y-4">
                                {cart.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 items-center">
                                        <img src={item.image} className="w-16 h-16 rounded-xl object-cover" alt={item.name} />
                                        <div className="flex-grow">
                                            <p className="font-bold dark:text-white text-sm line-clamp-1">{item.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{item.selectedVariant.name}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="font-black text-brand-blue">R$ {Number(item.selectedVariant.price).toFixed(2)}</p>
                                                <button onClick={() => removeFromCart(index)} className="text-[10px] text-red-500 font-black hover:opacity-70 uppercase">Remover</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 dark:text-white">
                                <ShoppingCart size={64} className="mb-4" />
                                <p className="font-bold">Seu carrinho está vazio</p>
                            </div>
                        )
                    ) : (
                        /* FORMULÁRIO DE IDENTIFICAÇÃO (LEAD MAGNET) */
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-brand-blue/10 p-5 rounded-3xl border border-brand-blue/20">
                                <p className="text-sm text-brand-blue font-bold leading-relaxed">
                                    Para agilizar sua produção, informe seu nome e contato. Seus dados ficarão salvos para as próximas compras! 💾
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Como podemos te chamar?</label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Seu Nome Completo"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white font-medium"
                                            value={customerData.name}
                                            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Seu WhatsApp</label>
                                    <div className="relative mt-1">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue" size={18} />
                                        <input
                                            type="text"
                                            placeholder="(85) 9 0000-0000"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white font-medium"
                                            value={customerData.phone}
                                            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setStep('cart')} className="w-full text-xs text-gray-400 font-black uppercase tracking-widest hover:text-brand-blue transition-colors text-center">
                                ← Voltar e revisar itens
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <div className="flex justify-between items-end mb-6">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Valor Total</p>
                        <p className="text-3xl font-black text-brand-blue">R$ {total.toFixed(2)}</p>
                    </div>

                    {step === 'cart' ? (
                        <button
                            onClick={handleNextStep}
                            disabled={cart.length === 0}
                            className="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-blue/20 active:scale-95"
                        >
                            Confirmar Pedido <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinalCheckout}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                        >
                            <MessageCircle size={24} /> Chamar no WhatsApp
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}