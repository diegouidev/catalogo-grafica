"use client";
import { useState, useEffect, useCallback } from "react";
import { Image as ImageIcon, Upload, Trash2, Plus, X, Smartphone, Monitor } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';
import { getImageUrl } from "@/services/api"; // <--- Importação Essencial

export default function BannerAdmin() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Previews
    const [previewDesktop, setPreviewDesktop] = useState<string | null>(null);
    const [previewMobile, setPreviewMobile] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        order: 0,
        image: null as File | null,
        image_mobile: null as File | null // <--- Novo campo
    });

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/banners/`;
    const token = Cookies.get('auth_token');

    const loadBanners = useCallback(async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setBanners(data);
        } catch (error) {
            toast.error("Erro ao carregar banners");
        }
    }, [API_URL]);

    useEffect(() => { loadBanners(); }, [loadBanners]);

    // Handler para Imagem Desktop
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewDesktop(URL.createObjectURL(file));
        }
    };

    // Handler para Imagem Mobile
    const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image_mobile: file }));
            setPreviewMobile(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) return toast.error("A imagem Desktop é obrigatória!");

        setLoading(true);
        const data = new FormData();
        data.append("title", formData.title);
        data.append("subtitle", formData.subtitle);
        data.append("order", String(formData.order));
        
        // Append Desktop
        if (formData.image) data.append("image", formData.image);
        
        // Append Mobile (se existir)
        if (formData.image_mobile) data.append("image_mobile", formData.image_mobile);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                toast.success("Banner adicionado com sucesso!");
                // Reset form
                setFormData({ title: "", subtitle: "", order: 0, image: null, image_mobile: null });
                setPreviewDesktop(null);
                setPreviewMobile(null);
                loadBanners();
            } else {
                toast.error("Erro ao salvar. Verifique os campos.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Remover este banner?")) return;
        try {
            await fetch(`${API_URL}${id}/`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success("Banner removido");
            loadBanners();
        } catch (error) {
            toast.error("Erro ao remover");
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-12 pb-24">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white flex items-center gap-3 italic tracking-tighter">
                    <ImageIcon className="text-brand-blue" /> Banners da Home
                </h1>
            </header>

            {/* FORMULÁRIO DE CADASTRO */}
            <section className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* COLUNA DE UPLOAD */}
                    <div className="space-y-6">
                        
                        {/* 1. UPLOAD DESKTOP */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-2 flex items-center gap-2">
                                <Monitor size={14} /> Versão Desktop (Horizontal)
                            </label>
                            <div className="relative group h-40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center overflow-hidden bg-black/20 hover:border-brand-blue/50 transition-colors">
                                {previewDesktop ? (
                                    <>
                                        <img src={previewDesktop} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setPreviewDesktop(null); setFormData(prev => ({...prev, image: null})) }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white shadow-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-white transition-colors w-full h-full justify-center">
                                        <Upload size={24} />
                                        <span className="text-xs font-bold">1920 x 450px</span>
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* 2. UPLOAD MOBILE */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-2 flex items-center gap-2">
                                <Smartphone size={14} /> Versão Mobile (Vertical)
                            </label>
                            <div className="relative group h-48 w-40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center overflow-hidden bg-black/20 hover:border-brand-blue/50 transition-colors mx-auto lg:mx-0">
                                {previewMobile ? (
                                    <>
                                        <img src={previewMobile} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setPreviewMobile(null); setFormData(prev => ({...prev, image_mobile: null})) }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white shadow-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-white transition-colors w-full h-full justify-center">
                                        <Upload size={24} />
                                        <span className="text-xs font-bold text-center px-2">800 x 1000px</span>
                                        <input type="file" className="hidden" onChange={handleMobileImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* COLUNA DE TEXTO */}
                    <div className="flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Título Principal</label>
                                <input
                                    type="text" 
                                    placeholder="Ex: Ofertas de Verão"
                                    className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white outline-none focus:border-brand-blue transition-all"
                                    value={formData.title} 
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Subtítulo</label>
                                <input
                                    type="text" 
                                    placeholder="Ex: Confira nossos descontos"
                                    className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white outline-none focus:border-brand-blue transition-all"
                                    value={formData.subtitle} 
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-gray-400 font-bold text-sm">Ordem de Exibição:</label>
                                <input
                                    type="number"
                                    className="w-24 p-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:border-brand-blue text-center font-bold"
                                    value={formData.order} 
                                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="mt-8 w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 active:scale-95"
                        >
                            {loading ? "SALVANDO..." : <><Plus /> ADICIONAR BANNER</>}
                        </button>
                    </div>
                </form>
            </section>

            {/* LISTAGEM */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Banners Ativos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map((b: any) => (
                        <div key={b.id} className="relative group rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f111a]">
                            {/* Correção da Imagem: Usando getImageUrl */}
                            <img 
                                src={getImageUrl(b.image)} 
                                className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                alt={b.title}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/logo-oficial.png";
                                }}
                            />
                            
                            <div className="absolute top-4 left-4 bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                                #{b.order}
                            </div>

                            {/* Badge se tiver mobile */}
                            {b.image_mobile && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg z-10 flex items-center gap-1">
                                    <Smartphone size={10} /> Mobile OK
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-center items-center gap-4 p-4 text-center backdrop-blur-sm">
                                <div>
                                    <p className="text-white font-bold text-lg">{b.title || "Sem título"}</p>
                                    <p className="text-gray-400 text-sm">{b.subtitle}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(b.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg"
                                >
                                    <Trash2 size={18} /> Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {banners.length === 0 && (
                    <p className="text-gray-500 text-center py-10">Nenhum banner cadastrado.</p>
                )}
            </section>
        </div>
    );
}