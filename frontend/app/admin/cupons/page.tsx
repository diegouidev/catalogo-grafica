"use client";
import { useState, useEffect, useCallback } from "react";
import { Ticket, Plus, Trash2, X, Save, Percent } from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';

export default function CouponAdmin() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estado para criação/edição
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        code: "",
        discount_percentage: ""
    });

    const API_URL = "http://127.0.0.1:8000/api/coupons/";
    const token = Cookies.get('auth_token');

    const loadCoupons = useCallback(async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setCoupons(data);
        } catch (error) {
            toast.error("Erro ao carregar cupons");
        }
    }, []);

    useEffect(() => { loadCoupons(); }, [loadCoupons]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code.trim()) return;

        setLoading(true);
        // O seu ViewSet usa ModelViewSet, então suporta POST e PUT/PATCH
        const method = editingId ? "PATCH" : "POST";
        const url = editingId ? `${API_URL}${editingId}/` : API_URL;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: formData.code.toUpperCase().replace(/\s/g, ''),
                    discount_percentage: parseInt(formData.discount_percentage)
                })
            });

            if (res.ok) {
                toast.success(editingId ? "Cupom atualizado!" : "Cupom criado!");
                setFormData({ code: "", discount_percentage: "" });
                setEditingId(null);
                loadCoupons();
            } else {
                toast.error("Erro ao salvar. Verifique se o código já existe.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Deseja realmente remover este cupom?")) return;

        try {
            const res = await fetch(`${API_URL}${id}/`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Cupom removido!");
                loadCoupons();
            }
        } catch (error) {
            toast.error("Erro ao excluir.");
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto space-y-10">
            <header>
                <h1 className="text-3xl font-black dark:text-white flex items-center gap-3 italic tracking-tighter">
                    <Ticket className="text-brand-blue" /> GERENCIAR CUPONS
                </h1>
                <p className="text-gray-500 mt-2 text-sm uppercase font-bold tracking-widest">Crie descontos para seus clientes da Cloud Design.</p>
            </header>

            {/* FORMULÁRIO */}
            <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="text-gray-500 text-[10px] font-black uppercase mb-2 block ml-2">Código do Cupom</label>
                        <input
                            type="text"
                            placeholder="EX: CLOUD10"
                            className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white outline-none focus:border-brand-blue transition-all uppercase"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            required
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-gray-500 text-[10px] font-black uppercase mb-2 block ml-2">Desconto (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="10"
                                className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white outline-none focus:border-brand-blue transition-all"
                                value={formData.discount_percentage}
                                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                                required
                            />
                            <Percent size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue" />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[58px] bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-blue/20"
                        >
                            {loading ? "..." : editingId ? <><Save size={20} /> SALVAR</> : <><Plus size={20} /> CRIAR</>}
                        </button>
                    </div>
                </form>
            </section>

            {/* LISTAGEM */}
            <div className="grid gap-3">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Cupons Ativos</h2>
                {coupons.map((cupom: any) => (
                    <div
                        key={cupom.id}
                        className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-[1.8rem] group hover:bg-white/[0.07] transition-all"
                    >
                        <div>
                            <span className="font-black text-xl text-white tracking-tighter group-hover:text-brand-blue transition-colors">
                                {cupom.code}
                            </span>
                            <p className="text-green-500 font-bold text-xs uppercase tracking-widest mt-1">
                                {cupom.discount_percentage}% de desconto
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDelete(cupom.id)}
                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}