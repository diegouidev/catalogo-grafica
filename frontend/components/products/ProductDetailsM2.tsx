"use client";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { registerView, getImageUrl, getCompanyConfig, PIX_MULTIPLIER, PIX_DISCOUNT_PERCENT } from "@/services/api";
import { ShoppingCart, ShieldCheck, Clock, Truck, MessageCircle, Info, Maximize } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductDetailsM2({ product }: { product: any }) {
    const { addToCart } = useCart();

    // Pega o valor base (da variação única que você cadastrou)
    const baseVariant = product.variants && product.variants.length > 0
        ? product.variants[0]
        : { id: 0, name: "M² Base", price: 0 };

    const basePricePerM2 = Number(baseVariant.price);

    // Estados da Calculadora
    const [width, setWidth] = useState<number | string>("");
    const [height, setHeight] = useState<number | string>("");
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState("");

    const mainButtonRef = useRef<HTMLDivElement>(null);

    // Efeitos padrão (View e WhatsApp)
    useEffect(() => {
        if (product?.id) registerView(product.id);
        getCompanyConfig().then(response => {
            const configList = response?.results || response;
            const configItem = Array.isArray(configList) ? configList[0] : configList;

            if (configItem && configItem.whatsapp) {
                setWhatsappNumber(configItem.whatsapp.replace(/\D/g, ""));
            }
        }).catch(err => console.error("Erro ao buscar config:", err));
    }, [product]);

    // Sticky Bar
    useEffect(() => {
        const handleScroll = () => {
            if (mainButtonRef.current) {
                const buttonPosition = mainButtonRef.current.getBoundingClientRect().bottom;
                setShowStickyBar(buttonPosition < 0);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- LÓGICA DA CALCULADORA MATEMÁTICA ---
    const numWidth = Number(width) || 0;
    const numHeight = Number(height) || 0;

    const realArea = numWidth * numHeight; // Área Exata
    const isBelowMinimum = realArea > 0 && realArea < 0.5; // Regra do Meio Metro
    const chargedArea = isBelowMinimum ? 0.5 : realArea; // Área Cobrada

    const currentPrice = chargedArea * basePricePerM2; // Preço Final

    // --- AÇÕES ---
    const handleAddToCart = () => {
        if (numWidth <= 0 || numHeight <= 0) {
            toast.error("Por favor, informe a largura e a altura do material.", { icon: '📐' });
            return;
        }

        // Criamos uma "Variação Virtual" para o carrinho entender as medidas e o novo preço
        const virtualVariant = {
            id: baseVariant.id,
            name: `${numWidth.toFixed(2)}m x ${numHeight.toFixed(2)}m`, // Aparece no carrinho e pedido
            price: currentPrice, // Preço total já calculado
            is_custom_measure: true,
            width: numWidth,
            height: numHeight
        };

        addToCart(product, virtualVariant);
        toast.success("Produto sob medida adicionado!", {
            style: { background: '#00AEEF', color: '#fff', fontWeight: 'bold' },
            icon: '🛒'
        });
    };

    const handleWhatsAppQuestion = () => {
        if (!whatsappNumber) return toast.error("WhatsApp indisponível.");
        const msg = `Olá! Estou vendo o produto *${product.name}* e queria tirar uma dúvida sobre as medidas.`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (!product) return <div className="text-white text-center p-10">Carregando...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* COLUNA 1: IMAGEM */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 aspect-square lg:aspect-auto lg:h-[600px] group">
                <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.src = "/logo-oficial.png"; }}
                />
            </div>

            {/* COLUNA 2: DETALHES E CALCULADORA */}
            <div className="flex flex-col justify-center space-y-8">
                <div>
                    <span className="text-brand-blue font-bold text-xs uppercase tracking-[0.2em] mb-2 block">
                        {product.category_name} • M²
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                        {product.name}
                    </h1>
                </div>

                <div className="prose prose-invert text-gray-400 text-sm leading-relaxed border-l-2 border-brand-blue/30 pl-4">
                    <p>{product.description || "Produto vendido sob medida."}</p>
                </div>

                {/* --- PAINEL DA CALCULADORA --- */}
                <div className="bg-brand-blue/5 p-6 rounded-3xl border border-brand-blue/20 space-y-6 relative overflow-hidden">
                    {/* Efeito de Fundo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Maximize size={18} className="text-brand-blue" /> Digite as Medidas (em Metros):
                        </label>
                        <span className="text-xs text-brand-blue font-bold bg-brand-blue/10 px-2 py-1 rounded-md">
                            R$ {basePricePerM2.toFixed(2)} / m²
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Input LARGURA */}
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">L:</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-10 pr-10 text-white font-bold text-lg focus:border-brand-blue focus:outline-none transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">m</span>
                        </div>

                        {/* Input ALTURA */}
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">A:</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-10 pr-10 text-white font-bold text-lg focus:border-brand-blue focus:outline-none transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">m</span>
                        </div>
                    </div>

                    {/* ALERTA: REGRA DO MEIO METRO */}
                    {isBelowMinimum && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <Info size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-yellow-500 text-xs font-bold uppercase tracking-wide">Atenção à Área Mínima</p>
                                <p className="text-yellow-500/80 text-[11px] mt-0.5">
                                    Sua medida tem <b>{realArea.toFixed(2)}m²</b>. A cobrança mínima para setup de máquina neste produto é de <b>0.50m²</b>.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botão de Compra e Resumo */}
                <div className="flex flex-col gap-4 pt-4 border-t border-white/10" ref={mainButtonRef}>
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Área Cobrada</span>
                            <span className="text-gray-300 text-sm font-bold">{chargedArea.toFixed(2)} m²</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Estimado</span>
                            <span className="text-4xl font-black text-white tracking-tighter">
                                R$ {currentPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-green-400 font-bold tracking-wide">
                                ou R$ {(currentPrice * PIX_MULTIPLIER).toFixed(2)} no PIX ({PIX_DISCOUNT_PERCENT}% OFF)
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-brand-blue/20"
                    >
                        <ShoppingCart size={24} /> ADICIONAR AO PEDIDO
                    </button>

                    <button onClick={handleWhatsAppQuestion} className="w-full bg-white/5 hover:bg-white/10 text-green-400 border border-green-500/30 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                        <MessageCircle size={16} /> Dúvida com as medidas? Fale conosco
                    </button>
                </div>
            </div>

            {/* BARRA FIXA MOBILE */}
            <div className={`fixed bottom-0 left-0 w-full bg-[#0a0b14]/95 backdrop-blur-lg border-t border-brand-blue/30 p-4 z-50 flex items-center justify-between lg:hidden transition-transform duration-500 ${showStickyBar ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{chargedArea.toFixed(2)} m²</span>
                    <span className="text-xl font-black text-white">R$ {currentPrice.toFixed(2)}</span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="bg-brand-blue text-white px-6 py-3 rounded-xl font-black text-sm uppercase flex items-center gap-2 shadow-lg shadow-brand-blue/20 active:scale-95"
                >
                    <ShoppingCart size={18} /> Adicionar
                </button>
            </div>
        </div>
    );
}