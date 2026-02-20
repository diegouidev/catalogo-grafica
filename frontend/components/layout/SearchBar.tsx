"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/services/api";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);

    // Fecha o dropdown se clicar fora dele
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // A mágica do Debounce (Busca Dupla: Produtos + Kits)
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Dispara as duas buscas AO MESMO TEMPO
                const [productsRes, kitsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/?search=${query}`).catch(() => null),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/kits/?search=${query}`).catch(() => null)
                ]);

                // Extrai os dados
                const productsData = productsRes?.ok ? await productsRes.json() : { results: [] };
                const kitsData = kitsRes?.ok ? await kitsRes.json() : { results: [] };

                const productsList = productsData.results || productsData || [];
                const kitsList = kitsData.results || kitsData || [];

                // Formata os Produtos
                const formattedProducts = productsList.map((p: any) => ({
                    ...p,
                    itemType: 'product',
                    url: `/produto/${p.slug}`,
                    badge: p.category_name
                }));

                // Formata os Kits
                const formattedKits = kitsList.map((k: any) => ({
                    ...k,
                    itemType: 'kit',
                    url: `/kit/${k.slug}`,
                    badge: '⭐ KIT ESPECIAL'
                }));

                // Junta tudo (Kits primeiro, depois Produtos) e pega os 6 primeiros
                const combinedResults = [...formattedKits, ...formattedProducts];

                setResults(combinedResults);
                setIsOpen(true);

            } catch (error) {
                console.error("Erro na busca conjunta:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="relative w-full max-w-md hidden md:block" ref={searchRef}>
            {/* Input de Busca */}
            <div className="relative group">
                <input
                    type="text"
                    placeholder="Busque por produtos ou kits..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setIsOpen(true) }}
                    className="w-full bg-[#0f111a] border border-white/10 group-hover:border-brand-blue/50 rounded-full py-2.5 pl-5 pr-12 text-white text-sm focus:border-brand-blue focus:outline-none transition-all placeholder:text-gray-500 shadow-inner"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {isLoading ? <Loader2 size={18} className="animate-spin text-brand-blue" /> : <Search size={18} className="group-hover:text-brand-blue transition-colors" />}
                </div>
            </div>

            {/* Dropdown de Resultados */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0b14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {results.length > 0 ? (
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {results.slice(0, 6).map((item, index) => (
                                <Link
                                    key={`${item.itemType}-${item.id}-${index}`}
                                    href={item.url}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setQuery("");
                                    }}
                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors group"
                                >
                                    <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/50 border ${item.itemType === 'kit' ? 'border-yellow-500/50' : 'border-white/5'}`}>
                                        <img
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                            onError={(e) => { e.currentTarget.src = "/logo-oficial.png"; }}
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h4 className={`text-sm font-bold truncate transition-colors ${item.itemType === 'kit' ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-white group-hover:text-brand-blue'}`}>
                                            {item.name}
                                        </h4>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest block truncate ${item.itemType === 'kit' ? 'text-yellow-500/80' : 'text-gray-400'}`}>
                                            {item.badge}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {results.length > 6 && (
                                <div className="text-center p-2 border-t border-white/5 mt-2">
                                    <span className="text-[10px] text-brand-blue font-bold uppercase">Ver mais resultados...</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-gray-400 text-sm">Nenhum resultado encontrado para "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}