"use client";
import { useState } from "react";
import { Search, Package, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCompanyConfig } from "@/services/api";

// ⚠️ IMPORTANTE: Substitua pela URL real do seu DPRINT quando subir para produção
// Exemplo: "https://painel.suagrafica.com.br/api/rastreio"
const DPRINT_API_URL = "http://localhost:8001/api/rastreio";

export default function RastreioPage() {
    const [orderId, setOrderId] = useState("");
    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [companyConfig, setCompanyConfig] = useState(null);

    // Busca configs da empresa para o rodapé
    useState(() => {
        getCompanyConfig().then(data => {
            const config = Array.isArray(data) ? data[0] : data;
            setCompanyConfig(config);
        });
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) return;

        setLoading(true);
        setError("");
        setOrderData(null);

        try {
            // Faz a busca no seu DPRINT
            const res = await fetch(`${DPRINT_API_URL}/${orderId}/`);

            if (res.status === 404) {
                throw new Error("Pedido não encontrado. Verifique o número digitado.");
            }

            if (!res.ok) {
                throw new Error("Erro ao buscar pedido. Tente novamente mais tarde.");
            }

            const data = await res.json();
            setOrderData(data);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#05060a] flex flex-col">
            <Header />

            <div className="flex-grow flex flex-col items-center justify-center p-4 py-20">
                <div className="max-w-lg w-full bg-[#0f111a] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">

                    {/* Decoração de Fundo */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue to-purple-600"></div>

                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-brand-blue/30">
                            <Package size={40} className="text-brand-blue" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                            Rastrear Pedido
                        </h1>
                        <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                            Digite o número do seu pedido abaixo para acompanhar o status de produção em tempo real.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="relative mb-8 group">
                        <input
                            type="text"
                            placeholder="Digite o nº do pedido (Ex: 1050)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-black/50 border border-white/10 group-hover:border-brand-blue/50 rounded-2xl py-5 pl-6 pr-14 text-white text-lg font-bold placeholder:text-gray-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading || !orderId}
                            className="absolute right-3 top-3 bottom-3 bg-brand-blue hover:bg-white hover:text-brand-blue text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Search size={24} />
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {orderData && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white/5 rounded-2xl p-6 border border-white/5">

                            {/* Cabeçalho do Resultado */}
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                                <div>
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Pedido</span>
                                    <h3 className="text-white font-black text-3xl tracking-tighter">#{orderData.id}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Cliente</span>
                                    <p className="text-gray-300 text-sm font-medium truncate max-w-[150px]">{orderData.cliente_nome}</p>
                                </div>
                            </div>

                            {/* Status Visual Dinâmico */}
                            <div
                                className="border rounded-2xl p-5 flex items-center gap-5 transition-all shadow-lg relative overflow-hidden"
                                style={{
                                    borderColor: orderData.status_cor || '#3b82f6',
                                    backgroundColor: `${orderData.status_cor || '#3b82f6'}15` // 15% opacidade
                                }}
                            >
                                {/* Ícone do Status */}
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg shrink-0"
                                    style={{ backgroundColor: orderData.status_cor || '#3b82f6' }}
                                >
                                    {orderData.status_ordem && orderData.status_ordem > 0 ? (
                                        <span className="text-xl">{orderData.status_ordem}</span>
                                    ) : (
                                        <Package size={24} />
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">
                                        Status Atual
                                    </span>
                                    <h4
                                        className="font-black text-2xl uppercase tracking-tight leading-none mb-1"
                                        style={{ color: orderData.status_cor || '#ffffff' }}
                                    >
                                        {orderData.status_nome || orderData.status_producao}
                                    </h4>

                                    {orderData.previsao_entrega && (
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 bg-black/20 w-fit px-2 py-1 rounded-md">
                                            <Clock size={12} />
                                            <span>Previsão: {new Date(orderData.previsao_entrega).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Barra de Progresso (Opcional - só aparece se o backend mandar 'status_ordem') */}
                            {orderData.status_ordem && (
                                <div className="mt-6">
                                    <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                            style={{
                                                width: `${Math.min(orderData.status_ordem * 20, 100)}%`, // Lógica simples: Etapa * 20%
                                                backgroundColor: orderData.status_cor || '#3b82f6'
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-center text-[10px] text-gray-500 mt-3 uppercase tracking-widest font-bold">
                                        Acompanhe o progresso em tempo real
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer config={companyConfig} />
        </main>
    );
}