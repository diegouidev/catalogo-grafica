// frontend/components/admin/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Tags,
    Image as ImageIcon,
    Settings,
    LogOut,
    Ticket,
    Layers,
    ExternalLink
} from "lucide-react";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { name: "Produtos", icon: Package, path: "/admin/produtos" },
        { name: "Categorias", icon: Tags, path: "/admin/categorias" },
        { name: "Acabamentos", icon: Layers, path: "/admin/acabamentos" },
        { name: "Banners", icon: ImageIcon, path: "/admin/banners" },
        { name: "Cupons", icon: Ticket, path: "/admin/cupons" }, // Novo item adicionado
        { name: "Configurações", icon: Settings, path: "/admin/configuracoes" },
    ];

    const handleLogout = () => {
        Cookies.remove('auth_token');
        localStorage.removeItem("token");
        router.push("/admin/login");
    };

    return (
        <aside className="w-72 bg-[#0a0b14] border-r border-white/5 flex flex-col h-screen sticky top-0">
            {/* Logo / Nome da Gráfica */}
            <div className="p-8">
                <h1 className="text-white font-black text-2xl italic tracking-tighter flex items-center gap-2">
                    CLOUD <span className="text-brand-blue">DESIGN</span>
                </h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Admin Panel</p>
            </div>

            {/* Menu de Navegação */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all group ${isActive
                                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon size={20} className={`${isActive ? "text-white" : "text-brand-blue group-hover:scale-110 transition-transform"}`} />
                            <span className="text-sm uppercase tracking-widest">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Ações de Rodapé */}
            <div className="p-6 border-t border-white/5 space-y-2">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-brand-blue transition-colors text-xs uppercase tracking-widest"
                >
                    <ExternalLink size={18} />
                    Ver Catálogo
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 text-red-500 font-bold hover:bg-red-500/10 rounded-2xl transition-all text-xs uppercase tracking-widest"
                >
                    <LogOut size={18} />
                    Sair do Sistema
                </button>
            </div>
        </aside>
    );
}