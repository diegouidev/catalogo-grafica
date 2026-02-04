"use client";
import { useState, useEffect, useCallback } from "react";
import { Image as ImageIcon, Upload, Trash2, Plus, Layout, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';

export default function BannerAdmin() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        order: 0,
        image: null as File | null
    });

    const API_URL = "http://127.0.0.1:8000/api/banners/";
    const token = Cookies.get('auth_token');

    const loadBanners = useCallback(async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setBanners(data);
        } catch (error) {
            toast.error("Erro ao carregar banners");
        }
    }, []);

    useEffect(() => { loadBanners(); }, [loadBanners]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) return toast.error("Selecione uma imagem!");

        setLoading(true);
        const data = new FormData();
        data.append("title", formData.title);
        data.append("subtitle", formData.subtitle);
        data.append("order", String(formData.order));
        data.append("image", formData.image);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                toast.success("Banner adicionado!");
                setFormData({ title: "", subtitle: "", order: 0, image: null });
                setImagePreview(null);
                loadBanners();
            }
        } catch (error) {
            toast.error("Erro ao salvar banner");
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
        <div className="p-10 max-w-6xl mx-auto space-y-12">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <ImageIcon className="text-blue-500" /> Banners da Home
                </h1>
            </header>

            {/* FORMULÁRIO DE CADASTRO */}
            <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div
                            className="relative group h-64 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center overflow-hidden bg-black/20"
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImagePreview(null)}
                                        className="absolute top-4 right-4 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
                                    <Upload size={40} />
                                    <span className="font-bold">Upload do Banner</span>
                                    <span className="text-xs">Recomendado: 1200x400px</span>
                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between">
                        <div className="space-y-4">
                            <input
                                type="text" placeholder="Título (opcional)"
                                className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white"
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Subtítulo (opcional)"
                                className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white"
                                value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            />
                            <div className="flex items-center gap-4">
                                <label className="text-gray-400 font-bold">Ordem:</label>
                                <input
                                    type="number"
                                    className="w-24 p-4 rounded-2xl bg-black/20 border border-white/10 text-white"
                                    value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? "ADICIONANDO..." : <><Plus /> SALVAR BANNER</>}
                        </button>
                    </div>
                </form>
            </section>

            {/* LISTAGEM */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((b: any) => (
                    <div key={b.id} className="relative group rounded-[2rem] overflow-hidden border border-white/10">
                        <img src={b.image} className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-4 p-4 text-center">
                            <p className="text-white font-bold">{b.title || "Sem título"}</p>
                            <button
                                onClick={() => handleDelete(b.id)}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl flex items-center gap-2 transition-all"
                            >
                                <Trash2 size={18} /> Excluir Banner
                            </button>
                        </div>
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Ordem: {b.order}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}