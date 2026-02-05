"use client";
import { useState, useEffect, useCallback } from "react";
import { Layers, Plus, Trash2, Save, X, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';

export default function FinishingsAdmin() {
    const [finishings, setFinishings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const API_URL = "http://127.0.0.1:8000/api/finishings/";
    const token = Cookies.get('auth_token');

    const loadFinishings = useCallback(async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setFinishings(data);
        } catch (error) {
            toast.error("Erro ao carregar acabamentos");
        }
    }, []);

    useEffect(() => { loadFinishings(); }, [loadFinishings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

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
                body: JSON.stringify({ name })
            });

            if (res.ok) {
                toast.success(editingId ? "Atualizado!" : "Criado!");
                setName("");
                setEditingId(null);
                loadFinishings();
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
        if (!confirm("Excluir este acabamento?")) return;
        try {
            const res = await fetch(`${API_URL}${id}/`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Removido!");
                loadFinishings();
            }
        } catch (error) {
            toast.error("Erro ao excluir.");
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto space-y-10">
            <header>
                <h1 className="text-3xl font-black text-white flex items-center gap-3 italic tracking-tighter">
                    <Layers className="text-brand-blue" /> ACABAMENTOS
                </h1>
                <p className="text-gray-500 mt-2 text-sm uppercase font-bold tracking-widest">
                    Gerencie opções como Verniz, Laminação, Corte Especial.
                </p>
            </header>

            {/* FORMULÁRIO */}
            <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Ex: Verniz Localizado, Canteira Arredondada..."
                        className="flex-1 p-4 rounded-2xl bg-black/40 border border-white/10 text-white outline-none focus:border-brand-blue transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-blue/20"
                    >
                        {loading ? "..." : editingId ? <><Save size={20} /> SALVAR</> : <><Plus size={20} /> ADICIONAR</>}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setName(""); }} className="bg-white/10 text-white p-4 rounded-2xl">
                            <X size={20} />
                        </button>
                    )}
                </form>
            </section>

            {/* LISTAGEM */}
            <div className="grid gap-3">
                {finishings.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-[1.8rem] group hover:bg-white/[0.07] transition-all">
                        <span className="font-bold text-lg text-white group-hover:text-brand-blue transition-colors">
                            {item.name}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingId(item.id); setName(item.name); }} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                                <Pencil size={18} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}