"use client";
import { useState, useEffect, useCallback } from "react";
import { PackagePlus, Upload, Trash2, PlusCircle, LayoutList, Pencil, Layers, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';
import { getImageUrl } from "@/services/api";

export default function ProductAdmin() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [finishingsList, setFinishingsList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        description: "",
        production_time: "",
        category: "",
        image: null as File | null,
        is_featured: false
    });

    const [variants, setVariants] = useState([{ name: "", price: "" }]);
    const [selectedFinishings, setSelectedFinishings] = useState<number[]>([]); 
    const [selectedUpsells, setSelectedUpsells] = useState<number[]>([]); // <--- NOVO: Controle do Upsell

    const API_URL = process.env.NEXT_PUBLIC_API_URL; 
    const token = Cookies.get('auth_token');

    const fetchData = useCallback(async () => {
        try {
            const [catRes, prodRes, finishRes] = await Promise.all([
                fetch(`${API_URL}/categories/`),
                fetch(`${API_URL}/products/`),
                fetch(`${API_URL}/finishings/`)
            ]);
            setCategories(await catRes.json());
            setProducts(await prodRes.json());
            setFinishingsList(await finishRes.json());
        } catch (error) {
            toast.error("Erro ao carregar dados");
        }
    }, [API_URL]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleFinishing = (id: number) => {
        setSelectedFinishings(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleUpsell = (id: number) => {
        setSelectedUpsells(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("category", formData.category);
        data.append("production_time", formData.production_time);
        data.append("is_featured", formData.is_featured ? "true" : "false");

        if (formData.image instanceof File) {
            data.append("image", formData.image);
        }

        data.append("variants_json", JSON.stringify(variants));
        data.append("finishings_json", JSON.stringify(selectedFinishings)); 
        data.append("upsells_json", JSON.stringify(selectedUpsells)); // <--- NOVO: Envia os IDs do upsell

        const url = formData.id ? `${API_URL}/products/${formData.id}/` : `${API_URL}/products/`;
        const method = formData.id ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Authorization": `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                toast.success(formData.id ? "Produto atualizado!" : "Produto criado!");
                resetForm();
                fetchData();
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
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            const res = await fetch(`${API_URL}/products/${id}/`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Excluído com sucesso!");
                fetchData();
            }
        } catch (error) {
            toast.error("Erro ao excluir.");
        }
    };

    const handleEdit = (p: any) => {
        setFormData({ ...p, image: null, category: p.category });
        setVariants(p.variants);
        setSelectedFinishings(p.finishings ? p.finishings.map((f: any) => f.id) : []);
        setSelectedUpsells(p.upsell_products ? p.upsell_products.map((u: any) => u.id) : []); // <--- NOVO: Carrega upsells ao editar
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ id: null, name: "", description: "", production_time: "", category: "", image: null, is_featured: false });
        setVariants([{ name: "", price: "" }]);
        setSelectedFinishings([]);
        setSelectedUpsells([]); // <--- NOVO: Limpa no reset
    };

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-12">
            <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-black mb-10 text-white flex items-center gap-3 italic tracking-tighter">
                    <PackagePlus className="text-brand-blue" /> {formData.id ? "EDITAR" : "NOVO"} PRODUTO
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <input type="text" placeholder="Nome do Produto" value={formData.name} className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white outline-none focus:border-brand-blue transition-all"
                            onChange={e => setFormData({ ...formData, name: e.target.value })} required />

                        <textarea placeholder="Descrição detalhada" value={formData.description} className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white h-32 outline-none focus:border-brand-blue transition-all"
                            onChange={e => setFormData({ ...formData, description: e.target.value })} required />

                        <div className="flex gap-4">
                            <select className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white outline-none" value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                                <option value="">Categoria</option>
                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            <input type="text" placeholder="Tempo (Ex: 2 dias)" value={formData.production_time} className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white outline-none"
                                onChange={e => setFormData({ ...formData, production_time: e.target.value })} required />
                        </div>

                        {/* ACABAMENTOS */}
                        <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                            <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                <Layers size={14} /> Acabamentos Disponíveis
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {finishingsList.length === 0 && <p className="text-gray-600 text-xs">Nenhum acabamento cadastrado.</p>}
                                {finishingsList.map((finish: any) => (
                                    <button key={finish.id} type="button" onClick={() => toggleFinishing(finish.id)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${selectedFinishings.includes(finish.id) ? "bg-brand-blue border-brand-blue text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
                                    >
                                        {finish.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* UPSELL (COMPRE JUNTO) */}
                        <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                            <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                <PackagePlus size={14} /> Sugerir no "Compre Junto"
                            </h3>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {products.filter((p: any) => p.id !== formData.id).map((prod: any) => (
                                    <button key={prod.id} type="button" onClick={() => toggleUpsell(prod.id)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${selectedUpsells.includes(prod.id) ? "bg-green-500 border-green-500 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
                                    >
                                        {prod.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 border border-white/10 cursor-pointer hover:bg-white/5 transition-all">
                            <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5 accent-brand-blue" />
                            <span className="text-white font-bold flex items-center gap-2"><Star size={18} className={formData.is_featured ? "text-yellow-400 fill-yellow-400" : "text-gray-500"} /> Marcar como Destaque</span>
                        </label>

                        <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl text-center hover:bg-white/5 transition-all">
                            <input type="file" id="img" className="hidden" onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                            <label htmlFor="img" className="cursor-pointer flex flex-col items-center gap-2 text-gray-400">
                                <Upload /> {formData.image ? "Foto selecionada" : "Alterar Foto"}
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest"><PlusCircle size={18} /> Tabela de Preços</h2>
                        {variants.map((v, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="text" placeholder="Variação (Ex: 1000un)" value={v.name} className="flex-1 p-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none" onChange={e => { const newV = [...variants]; newV[i].name = e.target.value; setVariants(newV); }} required />
                                <input type="number" placeholder="Preço (R$)" value={v.price} className="w-28 p-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none" onChange={e => { const newV = [...variants]; newV[i].price = e.target.value; setVariants(newV); }} required />
                                {variants.length > 1 && (
                                    <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={20} /></button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => setVariants([...variants, { name: "", price: "" }])} className="text-brand-blue font-bold text-xs uppercase tracking-widest hover:underline">+ Adicionar Linha</button>

                        <div className="pt-10 flex gap-4">
                            <button type="submit" disabled={loading} className="flex-grow bg-brand-blue hover:bg-brand-blue/90 text-white py-5 rounded-2xl font-black transition-all shadow-lg shadow-brand-blue/20 active:scale-95">
                                {loading ? "SALVANDO..." : "SALVAR PRODUTO"}
                            </button>
                            {formData.id && (
                                <button type="button" onClick={resetForm} className="bg-white/10 text-white px-6 rounded-2xl font-bold hover:bg-white/20">Cancelar</button>
                            )}
                        </div>
                    </div>
                </form>
            </section>

            <section>
                <h2 className="text-xl font-black mb-6 text-white flex items-center gap-2 uppercase tracking-widest">
                    <LayoutList /> Catálogo Atual
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    {products.map((p: any) => (
                        <div key={p.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                                <img 
                                    src={getImageUrl(p.image)} 
                                    alt={p.name} 
                                    className="w-16 h-16 object-cover rounded-xl shadow-lg" 
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/logo-oficial.png"; }}
                                />
                                <div>
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                        {p.name}
                                        {p.is_featured && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                                    </h3>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">{p.category_name} • {p.production_time}</p>
                                    <div className="flex gap-1 mt-1">
                                        {p.finishings && p.finishings.map((f: any) => (
                                            <span key={f.id} className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{f.name}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(p)} className="p-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Pencil size={20} /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}