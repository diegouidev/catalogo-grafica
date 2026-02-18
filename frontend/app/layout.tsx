import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import Analytics from "@/components/Analytics";
import ExitIntentPopup from "@/components/layout/ExitIntentPopup";
import { CartProvider } from "@/context/CartContext"; // Importando o novo Provider
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';

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
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
            {children}
            <Toaster position="bottom-center" />
            <ExitIntentPopup />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}