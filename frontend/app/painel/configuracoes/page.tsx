"use client";
import { useState, useEffect } from "react";
import { Settings, Save, Smartphone, Instagram, MapPin, Globe, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';
import { getCompanyConfig } from "@/services/api";

export default function ConfigPage() {
    const [loading, setLoading] = useState(false);
    const [configId, setConfigId] = useState<number | null>(null);
    
    const [formData, setFormData] = useState({
        name: "",
        whatsapp: "",
        instagram: "",
        address: "",
        map_iframe: "",
        facebook_pixel_id: "",
        google_analytics_id: ""
    });

    const token = Cookies.get('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // Carregar dados ao iniciar
    useEffect(() => {
        async function loadData() {
            try {
                // Tenta pegar a config pública primeiro ou via endpoint autenticado
                const res = await fetch(`${API_URL}/company-config/`);
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const conf = data[0];
                    setConfigId(conf.id);
                    setFormData({
                        name: conf.name || "",
                        whatsapp: conf.whatsapp || "",
                        instagram: conf.instagram || "",
                        address: conf.address || "",
                        map_iframe: conf.map_iframe || "",
                        facebook_pixel_id: conf.facebook_pixel_id || "",
                        google_analytics_id: conf.google_analytics_id || ""
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar configs", error);
                toast.error("Não foi possível carregar as configurações.");
            }
        }
        loadData();
    }, [API_URL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Se não tiver ID, usa POST (criar), se tiver, usa PATCH (atualizar)
            // Geralmente só existe 1 config, então pegamos o primeiro ID
            const url = configId 
                ? `${API_URL}/company-config/${configId}/`
                : `${API_URL}/company-config/`;
            
            const method = configId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Configurações salvas com sucesso!");
                // Recarrega a página para garantir que o rodapé/cabeçalho atualizem se der F5
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error("Erro ao salvar.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10 pb-20">
            <header>
                <h1 className="text-3xl font-black text-white flex items-center gap-3 italic tracking-tighter">
                    <Settings className="text-brand-blue" /> CONFIGURAÇÕES DA LOJA
                </h1>
                <p className="text-gray-500 mt-2 text-sm uppercase font-bold tracking-widest">
                    Gerencie contatos, endereço e integrações de marketing.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* BLOCO 1: Informações Básicas */}
                <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-brand-blue" /> Informações Gerais
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nome da Empresa</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white focus:border-brand-blue outline-none transition-all"
                                placeholder="Cloud Design"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Endereço Completo</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                    className="w-full p-4 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:border-brand-blue outline-none transition-all"
                                    placeholder="Rua Exemplo, 123 - Bairro"
                                />
                            </div>
                        </div>
                        <div className="col-span-full space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Google Maps (Iframe Embed)</label>
                            <textarea 
                                value={formData.map_iframe}
                                onChange={e => setFormData({...formData, map_iframe: e.target.value})}
                                className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white focus:border-brand-blue outline-none transition-all h-24 text-xs font-mono"
                                placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>'
                            />
                        </div>
                    </div>
                </section>

                {/* BLOCO 2: Contatos */}
                <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Smartphone size={20} className="text-green-500" /> Contatos & Redes
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">WhatsApp (Com DDD)</label>
                            <div className="relative">
                                <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                                <input 
                                    type="text" 
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                                    className="w-full p-4 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:border-green-500 outline-none transition-all"
                                    placeholder="(85) 99999-9999"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Instagram (@usuario)</label>
                            <div className="relative">
                                <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" />
                                <input 
                                    type="text" 
                                    value={formData.instagram}
                                    onChange={e => setFormData({...formData, instagram: e.target.value})}
                                    className="w-full p-4 pl-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:border-pink-500 outline-none transition-all"
                                    placeholder="@sualoja"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* BLOCO 3: Marketing */}
                <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Share2 size={20} className="text-blue-500" /> Pixels & Rastreamento
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Facebook Pixel ID</label>
                            <input 
                                type="text" 
                                value={formData.facebook_pixel_id}
                                onChange={e => setFormData({...formData, facebook_pixel_id: e.target.value})}
                                className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white focus:border-blue-500 outline-none transition-all font-mono"
                                placeholder="123456789012345"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Google Analytics ID (GA4)</label>
                            <input 
                                type="text" 
                                value={formData.google_analytics_id}
                                onChange={e => setFormData({...formData, google_analytics_id: e.target.value})}
                                className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white focus:border-orange-500 outline-none transition-all font-mono"
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>
                    </div>
                </section>

                {/* BOTÃO SALVAR */}
                <div className="fixed bottom-6 right-6 md:static md:flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-blue hover:bg-brand-blue/90 text-white py-4 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-brand-blue/30 flex items-center gap-3 transition-all active:scale-95"
                    >
                        {loading ? "SALVANDO..." : <><Save size={24} /> SALVAR ALTERAÇÕES</>}
                    </button>
                </div>

            </form>
        </div>
    );
}