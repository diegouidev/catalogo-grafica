"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [term, setTerm] = useState(searchParams.get('search') || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Manipula a URL mantendo a categoria se existir
        const params = new URLSearchParams(searchParams.toString());
        
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        
        router.push(`/?${params.toString()}`, { scroll: false });
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto mb-8">
            <input 
                type="text" 
                placeholder="O que você procura hoje?" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-12 text-white focus:border-brand-blue outline-none transition-all"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <button type="submit" className="hidden">Buscar</button>
        </form>
    );
}