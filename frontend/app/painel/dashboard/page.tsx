"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trophy, Package, ArrowLeft } from "lucide-react";
import { getImageUrl } from "@/services/api";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const BASE_URL = API_URL.replace(/\/api$/, "");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/admin/login");
            return;
        }

        fetch(`${API_URL}/dashboard/stats/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Erro na autenticação");
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem("token");
                router.push("/admin/login");
            });
    }, [router]);

    if (loading) return <div className="p-10 dark:text-white font-bold text-center">Carregando métricas da Cloud Design...</div>;

    // Proteção: Se stats carregar mas não tiver a estrutura esperada
    if (!stats || !stats.ranking) {
        return <div className="p-10 text-white text-center">Nenhum dado disponível no momento.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#05060a] p-4 md:p-10">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black dark:text-white text-brand-blue uppercase tracking-tighter">Analytics Cloud</h1>
                    <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-blue transition-all">
                        <ArrowLeft size={16} /> Voltar ao Site
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-brand-blue p-8 rounded-[2rem] text-white shadow-xl shadow-brand-blue/20">
                        <Eye size={32} className="mb-4 opacity-50" />
                        <p className="text-sm font-bold uppercase tracking-widest opacity-80">Visualizações Totais</p>
                        <p className="text-5xl font-black mt-2 tracking-tighter">{stats.total_catalog_views || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10">
                        <Package size={32} className="mb-4 text-brand-blue" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Produtos Rankeados</p>
                        <p className="text-5xl font-black mt-2 dark:text-white tracking-tighter">{stats.ranking?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/10 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                        <Trophy className="text-yellow-500" /> Top Produtos (Mais Vistos)
                    </h2>

                    <div className="space-y-4">
                        {stats.ranking.map((prod: any, index: number) => {
                            const imageUrl = getImageUrl(prod.image);
                            return (
                                <div key={prod.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-brand-blue/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-brand-blue w-6 text-lg">#{index + 1}</span>
                                        <div className="w-14 h-14 rounded-xl overflow-hidden relative border dark:border-white/10">
                                            <img 
                                                src={imageUrl} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                                alt={prod.name}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/logo-oficial.png";
                                                }}
                                            />
                                        </div>
                                        <p className="font-bold dark:text-white">{prod.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black dark:text-white text-brand-blue">{prod.views_count} <span className="text-[10px] text-gray-400 uppercase">views</span></p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}