"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, MessageCircle, User, Phone, ArrowRight, ShoppingCart, Trash2, Ticket, Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import { getImageUrl } from "@/services/api";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { cart, removeFromCart, coupon, applyCoupon, removeCoupon } = useCart();
    const [step, setStep] = useState<'cart' | 'identification'>('cart');
    const [couponInput, setCouponInput] = useState("");
    const [customerData, setCustomerData] = useState({ name: "", phone: "" });
    const [whatsappNumber, setWhatsappNumber] = useState("");

    // --- CONFIGURAÇÃO DA BARRA DE PROGRESSO ---
    const GOAL_AMOUNT = 300.00; // Valor para ganhar o bônus (Frete Grátis)
    // ------------------------------------------

    useEffect(() => {
        if (isOpen) {
            setStep('cart');
            const savedName = localStorage.getItem("@CloudDesign:customerName");
            const savedPhone = localStorage.getItem("@CloudDesign:customerPhone");
            if (savedName || savedPhone) {
                setCustomerData({ name: savedName || "", phone: savedPhone || "" });
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

            fetch(`${apiUrl}/company-config/`)
                .then(res => res.json())
                .then(data => {
                    const configList = data.results || data;
                    if (configList && configList.length > 0) {
                        setWhatsappNumber(configList[0].whatsapp.replace(/\D/g, ""));
                    }
                })
                .catch(() => console.error("Erro ao carregar configuração"));
        }
    }, [isOpen]);

    const subtotal = cart.reduce((acc: number, item: any) => {
        const price = item.selectedVariant?.price ? Number(item.selectedVariant.price) : 0;
        return acc + price;
    }, 0);

    const discountValue = coupon ? (subtotal * coupon.discount) / 100 : 0;
    const total = subtotal - discountValue;

    // --- LÓGICA DA BARRA DE PROGRESSO ---
    const progressPercentage = Math.min((total / GOAL_AMOUNT) * 100, 100);
    const amountMissing = Math.max(GOAL_AMOUNT - total, 0);
    const goalReached = total >= GOAL_AMOUNT;
    // ------------------------------------

    const handleApplyCoupon = async () => {
        const res = await applyCoupon(couponInput);
        if (res.success) toast.success(`Cupom de ${res.discount}% aplicado! 🎫`);
        else toast.error("Cupom inválido ou expirado. ❌");
    };

    const handleFinalCheckout = () => {
        if (!customerData.name || !customerData.phone) {
            return toast.error("Por favor, preencha seu nome e telefone! 👤");
        }

        if (!whatsappNumber) {
            return toast.error("Número da gráfica não encontrado. 📞");
        }

        localStorage.setItem("@CloudDesign:customerName", customerData.name);
        localStorage.setItem("@CloudDesign:customerPhone", customerData.phone);

        let message = `🚀 *NOVO PEDIDO - CLOUD DESIGN*\n\n`;
        message += `👤 *CLIENTE:* ${customerData.name}\n`;
        message += `📞 *WHATSAPP:* ${customerData.phone}\n\n`;
        message += `🛒 *ITENS DO PEDIDO:*\n`;

        cart.forEach((item: any) => {
            message += `✅ ${item.name}\n`;
            message += `   _Variação: ${item.selectedVariant?.name}_\n`;
            message += `   *Valor: R$ ${Number(item.selectedVariant?.price).toFixed(2)}*\n\n`;
        });

        message += `──────────────\n`;
        message += `💰 *SUBTOTAL:* R$ ${subtotal.toFixed(2)}\n`;

        if (coupon) {
            message += `🎫 *CUPOM:* ${coupon.code} (-${coupon.discount}%)\n`;
            message += `🎁 *DESCONTO:* - R$ ${discountValue.toFixed(2)}\n`;
        }

        message += `\n✅ *TOTAL FINAL: R$ ${total.toFixed(2)}*\n`;

        if (goalReached) {
            message += `🚚 *BÔNUS ALCANÇADO:* Frete Grátis!\n`;
        }

        message += `\n_Aguardando confirmação para iniciar a produção!_ 🎨`;

        const cleanMessage = message.trim();
        const encodedMessage = window.encodeURIComponent(cleanMessage).replace(/%20/g, "+");
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0b14] border-l border-white/10 shadow-2xl z-[100] transform transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex flex-col h-full relative">
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                    <h2 className="text-white text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <ShoppingCart className="text-brand-blue" /> {step === 'cart' ? 'Meu Carrinho' : 'Identificação'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"><X /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {step === 'cart' ? (
                        <div className="space-y-4">

                            {/* --- BARRA DE PROGRESSO VISUAL --- */}
                            {cart.length > 0 && (
                                <div className="mb-6 bg-white/5 border border-white/10 p-4 rounded-2xl animate-in fade-in zoom-in">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <Truck size={16} className={goalReached ? "text-green-500" : "text-brand-blue"} />
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">Frete Grátis</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase ${goalReached ? "text-green-500" : "text-gray-400"}`}>
                                            {goalReached ? "Alcançado 🎉" : `Faltam R$ ${amountMissing.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${goalReached ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-brand-blue"}`}
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    {!goalReached && (
                                        <p className="text-[10px] text-gray-500 mt-2 text-center italic">
                                            Adicione mais produtos para não pagar entrega!
                                        </p>
                                    )}
                                </div>
                            )}
                            {/* --------------------------------- */}

                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-10 italic">Seu carrinho está vazio... 🛒</p>
                            ) : (
                                cart.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group animate-in fade-in slide-in-from-right-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                            <img
                                                src={getImageUrl(item.image)}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/logo-oficial.png";
                                                }}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold text-sm truncate mb-1">{item.name}</h4>
                                            <div className="flex justify-between items-center">
                                                <p className="text-brand-blue text-[10px] font-black uppercase tracking-widest">{item.selectedVariant?.name || "Padrão"}</p>
                                                <p className="text-white font-bold text-xs">R$ {Number(item.selectedVariant?.price || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(index)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                ))
                            )}

                            {cart.length > 0 && (
                                <div className="mt-6 p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/20">
                                    <div className="flex gap-2">
                                        <input
                                            type="text" placeholder="CUPOM DE DESCONTO"
                                            className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl text-white text-xs outline-none focus:border-brand-blue transition-all uppercase"
                                            value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                                        />
                                        <button onClick={handleApplyCoupon} className="bg-brand-blue text-white px-4 rounded-xl font-bold text-xs transition-transform active:scale-90 shadow-lg shadow-brand-blue/20"><Ticket size={16} /></button>
                                    </div>
                                    {coupon && (
                                        <div className="flex justify-between items-center mt-2 px-1">
                                            <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider italic animate-pulse">✨ Desconto Ativo: -{coupon.discount}%</span>
                                            <button onClick={removeCoupon} className="text-red-500 text-[10px] font-bold hover:underline text-xs">REMOVER</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in-95">
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest ml-1">Seu Nome 👤</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue" size={20} />
                                    <input type="text" placeholder="Como quer ser chamado?" className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        value={customerData.name} onChange={e => setCustomerData({ ...customerData, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest ml-1">WhatsApp de Contato 📞</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue" size={20} />
                                    <input type="tel" placeholder="(00) 00000-0000" className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        value={customerData.phone} onChange={e => setCustomerData({ ...customerData, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5">
                    <div className="flex justify-between items-end mb-6">
                        <div className="flex flex-col">
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Resumo do Pedido</p>
                            {coupon && <span className="text-green-500 text-[10px] font-bold flex items-center gap-1">✨ {coupon.code} aplicado</span>}
                        </div>
                        <div className="text-right">
                            {coupon && <p className="text-xs text-gray-500 line-through mb-[-4px]">R$ {subtotal.toFixed(2)}</p>}
                            <p className="text-3xl font-black text-brand-blue">R$ {total.toFixed(2)}</p>
                        </div>
                    </div>

                    <button
                        onClick={step === 'cart' ? () => setStep('identification') : handleFinalCheckout}
                        disabled={cart.length === 0}
                        className={`w-full ${step === 'cart' ? 'bg-brand-blue shadow-brand-blue/20' : 'bg-green-500 shadow-green-500/20'} text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl`}
                    >
                        {step === 'cart' ? (
                            <>Finalizar <ArrowRight size={20} /></>
                        ) : (
                            <><MessageCircle size={24} /> Enviar Pedido</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}