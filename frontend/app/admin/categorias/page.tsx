"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Tag, Pencil, X, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';

export default function CategoryAdmin() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estado para criação/edição
    const [editingId, setEditingId] = useState<number | null>(null);
    const [categoryName, setCategoryName] = useState("");

    const API_URL = "http://127.0.0.1:8000/api/categories/";
    const token = Cookies.get('auth_token'); // Busca o token correto definido no seu layout.tsx

    // 1. LISTAR CATEGORIAS (READ)
    const loadCategories = useCallback(async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            toast.error("Erro ao carregar categorias");
        }
    }, []);

    useEffect(() => { loadCategories(); }, [loadCategories]);

    // 2. CRIAR OU ATUALIZAR (CREATE / UPDATE)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        setLoading(true);
        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `${API_URL}${editingId}/` : API_URL;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: categoryName })
            });

            if (res.ok) {
                toast.success(editingId ? "Categoria atualizada!" : "Categoria criada!");
                setCategoryName("");
                setEditingId(null);
                loadCategories();
            } else {
                const errorData = await res.json();
                toast.error(errorData.name || "Erro na operação");
            }
        } catch (error) {
            toast.error("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    // 3. EXCLUIR (DELETE)
    const handleDelete = async (id: number) => {
        if (!confirm("Excluir esta categoria também pode afetar os produtos vinculados. Continuar?")) return;

        try {
            const res = await fetch(`${API_URL}${id}/`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Categoria removida!");
                loadCategories();
            } else {
                toast.error("Erro ao excluir. Verifique se há produtos nela.");
            }
        } catch (error) {
            toast.error("Erro ao processar exclusão.");
        }
    };

    const startEdit = (cat: any) => {
        setEditingId(cat.id);
        setCategoryName(cat.name);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setCategoryName("");
    };

    return (
        <div className="p-10 max-w-4xl mx-auto space-y-10">
            <header>
                <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
                    <Tag className="text-blue-500" /> Gerenciar Categorias
                </h1>
                <p className="text-gray-500 mt-2">Adicione ou edite os segmentos do seu catálogo.</p>
            </header>

            {/* FORMULÁRIO DE CADASTRO/EDIÇÃO */}
            <section className="bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-xl">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Ex: Cartões de Visita, Banners, Adesivos..."
                            className="w-full p-4 pl-5 rounded-2xl bg-black/20 border border-white/10 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all min-w-[140px]`}
                        >
                            {loading ? "..." : editingId ? <><Save size={20} /> Salvar</> : <><Plus size={20} /> Adicionar</>}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="bg-white/10 text-white p-4 rounded-2xl hover:bg-white/20 transition-all"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {/* LISTAGEM DE CATEGORIAS */}
            <section className="grid gap-3">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-2">Categorias Ativas ({categories.length})</h2>
                {categories.length === 0 ? (
                    <div className="text-center py-10 text-gray-600 border-2 border-dashed border-white/5 rounded-3xl">
                        Nenhuma categoria cadastrada.
                    </div>
                ) : (
                    categories.map((cat: any) => (
                        <div
                            key={cat.id}
                            className="flex justify-between items-center p-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/[0.08] transition-all shadow-sm"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-lg dark:text-white group-hover:text-blue-400 transition-colors">
                                    {cat.name}
                                </span>
                                <div className="flex gap-3 text-xs text-gray-500 font-mono mt-1">
                                    <span>slug: {cat.slug}</span>
                                    <span>•</span>
                                    <span>{cat.products_count || 0} produtos</span>
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(cat)}
                                    className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                    title="Editar"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}