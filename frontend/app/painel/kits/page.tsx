"use client";
import { useState, useEffect, useCallback } from "react";
import { Gift, Upload, Trash2, LayoutList, Pencil, CheckSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';
import { getImageUrl } from "@/services/api";

export default function KitsAdmin() {
    const [kits, setKits] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        description: "",
        price: "",
        image: null as File | null,
        is_active: true
    });

    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const token = Cookies.get('auth_token');

    const fetchData = useCallback(async () => {
        try {
            const [kitsRes, prodRes] = await Promise.all([
                fetch(`${API_URL}/kits/`),
                fetch(`${API_URL}/products/`)
            ]);
            setKits(await kitsRes.json());
            setProducts(await prodRes.json());
        } catch (error) {
            toast.error("Erro ao carregar dados");
        }
    }, [API_URL]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleProduct = (id: number) => {
        setSelectedProducts(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProducts.length === 0) return toast.error("Selecione pelo menos um produto pro Kit!");

        setLoading(true);
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("is_active", formData.is_active ? "true" : "false");

        if (formData.image instanceof File) {
            data.append("image", formData.image);
        }

        data.append("products_json", JSON.stringify(selectedProducts));

        const url = formData.id ? `${API_URL}/kits/${formData.id}/` : `${API_URL}/kits/`;
        const method = formData.id ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Authorization": `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                toast.success(formData.id ? "Kit atualizado!" : "Kit criado!");
                resetForm();
                fetchData();
            } else {
                toast.error("Erro ao salvar.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este Kit?")) return;
        try {
            await fetch(`${API_URL}/kits/${id}/`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            toast.success("Kit excluído!");
            fetchData();
        } catch (error) { toast.error("Erro ao excluir."); }
    };

    const handleEdit = (k: any) => {
        setFormData({ ...k, image: null });
        setSelectedProducts(k.products || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ id: null, name: "", description: "", price: "", image: null, is_active: true });
        setSelectedProducts([]);
    };

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
            <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-black mb-10 text-white flex items-center gap-3 italic tracking-tighter">
                    <Gift className="text-brand-blue" /> {formData.id ? "EDITAR" : "MONTAR NOVO"} KIT
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <input type="text" placeholder="Nome do Combo (Ex: Kit Empreendedor)" value={formData.name} className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white outline-none focus:border-brand-blue transition-all" onChange={e => setFormData({ ...formData, name: e.target.value })} required />

                        <textarea placeholder="Descreva o que vem no kit..." value={formData.description} className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white h-24 outline-none focus:border-brand-blue transition-all" onChange={e => setFormData({ ...formData, description: e.target.value })} required />

                        <input type="number" placeholder="Preço Fixo do Kit (R$)" value={formData.price} step="0.01" className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white outline-none focus:border-brand-blue transition-all font-bold text-lg text-brand-blue" onChange={e => setFormData({ ...formData, price: e.target.value })} required />

                        <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl text-center hover:bg-white/5 transition-all">
                            <input type="file" id="img" className="hidden" onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                            <label htmlFor="img" className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 font-bold">
                                <Upload /> {formData.image ? "Foto selecionada" : "Fazer Upload da Foto do Combo"}
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-black/20 border border-white/10 h-full flex flex-col">
                            <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                                <CheckSquare size={16} /> Selecione os Produtos do Kit
                            </h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 max-h-[250px]">
                                {products.map((p: any) => (
                                    <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedProducts.includes(p.id) ? "bg-brand-blue/10 border-brand-blue" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                                        <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} className="w-4 h-4 accent-brand-blue" />
                                        <span className="text-sm font-bold text-white">{p.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full pt-6 flex gap-4">
                        <button type="submit" disabled={loading} className="flex-grow bg-brand-blue hover:bg-brand-blue/90 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 active:scale-95 transition-all">
                            {loading ? "SALVANDO..." : "SALVAR COMBO"}
                        </button>
                        {formData.id && (
                            <button type="button" onClick={resetForm} className="bg-white/10 text-white px-6 rounded-2xl font-bold hover:bg-white/20">Cancelar</button>
                        )}
                    </div>
                </form>
            </section>

            <section>
                <h2 className="text-xl font-black mb-6 text-white flex items-center gap-2 uppercase tracking-widest">
                    <LayoutList /> Combos Ativos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kits.map((k: any) => (
                        <div key={k.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between group hover:border-brand-blue/30 transition-all">
                            <div className="flex items-center gap-4">
                                <img src={getImageUrl(k.image)} alt={k.name} className="w-20 h-20 object-cover rounded-2xl shadow-lg" onError={(e) => { e.currentTarget.src = "/logo-oficial.png"; }} />
                                <div>
                                    <h3 className="text-white font-bold text-lg">{k.name}</h3>
                                    <p className="text-brand-blue font-black">R$ {Number(k.price).toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-500 uppercase mt-1">Contém {k.products?.length} itens</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(k)} className="p-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white"><Pencil size={18} /></button>
                                <button onClick={() => handleDelete(k.id)} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}