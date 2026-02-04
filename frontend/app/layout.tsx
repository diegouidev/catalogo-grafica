import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { CartProvider } from "@/context/CartContext"; // Importando o novo Provider
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Cloud Design - Catálogo Online",
  description: "Transformando criatividade em arte",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <ThemeProvider>
          <CartProvider>
            {children}
            <Toaster position="bottom-center" /> {/* Adicione aqui */}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}