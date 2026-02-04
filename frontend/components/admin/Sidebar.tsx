"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    PackagePlus,
    Image as ImageIcon,
    Settings,
    LogOut,
    ChevronRight,
    Store,
    Tag
} from "lucide-react";
import Cookies from 'js-cookie';

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Produtos", icon: PackagePlus, path: "/admin/produtos" },
    { name: "Categorias", icon: Tag, path: "/admin/categorias" },
    { name: "Banners", icon: ImageIcon, path: "/admin/banners" },
    { name: "Minha Gráfica", icon: Store, path: "/admin/config" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // Limpa a sessão em ambos os locais para garantir a segurança
        localStorage.removeItem("token");
        Cookies.remove('auth_token', { path: '/' });
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <aside className="w-64 min-h-screen bg-white dark:bg-[#0a0b14] border-r border-gray-100 dark:border-white/10 flex flex-col transition-all">
            {/* Área do Logo */}
            <div className="p-8 border-b dark:border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                    <span className="text-white font-black text-xl">C</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-black dark:text-white text-sm tracking-tight uppercase">Cloud Admin</span>
                    <span className="text-[10px] text-brand-blue font-bold uppercase tracking-widest leading-none">Controle</span>
                </div>
            </div>

            {/* Navegação Principal */}
            <nav className="flex-grow p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive
                                ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-brand-blue"} />
                                <span className="font-bold text-sm">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight size={16} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Botão de Sair */}
            <div className="p-4 border-t dark:border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-4 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                >
                    <LogOut size={20} />
                    Sair do Sistema
                </button>
            </div>
        </aside>
    );
}