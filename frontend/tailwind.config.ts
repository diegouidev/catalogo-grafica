import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class', // Ativa o suporte a troca de tema por classe
    theme: {
        extend: {
            colors: {
                // Cores extraídas da logo Cloud Design
                brand: {
                    blue: "#00AEEF",    // Azul claro da nuvem
                    navy: "#1A1B35",    // Marinho profundo do fundo da logo
                    white: "#F8F9FA",
                },
            },
        },
    },
    plugins: [],
};
export default config;