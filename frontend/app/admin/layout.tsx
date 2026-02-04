// frontend/app/admin/layout.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // Importe usePathname
import Sidebar from "@/components/admin/Sidebar";
import Cookies from 'js-cookie';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname(); // Pega a rota atual

    useEffect(() => {
        const token = Cookies.get('auth_token');

        // Se for a página de login, não precisa validar token aqui
        if (pathname === "/admin/login") {
            setAuthorized(true);
            return;
        }

        if (!token) {
            router.push("/admin/login");
        } else {
            setAuthorized(true);
        }
    }, [router, pathname]);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center text-white font-bold">
                Verificando credenciais...
            </div>
        );
    }

    // Se estiver no login, renderiza apenas o formulário (sem a Sidebar)
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#05060a]">
            <Sidebar />
            <main className="flex-grow overflow-y-auto">
                {children}
            </main>
        </div>
    );
}