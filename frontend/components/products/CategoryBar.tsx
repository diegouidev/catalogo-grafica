"use client";

interface CategoryBarProps {
    categories: any[];
    selectedCategory: string;
    onSelectCategory: (slug: string) => void;
}

export default function CategoryBar({ categories, selectedCategory, onSelectCategory }: CategoryBarProps) {
    return (
        <div className="w-full overflow-hidden">
            {/* O 'no-scrollbar' deve estar no seu globals.css para esconder a barra, 
                mas 'overflow-x-auto' garante que funcione o touch */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar touch-pan-x">
                <button
                    onClick={() => onSelectCategory("todos")}
                    className={`px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-bold uppercase tracking-widest transition-all border ${selectedCategory === "todos"
                        ? "bg-brand-blue border-brand-blue text-white shadow-[0_0_20px_rgba(0,174,239,0.3)]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                >
                    Todos
                </button>

                {categories.map((cat: any) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.slug)}
                        className={`px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-bold uppercase tracking-widest transition-all border ${selectedCategory === cat.slug
                            ? "bg-brand-blue border-brand-blue text-white shadow-[0_0_20px_rgba(0,174,239,0.3)]"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}