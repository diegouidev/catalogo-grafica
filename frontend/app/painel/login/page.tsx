// frontend/app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from 'js-cookie';

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                const data = await res.json();

                // SALVAMENTO OBRIGATÓRIO: Adicione o path: '/'
                Cookies.set('auth_token', data.access, {
                    expires: 1,
                    path: '/', // Permite que o layout.tsx e o proxy.ts leiam o cookie
                    sameSite: 'lax'
                });

                localStorage.setItem("token", data.access);
                router.push("/painel/dashboard");
            } else {
                setError("Usuário ou senha inválidos.");
            }
        } catch (err) {
            setError("Erro ao conectar com o servidor.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0b14] p-4">
            <div className="w-full max-w-md bg-white/5 p-8 rounded-[2.5rem] shadow-2xl border border-white/10 backdrop-blur-md">
                <div className="flex flex-col items-center mb-8">
                    <Image src="/logo-oficial.png" alt="Cloud Design" width={180} height={60} />
                    <h1 className="mt-6 text-2xl font-black text-white text-center">Painel Administrativo</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Usuário"
                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:ring-2 focus:ring-brand-blue"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:ring-2 focus:ring-brand-blue"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-brand-blue text-white py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        ENTRAR NO SISTEMA
                    </button>
                </form>
            </div>
        </div>
    );
}