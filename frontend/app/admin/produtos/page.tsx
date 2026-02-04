"use client";
import { useState, useEffect, useCallback } from "react";
import { PackagePlus, Upload, Trash2, PlusCircle, LayoutList, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';

export default function ProductAdmin() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        description: "",
        production_time: "",
        category: "",
        image: null
    });
    const [variants, setVariants] = useState([{ name: "", price: "" }]);

    const API_URL = "http://127.0.0.1:8000/api";
    const token = Cookies.get('auth_token');

    const fetchData = useCallback(async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                fetch(`${API_URL}/categories/`),
                fetch(`${API_URL}/products/`)
            ]);
            setCategories(await catRes.json());
            setProducts(await prodRes.json());
        } catch (error) {
            toast.error("Erro ao carregar dados");
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("category", formData.category);
        data.append("production_time", formData.production_time);

        // SÓ ADICIONA A IMAGEM SE FOR UM ARQUIVO NOVO
        // Se for string (URL existente) ou null, o PATCH manterá a imagem atual no banco
        if (formData.image instanceof File) {
            data.append("image", formData.image);
        }

        data.append("variants_json", JSON.stringify(variants));

        // MUDANÇA: Usamos PATCH para atualização parcial
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

    const resetForm = () => {
        setFormData({ id: null, name: "", description: "", production_time: "", category: "", image: null });
        setVariants([{ name: "", price: "" }]);
    };

    return (
        <div className="p-10 max-w-6xl mx-auto space-y-12">
            <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-black mb-10 dark:text-white flex items-center gap-3">
                    <PackagePlus className="text-blue-500" /> {formData.id ? "Editar" : "Novo"} Produto
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <input type="text" placeholder="Nome do Produto" value={formData.name} className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white"
                            onChange={e => setFormData({ ...formData, name: e.target.value })} required />

                        <textarea placeholder="Descrição detalhada" value={formData.description} className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white h-32"
                            onChange={e => setFormData({ ...formData, description: e.target.value })} required />

                        <select className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white" value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                            <option value="">Selecionar Categoria</option>
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <input type="text" placeholder="Tempo de Produção" value={formData.production_time} className="w-full p-4 rounded-2xl bg-black/20 border border-white/10 text-white"
                            onChange={e => setFormData({ ...formData, production_time: e.target.value })} required />

                        <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl text-center">
                            <input type="file" id="img" className="hidden" onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                            <label htmlFor="img" className="cursor-pointer flex flex-col items-center gap-2 text-gray-400">
                                <Upload /> {formData.image ? "Foto selecionada" : "Alterar Foto (Opcional)"}
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-bold text-white flex items-center gap-2"><PlusCircle size={18} /> Variantes</h2>
                        {variants.map((v, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="text" placeholder="Ex: 500un" value={v.name} className="flex-1 p-3 rounded-xl bg-black/20 border border-white/10 text-white"
                                    onChange={e => {
                                        const newV = [...variants];
                                        newV[i].name = e.target.value;
                                        setVariants(newV);
                                    }} required />
                                <input type="number" placeholder="R$" value={v.price} className="w-24 p-3 rounded-xl bg-black/20 border border-white/10 text-white"
                                    onChange={e => {
                                        const newV = [...variants];
                                        newV[i].price = e.target.value;
                                        setVariants(newV);
                                    }} required />
                                {variants.length > 1 && (
                                    <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={20} /></button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => setVariants([...variants, { name: "", price: "" }])}
                            className="text-blue-400 font-bold text-sm">+ Adicionar Opção</button>

                        <div className="pt-10 flex gap-4">
                            <button type="submit" disabled={loading} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black transition-all">
                                {loading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                            </button>
                            {formData.id && (
                                <button type="button" onClick={resetForm} className="bg-white/10 text-white px-6 rounded-2xl font-bold hover:bg-white/20">Cancelar</button>
                            )}
                        </div>
                    </div>
                </form>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <LayoutList /> Produtos no Catálogo
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    {products.map((p: any) => (
                        <div key={p.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                                <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl shadow-lg" />
                                <div>
                                    <h3 className="text-white font-bold text-lg">{p.name}</h3>
                                    <p className="text-gray-400 text-sm italic">{p.category_name} • {p.production_time}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    setFormData({ ...p, image: null });
                                    setVariants(p.variants);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} className="p-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                                    <Pencil size={20} />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}