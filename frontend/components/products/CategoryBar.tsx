"use client";

interface CategoryBarProps {
    categories: any[];
    selectedCategory: string;
    onSelectCategory: (slug: string) => void;
}

export default function CategoryBar({ categories, selectedCategory, onSelectCategory }: CategoryBarProps) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            <button
                onClick={() => onSelectCategory("todos")}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedCategory === "todos"
                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                    }`}
            >
                Todos
            </button>

            {categories.map((cat: any) => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.slug)}
                    className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedCategory === cat.slug
                        ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30"
                        : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                        }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}